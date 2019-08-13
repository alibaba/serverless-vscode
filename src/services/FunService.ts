import * as vscode from 'vscode';
import * as terminalService from '../utils/terminal';
import * as open from 'open';
import * as path from 'path';
import { getFunPath } from '../utils/fun';

export class FunService {
  constructor (private workspace: string) {

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
    const terminal = terminalService.getFunctionComputeTerminal();
    getFunPath().then(funPath => {
      const command =
        functionName ? `${funPath} deploy ${serviceName}/${functionName} -t ./template.yml` :
          serviceName ? `${funPath} deploy ${serviceName} -t ./template.yml` :
            `${funPath} deploy -t ./template.yml`;
      terminal.sendText(command);
      terminal.show();
    })
  }

  localInvoke(serviceName: string, functionName: string, eventFilePath: string) {
    const terminal =  terminalService.getFunctionComputeTerminal();
    getFunPath().then(funPath => {
      const command =
  `${funPath} local invoke ${serviceName}/${functionName} -e ${this.escapeSpace(eventFilePath)}`
      terminal.sendText(command);
      terminal.show();
    })
  }

  localInvokeDebug(serviceName: string, functionName: string,
    debugPort: string, eventFilePath: string): vscode.Terminal {
    const terminal =  terminalService.getFunctionComputeTerminal();
    getFunPath().then(funPath => {
      /* eslint-disable max-len */
      const command =
    `${funPath} local invoke ${serviceName}/${functionName} -d ${debugPort} -e ${this.escapeSpace(eventFilePath)}`
      terminal.sendText(command);
      terminal.show();
    })
    return terminal;
  }

  localStart(serviceName: string, functionName: string) {
    const terminal = terminalService.getFunctionComputeTerminal();
    getFunPath().then(funPath => {
      let command = `${funPath} local start`;
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
    const terminal = terminalService.getFunctionComputeTerminal();
    getFunPath().then(funPath => {
      let command = `${funPath} local start -d ${debugPort}`;
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

  private validateInitRumtime(runtime: string): boolean {
    const runtimes = ['nodejs8', 'nodejs6', 'python3', 'python2.7', 'java8', 'php7.2'];
    return runtimes.includes(runtime);
  }

  private escapeSpace(str: string): string {
    return str.replace(/ /g, '\\ ');
  }
}
