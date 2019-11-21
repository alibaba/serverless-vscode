import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as rt from '../utils/runtime';
import * as Docker from 'dockerode';
import { ext } from '../extensionVariables';
import { serverlessCommands } from '../utils/constants';
import { isPathExists, createDirectory, createLaunchFile, createEventFile } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { getOrInitEventConfig } from '../utils/localConfig';
import { cpUtils } from '../utils/cpUtils';
import { FunService } from '../services/FunService';
import { TemplateService } from '../services/TemplateService';
import { Resource, ResourceType, FunctionResource } from '../models/resource';

const { resolveRuntimeToDockerImage } = require('@alicloud/fun/lib/docker-opts.js');
const debugPortSet = new Set();
let docker: Docker | undefined;
// Win7 下 DockerToolbox 不支持
// https://github.com/docker/toolbox/issues/537
try {
  docker = new Docker();
} catch (ex) {
  vscode.window.showErrorMessage(ex.message);
}

const EXTENSION_PYTHON_DEBUG = 'ms-python.python';
const EXTENSION_PHP_DEBUG = 'felixfbecker.php-debug';
const EXTENSION_JAVA_DEBUG = 'vscjava.vscode-java-debug';
let autoCheckPythonDebugger = true;
let autoCheckPhpDebugger = true;
let autoCheckJavaDebugger = true;

export function localDebugFunction(context: vscode.ExtensionContext) {
  const debugManager = new LocalDebugManager();
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.LOCAL_DEBUG.id,
    async (node: Resource, eventFilePath: string | undefined, reuse: boolean = false, debugPort?: number) => {
      recordPageView('/localDebug');
      if (node.resourceType !== ResourceType.Function) {
        return;
      }
      const funcRes = node as FunctionResource;
      await debugManager.localDebug(
        funcRes.serviceName, funcRes.functionName,
        funcRes.templatePath as string, eventFilePath,
        reuse, debugPort,
      ).catch(ex => vscode.window.showErrorMessage(ex.message));;
    })
  );
  vscode.debug.onDidStartDebugSession(debugSession => {
    debugPortSet.add(debugSession.configuration.port);
  });
  vscode.debug.onDidTerminateDebugSession(debugSession => {
    debugPortSet.delete(debugSession.configuration.port);
  });
}

class LocalDebugManager {
  async localDebug(
    serviceName: string, functionName: string,
    templatePath: string, eventFilePath?: string,
    reuse?: boolean, debugPort?: number,
  ) {
    if (!ext.cwd) {
      throw new Error('Please open a workspace');
    }
    const templateService = new TemplateService(templatePath);
    const functionInfo = await templateService.getFunction(serviceName, functionName);
    if (!this.validateFunctionInfo(functionInfo)) {
      throw new Error(`Please complete ${serviceName}/${functionName} properties`);
    }
    const { Properties: properties } = functionInfo;
    const { Runtime: runtime } = properties;

    const debugHelper = this.getLocalDebugHelper(runtime);

    if (!await debugHelper.checkDebugExtensionInstalled()) {
      return;
    }

    let debugConfiguration: vscode.DebugConfiguration | undefined
      = debugHelper.getCustomizedDebugConfiguration(serviceName, functionName);
    if (!debugConfiguration) {
      debugConfiguration = await debugHelper.generateDefaultDebugConfiguration(
        serviceName,
        functionName,
        functionInfo,
        templatePath,
      );
    }
    debugConfiguration.port = debugPort || debugConfiguration.port;

    const hasHttpTrigger = this.hasHttpTrigger(functionInfo);
    if (!hasHttpTrigger) {
      eventFilePath = await this.getAndCreateEventFile(
        serviceName,
        functionName,
        functionInfo,
        templatePath,
        eventFilePath,
      );
    }

    await debugHelper.startDebugging(
      serviceName, functionName, runtime, templatePath,
      hasHttpTrigger, eventFilePath, debugConfiguration,
      debugPort, reuse,
    );

  }

  getLocalDebugHelper(runtime: string): AbstractLocalDebugHelper {
    if (rt.isNodejs(runtime)) {
      return new NodejsLocalDebugHelper();
    }
    if (rt.isPython(runtime)) {
      return new PythonLocalDebugHelper();
    }
    if (rt.isPhp(runtime)) {
      return new PhpLocalDebugHelper();
    }
    if (rt.isJava(runtime)) {
      return new JavaLocalDebugHelper();
    }
    throw new Error(`${runtime} runtime Local Debug will be supported soon`);
  }

