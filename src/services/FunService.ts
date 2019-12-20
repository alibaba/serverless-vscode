import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as terminalService from '../utils/terminal';
import { getFunBin } from '../utils/fun';
import { isDirectory } from '../utils/file';

export class FunService {
  constructor (private templatePath: string) {

  }

  init(runtime: string) {
    const terminal = terminalService.getFunctionComputeTerminal();
    if (!this.validateInitRumtime(runtime)) {
      vscode.window.showErrorMessage(`${runtime} is not valid runtime`);
    }
    getFunBin().then(funBin => {
      const command = `${funBin} init event-${runtime}`;
      terminal.sendText(command);
      terminal.show();
    })
  }

  deploy(serviceName?: string, functionName? :string) {
    const terminal = terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunBin().then(funBin => {
      const command = functionName ?
        `${funBin} deploy ${serviceName}/${functionName} -t ${this.templatePath}` :
        serviceName ? `${funBin} deploy ${serviceName} -t ${this.templatePath}` :
          `${funBin} deploy -t ${this.templatePath}`;
      terminal.sendText(command);
      terminal.show();
    })
  }

  syncNas(serviceName: string, mountDir: string) {
    const terminal =  terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunBin().then(funBin => {
      const command = `${funBin} nas sync -s ${serviceName} -m ${mountDir}`;
      terminal.sendText(command);
      terminal.show();
    });
  }

  localInvoke(serviceName: string, functionName: string, eventFilePath: string, reuse: boolean) {
    const terminal =  terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunBin().then(funBin => {
      const command =
        `${funBin} local invoke ${serviceName}/${functionName} -e ${this.escapeSpace(eventFilePath)} `
        +
        (reuse ? '' : '--no-reuse');
      terminal.sendText(command);
      terminal.show();
    })
  }

  localInvokeDebug(serviceName: string, functionName: string,
    debugPort: string, eventFilePath: string, reuse: boolean): vscode.Terminal {
    const terminal =  terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunBin().then(funBin => {
      /* eslint-disable max-len */
      const command =
      `${funBin} local invoke ${serviceName}/${functionName} -d ${debugPort} -e ${this.escapeSpace(eventFilePath)} `
      +
      (reuse ? '' : '--no-reuse');
      terminal.sendText(command);
      terminal.show();
    })
    return terminal;
  }

  localStart(serviceName?: string, functionName?: string, workTerminal?: vscode.Terminal) {
    const terminal = workTerminal || terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunBin().then(funBin => {
      const command = functionName ?
        `${funBin} local start ${serviceName}/${functionName}`
        :
        `${funBin} local start`;
      terminal.sendText(command);
      terminal.show();
    })
  }

  localStartDebug(
    serviceName: string, functionName: string, debugPort: string, workTerminal?: vscode.Terminal
  ): vscode.Terminal {
    const terminal = workTerminal || terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunBin().then(funBin => {
      const command = `${funBin} local start ${serviceName}/${functionName} -d ${debugPort}`;
      terminal.sendText(command);
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
    getFunBin().then(funBin => {
      const command = `${funBin} install -r ${runtime} -p ${packageType} ${packageNames} --save`;
      terminal.sendText(command);
      terminal.show();
    });
  }

  installSbox(serviceName: string, functionName: string) {
    const terminal = terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunBin().then(funBin => {
      const command = `${funBin} install sbox -f ${serviceName}/${functionName} -i`;
      terminal.sendText(command);
      terminal.show();
    })
  }

  remoteInvokeWithEventFilePath(serviceName: string, functionName: string, eventFilePath: string) {
    const terminal =  terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunBin().then(funBin => {
      const command =
        `${funBin} invoke ${serviceName}/${functionName} -f ${this.escapeSpace(eventFilePath)}`;
      terminal.sendText(command);
      terminal.show();
    })
  }

  remoteInvokeWithStdin(serviceName: string, functionName: string) {
    const terminal =  terminalService.getFunctionComputeTerminal(path.dirname(this.templatePath));
    getFunBin().then(funBin => {
      const command =
        `${funBin} invoke ${serviceName}/${functionName} -s`;
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
