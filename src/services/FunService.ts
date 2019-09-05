import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as terminalService from '../utils/terminal';
import * as open from 'open';
import { getFunPath } from '../utils/fun';
import { isDirectory } from '../utils/file';

export class FunService {
  constructor (private templatePath: string) {

  }

  init(runtime: string) {
    const terminal = terminalService.getFunctionComputeTerminal();
    if (!this.validateInitRumtime(runtime)) {
      vscode.window.showErrorMessage(`${runtime} is not valid runtime`);
    }
    getFunPath().then(funPath => {
      const command = `${funPath} init helloworld-${runtime}`;
      terminal.sendText(command);
      terminal.show();
    })
  }

  deploy(serviceName?: string, functionName? :string) {
    const terminal = terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunPath().then(funPath => {
      const command = functionName ?
        `${funPath} deploy ${serviceName}/${functionName} -t ${this.templatePath}` :
        serviceName ? `${funPath} deploy ${serviceName} -t ${this.templatePath}` :
          `${funPath} deploy -t ${this.templatePath}`;
      terminal.sendText(command);
      terminal.show();
    })
  }

  syncNas(serviceName: string, mountDir: string) {
    const terminal =  terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunPath().then(funPath => {
      const command = `${funPath} nas sync -s ${serviceName} -m ${mountDir}`;
      terminal.sendText(command);
      terminal.show();
    });
  }

  localInvoke(serviceName: string, functionName: string, eventFilePath: string) {
    const terminal =  terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunPath().then(funPath => {
      const command =
        `${funPath} local invoke ${serviceName}/${functionName} -e ${this.escapeSpace(eventFilePath)}`;
      terminal.sendText(command);
      terminal.show();
    })
  }

  localInvokeDebug(serviceName: string, functionName: string,
    debugPort: string, eventFilePath: string): vscode.Terminal {
    const terminal =  terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunPath().then(funPath => {
      /* eslint-disable max-len */
      const command =
      `${funPath} local invoke ${serviceName}/${functionName} -d ${debugPort} -e ${this.escapeSpace(eventFilePath)}`;
      terminal.sendText(command);
      terminal.show();
    })
    return terminal;
  }

  localStart(serviceName: string, functionName: string) {
    const terminal = terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunPath().then(funPath => {
      const command = `${funPath} local start`;
      terminal.sendText(command);

      setTimeout(() => {
        (async () => {
          await open(`http://localhost:8000/2016-08-15/proxy/${serviceName}/${functionName}/`)
        })()
      }, 2000);

      terminal.show();
    })
  }

  localStartDebug(serviceName: string, functionName: string, debugPort: string): vscode.Terminal {
    const terminal = terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunPath().then(funPath => {
      const command = `${funPath} local start -d ${debugPort}`;
      terminal.sendText(command);

      setTimeout(() => {
        (async () => {
          await open(`http://localhost:8000/2016-08-15/proxy/${serviceName}/${functionName}/`)
        })()
      }, 2000);

      terminal.show();
    })

    return terminal;
  }

  install(runtime: string, codeUri: string, packageType: string, packageNames: string) {
    let functionDirPath = path.resolve(path.dirname(this.templatePath), codeUri);
    if (!isDirectory(functionDirPath)) {
      functionDirPath = path.dirname(functionDirPath);
    }
    const terminal = terminalService.getFunctionComputeTerminal(functionDirPath);
    getFunPath().then(funPath => {
      const command = `${funPath} install -r ${runtime} -p ${packageType} ${packageNames} --save`;
      terminal.sendText(command);
      terminal.show();
    });
  }

  installSbox(serviceName: string, functionName: string) {
    const terminal = terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunPath().then(funPath => {
      const command = `${funPath} install sbox -f ${serviceName}/${functionName} -i`;
      terminal.sendText(command);
      terminal.show();
    })
  }

  private validateInitRumtime(runtime: string): boolean {
    const runtimes = ['nodejs8', 'nodejs6', 'python3', 'python2.7', 'java8', 'php7.2'];
    return runtimes.includes(runtime);
  }

  private escapeSpace(str: string): string {
    return str.replace(/ /g, '\\ ');
  }

  private andIf(formerCmd: string, latterCmd: string) {
    if (os.platform() === 'win32') {
      const terminal = vscode.workspace.getConfiguration().get('terminal.integrated.shell.windows') as string;
      if (terminal && terminal.toLocaleLowerCase().indexOf('powershell') === -1) {
        return `${formerCmd} && ${latterCmd}`;
      } else {
        return `${formerCmd}; if($?) { ${latterCmd}; }`;
      }
    } else {
      return `${formerCmd} && ${latterCmd}`;
    }
  }
}
