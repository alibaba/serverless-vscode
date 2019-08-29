import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as dotenv from 'dotenv';
import { ext } from '../extensionVariables';
import { getFunctionComputeTerminal } from '../utils/terminal';
import { isPathExists, createJsonFile, createFile } from '../utils/file';
import { serverlessCommands, serverlessConfigs } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { isNodejs, isPython } from '../utils/runtime';

const PYTHONPATH = 'PYTHONPATH';

export function referRuntimeLib(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.REFERENCE_RUNTIME_LIB.id,
    async (runtime: string) => {
      if (!ext.cwd) {
        return;
      }
      await process(runtime).catch(ex => vscode.window.showErrorMessage(ex.message));
    }
  ));
}

async function process(runtime: string) {
  // TODO: 第一版本只支持 nodejs 以及 python runtime 的 lib 包引用提示
  if (!isNodejs(runtime)
    && !isPython(runtime)) {
    return;
  }
  if (
    !<boolean>vscode.workspace.getConfiguration().get(serverlessConfigs.ALIYUN_FC_REFERERENCE_LIB_TIP)
  ) {
    return;
  }
  const runtimeLibReferManager = isNodejs(runtime)
    ? new NodejsRuntimeLibManager(runtime) : new PythonRuntimeLibManager(runtime);
  if (!runtimeLibReferManager.needUpdate()) {
    return;
  }

  const choice = await vscode.window.showInformationMessage(
    `Do you want to reference libs that are provided by the ${runtime} runtime?`,
    'Install and Reference',
    'Cancel',
    'Don\'t show again',
  );
  if (!choice || choice === 'Cancel') {
    return;
  }
  if (choice === 'Don\'t show again') {
    vscode.window.showInformationMessage(
      `You can config ${serverlessConfigs.ALIYUN_FC_REFERERENCE_LIB_TIP} to enable this tip.`,
      'OK',
    );
    vscode.workspace.getConfiguration().update(
      serverlessConfigs.ALIYUN_FC_REFERERENCE_LIB_TIP, false);
    return;
  }
  recordPageView('referRuntimeLib');
  runtimeLibReferManager.configAndInstallLibs();
}

abstract class AbstractRuntimeLibManager {
  private correctlyConfigured: boolean | undefined;
  private libsAllInstalled: boolean | undefined;
  protected runtime: string;

  constructor(runtime: string) {
    this.runtime = runtime;
  }

  public needUpdate(): boolean {
    this.correctlyConfigured = this.isConfigured();
    if (this.correctlyConfigured) {
      this.libsAllInstalled = this.isInstalled();
      return !this.libsAllInstalled;
    }
    return true;
  }

  public configAndInstallLibs() {
    if (!this.correctlyConfigured) {
      this.config();
    }
    if (this.libsAllInstalled === undefined) {
      this.libsAllInstalled = this.isInstalled();
    }
    if (!this.libsAllInstalled) {
      this.installLibs();
      vscode.window.showInformationMessage(
        'After successfully install libs you can reload window to enable reference libs'
        + ' that are provided by the runtime', 'OK'
      );
    } else if (isNodejs(this.runtime)) {
      vscode.window.showInformationMessage(
        `Successfully reference libs that are provided by the ${this.runtime} runtime`, 'OK'
      );
    } else if (isPython(this.runtime)) {
      vscode.window.showInformationMessage(
        'Libs already been installed, you can reload window to enable reference libs'
        + ' that are provided by the runtime', 'OK'
      );
    }
  }

  protected abstract isConfigured(): boolean;
  protected abstract isInstalled(): boolean;
  protected abstract config(): any;
  protected abstract installLibs(): any;
}

class NodejsRuntimeLibManager extends AbstractRuntimeLibManager {
  constructor(runtime: string) {
    super(runtime);
  }