  validateFunctionInfo(info: any): boolean {
    return info && info.Properties;
  }

  hasHttpTrigger(functionInfo: any): boolean {
    let hasHttpTrigger = false;
    if (functionInfo.Events) {
      Object.entries(functionInfo.Events).forEach(([_, resource]) => {
        if (resource && (<any>resource).Type === 'HTTP') {
          hasHttpTrigger = true;
        }
      });
    }
    return hasHttpTrigger;
  }

  async getAndCreateEventFile(
    serviceName: string,
    functionName: string,
    functionInfo: any,
    templatePath: string,
    eventFilePath?: string,
  ): Promise<string> {
    eventFilePath = eventFilePath || await getOrInitEventConfig(
      templatePath,
      serviceName,
      functionName,
      functionInfo.Properties.CodeUri
    );
    if (!isPathExists(eventFilePath)) {
      // 生成默认 event 文件
      if (!createEventFile(eventFilePath)) {
        throw new Error(`Create ${eventFilePath} event file failed`);
      }
    }
    return eventFilePath;
  }

}

abstract class AbstractLocalDebugHelper {
  abstract async checkDebugExtensionInstalled(): Promise<boolean>;
  abstract async generateDefaultDebugConfiguration(
    serviceName: string,
    functionName: string,
    functionInfo: any,
    templatePath: string,
  ): Promise<vscode.DebugConfiguration>;
  async startDebugging(
    serviceName: string,
    functionName: string,
    runtime: string,
    templatePath: string,
    hasHttpTrigger: boolean,
    eventFilePath: string | undefined,
    configuration: vscode.DebugConfiguration,
    debugPort?: number,
    reuse?: boolean,
  ) {
    const terminal: vscode.Terminal = this.executeFunLocal(
      serviceName,
      functionName,
      configuration.port,
      templatePath,
      hasHttpTrigger,
      eventFilePath,
      reuse,
    );
    if (debugPort && debugPortSet.has(debugPort)) {
      return;
    }
    await waitUntilImagePullCompleted(runtime);
    await waitUntilContainerStarted(runtime, configuration.port);
    await vscode.debug.startDebugging(undefined, configuration);
    terminal.show();
  }
  getCustomizedDebugConfiguration(serviceName: string, functionName: string): vscode.DebugConfiguration | undefined {
    const configurationName = this.generateConfigurationName(serviceName, functionName);
    const launchFilePath = path.join(ext.cwd as string, '.vscode', 'launch.json');
    const launchInfo = vscode.workspace.getConfiguration('launch', vscode.Uri.file(launchFilePath));
    const configurations = launchInfo.get('configurations') as vscode.DebugConfiguration[];
    if (!launchInfo || !configurations || !configurations.length) {
      return;
    }
    const filterConfiguration = configurations.filter(configuration => configuration.name === configurationName);
    if (filterConfiguration.length) {
      return filterConfiguration[0];
    }
    return;
  }
  generateConfigurationName(serviceName: string, functionName: string): string {
    return `fc/${serviceName}/${functionName}`;
  }
  getDefaultDebugPort(): number {
    let port = 3000 + Math.floor(Math.random() * 100);
    while (debugPortSet.has(port)) {
      port = 3000 + Math.floor(Math.random() * 100);
    }
    return port;
  }
  generateLocalRootPath(
    functionInfo: any,
    templatePath: string,
  ): string {
    const { Properties: properties } = functionInfo;
    const { CodeUri: codeUri } = properties;
    let localRootPath = path.join(path.dirname(templatePath), codeUri);
    const localRootStat = fs.statSync(localRootPath);
    if (localRootStat.isFile()) {
      localRootPath = path.dirname(localRootPath);
    }
    return localRootPath;
  }
  executeFunLocal(
    serviceName: string,
    functionName: string,
    debugPort: string,
    templatePath: string,
    hasHttpTrigger: boolean,
    eventFilePath: string | undefined,
    reuse: boolean | undefined,
  ): vscode.Terminal {
    const funService = new FunService(templatePath);
    let terminal: vscode.Terminal;
    if (hasHttpTrigger) {
      terminal = funService.localStartDebug(
        serviceName,
        functionName,
        debugPort,
      );
    } else {
      terminal = funService.localInvokeDebug(
        serviceName,
        functionName,
        debugPort,
        eventFilePath as string,
        !!reuse,
      );
    }
    return terminal;
  }
  async getInstalledExtensions(): Promise<string> {
    return await cpUtils.executeCommand(undefined, undefined, 'code', '--list-extensions');
  }
  promptInstallExtension(extensionName: string) {
    vscode.window.showInformationMessage(
      `Extension ${extensionName} should be installed to enable local debug.`,
      'OK',
    );
    vscode.commands.executeCommand(
      'workbench.extensions.action.showExtensionsWithIds', [extensionName]
    );
  }
}

