import * as vscode from 'vscode';
import * as terminalService from '../utils/terminal';
import * as open from 'open';

export class FunService {
  constructor (private workspace: string) {

  }

  init(runtime: string) {
    const terminal = terminalService.getFunctionComputeTerminal();
    if (!this.validateInitRumtime(runtime)) {
      vscode.window.showErrorMessage(`${runtime} is not valid runtime`);
    }
    const command = `fun init helloworld-${runtime}`;
    terminal.sendText(command);
    terminal.show();
  }

  deploy() {
    const terminal = terminalService.getFunctionComputeTerminal();
    const command = 'fun deploy -t ./template.yml';
    terminal.sendText(command);
    terminal.show();
  }

  localInvoke(serviceName: string, functionName: string, eventFilePath: string) {
    const terminal =  terminalService.getFunctionComputeTerminal();
    const command = `fun local invoke ${serviceName}/${functionName} -e ${eventFilePath}`
    terminal.sendText(command);
    terminal.show();
  }

  localInvokeDebug(serviceName: string, functionName: string,
    debugPort: string, eventFilePath: string): vscode.Terminal {
    const terminal =  terminalService.getFunctionComputeTerminal();
    const command = `fun local invoke ${serviceName}/${functionName} -d ${debugPort} -e ${eventFilePath}`
    terminal.sendText(command);
    terminal.show();
    return terminal;
  }

  localStart(serviceName: string, functionName: string) {
    const terminal = terminalService.getFunctionComputeTerminal();
    let command = 'fun local start';
    terminal.sendText(command);

    setTimeout(() => {
      const workerTerminal = terminalService.getFunctionComputeWorkderTerminal();
      command = `open http://localhost:8000/2016-08-15/proxy/${serviceName}/${functionName}/`;
      workerTerminal.sendText(command);
    }, 2000);

    terminal.show();
  }

  localStartDebug(serviceName: string, functionName: string, debugPort: string): vscode.Terminal {
    const terminal = terminalService.getFunctionComputeTerminal();
    let command = `fun local start -d ${debugPort}`;
    terminal.sendText(command);

    setTimeout(() => {
      (async () => {
        await open(`http://localhost:8000/2016-08-15/proxy/${serviceName}/${functionName}/`)
      })()
    }, 2000);

    terminal.show();
    return terminal;
  }

  private validateInitRumtime(runtime: string): boolean {
    const runtimes = ['nodejs8', 'nodejs6', 'python3', 'python2.7', 'java8', 'php7.2'];
    return runtimes.includes(runtime);
  }
}
