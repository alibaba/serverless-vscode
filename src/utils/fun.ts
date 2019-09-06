import * as path from 'path';
import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs';
import * as download from 'download';
import * as unzipper from 'unzipper';
import { cpUtils  } from './cpUtils';
import { createFile, isPathExists, createDirectory } from './file';
import { ext } from '../extensionVariables';

function getFunVersion(): string {
  const packageFilePath = path.resolve(ext.context.extensionPath, 'package.json');
  const dependencies = require(packageFilePath).dependencies;
  return dependencies['@alicloud/fun'];
}

abstract class FunExecutorGenerator {
  async generate(): Promise<string>  {
    if (!this.exists() || await this.needUpdate()) {
      await this.doGenerate();
    }
    return this.getPlatformFunPath();
  }
  exists(): boolean {
    const funPath = this.getFunPath();
    return isPathExists(funPath);
  }
  getFunPath(): string {
    const funFileName = this.getExecuteFileName();
    return path.resolve(os.homedir(), '.aliyun-serverless', 'bin', funFileName);
  }
  getPlatformFunPath(): string {
    return this.getFunPath();
  }
  abstract getExecuteFileName(): string;
  abstract async needUpdate(): Promise<boolean>;
  abstract async doGenerate(): Promise<boolean>;
}

class PosixFunExecutorGenerator extends FunExecutorGenerator {
  getExecuteFileName(): string {
    return 'fun.sh';
  }
  async needUpdate(): Promise<boolean> {
    const funPath = this.getFunPath();
    const actualFunEntryPath =
      path.resolve(ext.context.extensionPath, 'node_modules', '@alicloud', 'fun', 'bin', 'fun.js');
    try {
      const electronPath = await cpUtils.executeCommand(undefined, undefined, `${funPath}`, '--electron-path');
      const funEntryPath = await cpUtils.executeCommand(undefined, undefined, `${funPath}`, '--fun-path');
      return process.argv0 !== electronPath.trim() || actualFunEntryPath !== funEntryPath.trim();
    } catch (ex) {
      return true;
    }
  }
  async doGenerate(): Promise<boolean> {
    const funEntryPath = path.resolve(ext.context.extensionPath, 'node_modules', '@alicloud', 'fun', 'bin', 'fun.js');
    const electronPath = process.argv0;
    const funPath = this.getFunPath();
    if (!isPathExists(funPath)) {
      if (!createFile(funPath)) {
        throw new Error(`Create ${funPath} fail`);
      }
    }
    try {
      fs.writeFileSync(
        funPath,
        fs.readFileSync(
          path.resolve(ext.context.extensionPath, 'templates', 'fun.sh'), 'utf8')
          .replace('{{ELECTRON}}', electronPath.replace(/ /g, '\ '))
          .replace('{{FUN}}', funEntryPath)
      )
      fs.chmodSync(funPath, 0o755);
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
      throw(err);
    }

    return true;
  }
  getPlatformFunPath(): string {
    return path.join('~', '.aliyun-serverless', 'bin', this.getExecuteFileName());
  }
}

class WindowsFunExecutorGenerator extends FunExecutorGenerator {
  FUN_VERSION = '3.0.0-beta.0';
  getExecuteFileName(): string {
    return 'fun.exe';
  }

  async needUpdate(): Promise<boolean> {
    const funPath = this.getFunPath();
    try {
      const version = await cpUtils.executeCommand(undefined, undefined, `${funPath}`, '--version');
      return version.trim() !== this.FUN_VERSION;
    } catch (ex) {
      return true;
    }
  }

  async doGenerate(): Promise<boolean> {
    const funPath = this.getFunPath();
    if (!isPathExists(path.dirname(funPath))) {
      if (!createDirectory(path.dirname(funPath))) {
        throw new Error(`Create ${path.dirname(funPath)} fail`)
      }
    }
    const funFileName = `fun-v${this.FUN_VERSION}-win-${process.arch === 'x64' ? 'x64' : 'x86'}.exe`;
    await new Promise((resolve, reject) => {
      download(`https://gosspublic.alicdn.com/fun/${funFileName}.zip`)
        .pipe(unzipper.Parse())
        .on('entry', (entry) => {
          const fileName = entry.path;
          if (fileName === funFileName) {
            entry.pipe(fs.createWriteStream(funPath, { flags: 'w' }));
          } else {
            entry.autodrain();
          }
        })
        .on('finish', () => {
          resolve(funPath);
        })
        .on('error', (err) => {
          reject(err);
        });
    }).catch(err => {
      vscode.window.showErrorMessage(err.message);
      throw(err);
    });
    return true;
  }

  getPlatformFunPath(): string {
    const terminal = vscode.workspace.getConfiguration().get('terminal.integrated.shell.windows') as string;
    if (terminal && terminal.indexOf('cmd') > -1) {
      return path.win32.join('%USERPROFILE%', '.aliyun-serverless', 'bin', 'fun.exe');
    }
    return path.posix.join('~', '.aliyun-serverless', 'bin', 'fun.exe');
  }
}

export async function getFunPath(): Promise<string> {
  const externalFunPath = getExternalFunPath();
  if (externalFunPath) {
    return externalFunPath;
  }
  let funExecutorGenerator: FunExecutorGenerator;
  if (os.platform() === 'win32') {
    funExecutorGenerator = new WindowsFunExecutorGenerator();
  } else {
    funExecutorGenerator = new PosixFunExecutorGenerator();
  }
  return funExecutorGenerator.generate();
}

function getExternalFunPath(): string | undefined {
  const externalFunPath = vscode.workspace.getConfiguration().get('aliyun.fc.fun.path');
  if (typeof externalFunPath === 'string') {
    return externalFunPath;
  }
  return;
}