class NodejsLocalDebugHelper extends AbstractLocalDebugHelper {
  async checkDebugExtensionInstalled(): Promise<boolean> {
    return true;
  }
  async generateDefaultDebugConfiguration(
    serviceName: string,
    functionName: string,
    functionInfo: any,
    templatePath: string,
  ): Promise<vscode.DebugConfiguration> {
    const { Properties: properties } = functionInfo;
    const { Runtime: runtime } = properties;
    return <vscode.DebugConfiguration> {
      name: this.generateConfigurationName(serviceName, functionName),
      type: 'node',
      request: 'attach',
      address: 'localhost',
      port: this.getDefaultDebugPort(),
      localRoot: this.generateLocalRootPath(functionInfo, templatePath),
      remoteRoot: '/code',
      protocol: runtime === 'nodejs6' ? 'legacy' : 'inspector',
      stopOnEntry: false,
    }
  }
}

class PythonLocalDebugHelper extends AbstractLocalDebugHelper {
  async checkDebugExtensionInstalled(): Promise<boolean> {
    if (!autoCheckPythonDebugger) {
      return true;
    }
    const installExtensions = await this.getInstalledExtensions();
    if (!installExtensions.includes(EXTENSION_PYTHON_DEBUG)) {
      this.promptInstallExtension(EXTENSION_PYTHON_DEBUG);
      return false;
    } else {
      autoCheckPythonDebugger = false;
      return true;
    }
  }
  async generateDefaultDebugConfiguration(
    serviceName: string,
    functionName: string,
    functionInfo: any,
    templatePath: string,
  ): Promise<vscode.DebugConfiguration> {
    return <vscode.DebugConfiguration> {
      name: this.generateConfigurationName(serviceName, functionName),
      type: 'python',
      request: 'attach',
      host: 'localhost',
      port: this.getDefaultDebugPort(),
      pathMappings: [
        {
          localRoot: this.generateLocalRootPath(functionInfo, templatePath),
          remoteRoot: '/code',
        },
      ],
      // https://stackoverflow.com/questions/56678651/visual-studio-code-python-debugging-timeout
      // https://stackoverflow.com/questions/52462599/visual-studio-code-python-timeout-waiting-for-debugger-connection
      console: 'externalTerminal',
    }
  }
}

class PhpLocalDebugHelper extends AbstractLocalDebugHelper {
  async checkDebugExtensionInstalled(): Promise<boolean> {
    if (!autoCheckPhpDebugger) {
      return true;
    }
    const installExtensions = await this.getInstalledExtensions();
    if (!installExtensions.includes(EXTENSION_PHP_DEBUG)) {
      this.promptInstallExtension(EXTENSION_PHP_DEBUG);
      return false;
    } else {
      autoCheckPhpDebugger = false;
      return true;
    }
  }
  async generateDefaultDebugConfiguration(
    serviceName: string,
    functionName: string,
    functionInfo: any,
    templatePath: string,
  ): Promise<vscode.DebugConfiguration> {
    return <vscode.DebugConfiguration> {
      name: this.generateConfigurationName(serviceName, functionName),
      type: 'php',
      request: 'launch',
      host: 'localhost',
      port: this.getDefaultDebugPort(),
      stopOnEntry: false,
      pathMappings: {
        '/code': this.generateLocalRootPath(functionInfo, templatePath),
      },
      ignore: [
        '/var/fc/runtime/**',
      ],
    }
  }
  async startDebugging(
    serviceName: string,
    functionName: string,
    runtime: string,
    templatePath: string,
    hasHttpTrigger: boolean,
    eventFilePath: string | undefined,
    configuration: vscode.DebugConfiguration,
    debugPort?: number,
    reuse?: boolean,
  ) {
    if (!debugPort || !debugPortSet.has(debugPort)) {
      await vscode.debug.startDebugging(undefined, configuration);
    }
    const terminal: vscode.Terminal = this.executeFunLocal(
      serviceName,
      functionName,
      configuration.port,
      templatePath,
      hasHttpTrigger,
      eventFilePath,
      reuse,
    );
    terminal.show();
  }
}