  public isConfigured(): boolean {
    const configFilePath = this.getConfigFilePath();
    if (!isPathExists(configFilePath)) {
      return false;
    }
    const expectedBaseUrl = this.getExpectedBaseUrl();
    const configInfo = require(configFilePath);
    const { compilerOptions: { baseUrl = '' } = {} } = configInfo;
    return  baseUrl === expectedBaseUrl;
  }

  public isInstalled(): boolean {
    const targetFilePath = this.getTargetFilePath();
    if (!isPathExists(targetFilePath)) {
      return false;
    }
    const targetPackageInfo = require(targetFilePath);
    if (!targetPackageInfo.dependencies) {
      return false;
    }
    const sourceFilePath = this.getSourceFilePath();
    const sourcePackageInfo = require(sourceFilePath);
    for (const entry of Object.entries(sourcePackageInfo.dependencies)) {
      const [packageName, version] = entry;
      if (!targetPackageInfo.dependencies[packageName] || targetPackageInfo.dependencies[packageName] !== version) {
        return false;
      }
    }
    return true;
  }

  public config(): any {
    const configFilePath = this.getConfigFilePath();
    if (!isPathExists(configFilePath)) {
      if (!createJsonFile(configFilePath)) {
        throw new Error(`Failed to create ${configFilePath}`);
      }
    }
    const configInfo = require(configFilePath);
    configInfo.compilerOptions = configInfo.compilerOptions || {};
    configInfo.compilerOptions.baseUrl = this.getExpectedBaseUrl();
    fs.writeFileSync(configFilePath, JSON.stringify(configInfo, null, 2));
  }

  public installLibs(): any {
    const targetFilePath = this.getTargetFilePath();
    if (!isPathExists(targetFilePath)) {
      if (!createJsonFile(targetFilePath)) {
        throw new Error(`Failed to create ${targetFilePath}`);
      }
    }
    const targetPackageInfo = require(targetFilePath);
    targetPackageInfo.dependencies = targetPackageInfo.dependencies || {};
    const sourceFilePath = this.getSourceFilePath();
    const sourcePackageInfo = require(sourceFilePath);
    for ( const entry of Object.entries(sourcePackageInfo)) {
      const [packageName, version] = entry;
      if (!targetPackageInfo[packageName] || targetPackageInfo[packageName] !== version) {
        targetPackageInfo[packageName] = version;
      }
    }
    fs.writeFileSync(targetFilePath, JSON.stringify(targetPackageInfo, null, 2));
    const terminal = getFunctionComputeTerminal(path.dirname(targetFilePath));
    terminal.sendText('npm install');
    terminal.show();
  }

  private getConfigFilePath(): string {
    return path.resolve(
      ext.cwd as string,
      'jsconfig.json',
    );
  }

  private getExpectedBaseUrl(): string {
    return path.resolve(
      os.homedir(), '.aliyun-serverless', 'lib',
      'nodejs', 'node_modules',
    );
  }

  private getTargetFilePath(): string {
    return path.resolve(
      os.homedir(), '.aliyun-serverless', 'lib', 'nodejs', 'package.json'
    );
  }

  private getSourceFilePath(): string {
    return path.resolve(
      ext.context.extensionPath, 'templates', 'lib', 'nodejs', 'package.json'
    );
  }
}

class PythonRuntimeLibManager extends AbstractRuntimeLibManager {
  constructor(runtime: string) {
    super(runtime);
  }

  public isConfigured(): boolean {
    const configFilePath = this.getConfigFilePath();
    if (!isPathExists(configFilePath)) {
      return false;
    }
    const expectedPythonPath = this.getExpectedPythonPath();
    const configInfo = dotenv.config({ path: configFilePath }).parsed;
    if (!configInfo || !configInfo[PYTHONPATH]
      || !configInfo[PYTHONPATH].split(path.delimiter).includes(expectedPythonPath)
    ) {
      return false;
    }
    return configInfo && !!configInfo[PYTHONPATH]
      && configInfo[PYTHONPATH].split(path.delimiter).includes(expectedPythonPath);
  }