class JavaLocalDebugHelper extends AbstractLocalDebugHelper {
  async checkDebugExtensionInstalled(): Promise<boolean> {
    if (!autoCheckJavaDebugger) {
      return true;
    }
    const installExtensions = await this.getInstalledExtensions();
    if (!installExtensions.includes(EXTENSION_JAVA_DEBUG)) {
      this.promptInstallExtension(EXTENSION_JAVA_DEBUG);
      return false;
    } else {
      autoCheckJavaDebugger = false;
      return true;
    }
  }
  async generateDefaultDebugConfiguration(
    serviceName: string,
    functionName: string,
    functionInfo: any,
    templatePath: string,
  ): Promise<vscode.DebugConfiguration> {
    return <vscode.DebugConfiguration> {
      name: this.generateConfigurationName(serviceName, functionName),
      type: 'java',
      request: 'attach',
      hostName: 'localhost',
      port: this.getDefaultDebugPort(),
    }
  }
  async startDebugging(
    serviceName: string,
    functionName: string,
    runtime: string,
    templatePath: string,
    hasHttpTrigger: boolean,
    eventFilePath: string | undefined,
    configuration: vscode.DebugConfiguration,
    debugPort?: number,
    reuse?: boolean,
  ) {
    if (hasHttpTrigger) {
      throw new Error('Java HTTP trigger debug will be supported soon.');
    }
    const terminal: vscode.Terminal = this.executeFunLocal(
      serviceName,
      functionName,
      configuration.port,
      templatePath,
      hasHttpTrigger,
      eventFilePath,
      reuse,
    );
    if (debugPort && debugPortSet.has(debugPort)) {
      return;
    }
    await waitUntilImagePullCompleted(runtime);
    await waitUntilContainerStarted(runtime, configuration.port);
    await new Promise((resolve) => { setTimeout(resolve, 2000); });
    await vscode.debug.startDebugging(undefined, configuration);
    terminal.show();
  }
}

async function waitUntilImagePullCompleted(runtime: string) {
  const imageName: string = await resolveRuntimeToDockerImage(runtime);
  return new Promise((resolve, reject) => {
    const checkImageExist = () => {
      imageExist(imageName).then((exist) => {
        if (exist) {
          resolve();
        } else {
          setTimeout(() => {
            checkImageExist();
          }, 3000);
        }
      }).catch((ex) => {
        reject(ex);
      });
    }
    checkImageExist();
  });
}

async function waitUntilContainerStarted(runtime: string, port: number) {
  const imageName: string = await resolveRuntimeToDockerImage(runtime);
  return new Promise((resolve, reject) => {
    const checkContainerStarted = () => {
      containerStarted(imageName, port)
        .then((started) => {
          if (started) {
            resolve();
          } else {
            setTimeout(() => {
              checkContainerStarted();
            }, 3000);
          }
        })
        .catch(reject);
    }
    checkContainerStarted();
  });
}

async function containerStarted(imageName: string, port: number): Promise<boolean> {
  if (!docker) {
    return true;
  }
  const containers = await docker.listContainers({
    filters: {
      ancestor: [imageName],
      expose: [port.toString()],
    }
  });
  return containers.length > 0;
}

async function imageExist(imageName: string): Promise<boolean> {
  if (!docker) {
    return true;
  }
  const images = await docker.listImages({
    filters: {
      reference: [imageName]
    }
  });
  return images.length > 0;
}

function addDebugConfigurationToLaunchFile(debugConfiguration: vscode.DebugConfiguration) {
  let cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return <vscode.DebugConfiguration> {};
  }
  const vscodeDirPath = path.join(cwd, '.vscode');
  if (!isPathExists(vscodeDirPath)) {
    if (!createDirectory(vscodeDirPath)) {
      vscode.window.showErrorMessage('Create .vscode folder failed');
      return;
    }
  }
  const launchFilePath = path.join(cwd, '.vscode', 'launch.json');
  if (!isPathExists(launchFilePath)) {
    // 生成默认 launch.json 文件
    if (!createLaunchFile(launchFilePath)) {
      vscode.window.showErrorMessage('Create launch.json failed');
      return;
    }
  }
  const launchInfo = vscode.workspace.getConfiguration('launch', vscode.Uri.file(launchFilePath));
  const debugConfigurations = <vscode.DebugConfiguration[]>launchInfo.get('configurations');
  launchInfo.update('configurations', [...debugConfigurations, debugConfiguration]);
}