  public isInstalled(): any {
    const targetFilePath = this.getTargetFilePath();
    if (!isPathExists(targetFilePath)) {
      return false;
    }
    const targetPackageInfo = dotenv.config({ path: targetFilePath }).parsed;
    if (!targetPackageInfo) {
      return false;
    }
    const sourceFilePath = this.getSourceFilePath();
    const sourcePackageInfo = dotenv.config({ path: sourceFilePath }).parsed as dotenv.DotenvParseOutput;
    for (const entry of Object.entries(sourcePackageInfo)) {
      const [packageName, version] = entry;
      if (!targetPackageInfo[packageName] || targetPackageInfo[packageName] !== version) {
        return false;
      }
    }
    return true;
  }

  public config(): any {
    const configFilePath = this.getConfigFilePath();
    if (!isPathExists(configFilePath)) {
      if (!createFile(configFilePath)) {
        throw new Error(`Failed to create ${configFilePath}`);
      }
    }
    const expectedPythonPath = this.getExpectedPythonPath();
    let configInfo = dotenv.config({ path: configFilePath }).parsed;
    configInfo = configInfo || {};
    configInfo[PYTHONPATH] =
      `${expectedPythonPath}${configInfo[PYTHONPATH] ? path.delimiter + configInfo[PYTHONPATH]  : ''}`;
    fs.writeFileSync(configFilePath, this.dumpObjectToKVStr(configInfo));
  }

  public installLibs(): any {
    const targetFilePath = this.getTargetFilePath();
    if (!isPathExists(targetFilePath)) {
      if (!createFile(targetFilePath)) {
        throw new Error(`Failed to create ${targetFilePath}`);
      }
    }
    let targetPackageInfo = dotenv.config({ path: targetFilePath }).parsed;
    targetPackageInfo = targetPackageInfo || {};
    const sourceFilePath = this.getSourceFilePath();
    const sourcePackageInfo = dotenv.config({ path: sourceFilePath }).parsed as dotenv.DotenvParseOutput;
    for (const entry of Object.entries(sourcePackageInfo)) {
      const [packageName, version] = entry;
      if (!targetPackageInfo[packageName] || targetPackageInfo[packageName] !== version) {
        targetPackageInfo[packageName] = version;
      }
    }
    fs.writeFileSync(targetFilePath, this.dumpObjectToKVStr(targetPackageInfo));
    const terminal = getFunctionComputeTerminal(path.dirname(targetFilePath));
    terminal.sendText(this.pipInstall());
    terminal.show();
  }

  private getConfigFilePath(): string {
    return path.resolve(
      ext.cwd as string,
      '.env',
    );
  }

  private getExpectedPythonPath(): string {
    return path.resolve(
      os.homedir(), '.aliyun-serverless', 'lib',
      this.runtime,
    );
  }

  private getTargetFilePath(): string {
    return path.resolve(
      os.homedir(), '.aliyun-serverless', 'lib', this.runtime, 'requirements.txt'
    );
  }

  private getSourceFilePath(): string {
    return path.resolve(
      ext.context.extensionPath, 'templates', 'lib', this.runtime, 'requirements.txt'
    );
  }

  private dumpObjectToKVStr(obj: { [key: string]: string }): string {
    let result = '';
    Object.entries(obj).forEach(([key, value]) => {
      result += `${key}=${value}\n`;
    });
    return result;
  }

  private pipInstall(): string {
    // 统一用 python2.7 的 pip 模块进行 install
    // python3 的版本不同会导致支持的模块版本不同
    if (os.platform() === 'win32') {
      return `py -${this.runtime === 'python2.7' ? '2' : '3'} -m pip install -r requirements.txt --target ./`;
    }
    return `python${this.runtime === 'python3' ? '3' : ''} -m pip install -r requirements.txt  --target ./ `;
  }
}
