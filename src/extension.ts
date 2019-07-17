import * as vscode from 'vscode';
import { recordPageView } from './utils/visitor';
import { initProject } from './commands/initProject';
import { createFunction } from './commands/createFunction';
import { gotoFunctionCode } from './commands/gotoFunctionCode';
import { gotoFunctionTemplate } from './commands/gotoFunctionTemplate';
import { gotoServiceTemplate } from './commands/gotoServiceTemplate';
import { deploy } from './commands/deploy';
import { localInvokeFunction } from './commands/localInvokeFunction';
import { localDebugFunction } from './commands/localDebugFunction';
import { remoteInvokeFunction } from './commands/remoteInvokeFunction';
import { bindAccount } from './commands/bindAccount';
import { switchAccount } from './commands/switchAccount';
import { switchRegion } from './commands/switchRegion';
import { switchRegionOrAccount } from './commands/switchRegionOrAccount';
import { switchOrBindAccount } from './commands/switchOrBindAccount';
import { showRegionStatus } from './commands/showRegionStatus';
import { LocalResourceProvider } from './tree/LocalResourceProvider';
import { RemoteResourceProvider } from './tree/RemoteResourceExplorer';

export function activate(context: vscode.ExtensionContext) {
  recordPageView('/');

  const cwd = vscode.workspace.rootPath;

  const localResourceProvider = new LocalResourceProvider(cwd);
  vscode.window.registerTreeDataProvider('fcLocalResource', localResourceProvider);
  vscode.commands.registerCommand('fc.extension.localResource.refresh', () => localResourceProvider.refresh());

  const remoteResourceProvider = new RemoteResourceProvider();
  vscode.window.registerTreeDataProvider('fcRemoteResource', remoteResourceProvider);
  vscode.commands.registerCommand('fc.extension.remoteResource.refresh', () => remoteResourceProvider.refresh());

  initProject(context); // init project
  createFunction(context); // create function
  gotoFunctionCode(context); // goto function code
  gotoFunctionTemplate(context); // goto function template
  gotoServiceTemplate(context); // goto service template
  deploy(context); // deploy
  localInvokeFunction(context); // local invoke function
  localDebugFunction(context); // local debug function
  remoteInvokeFunction(context); // remote invoke function
  bindAccount(context); // bind account
  switchRegion(context); // switch region
  showRegionStatus(context); // show region status
  switchRegionOrAccount(context); // switch region or account
  switchOrBindAccount(context); // switch or bind account
  switchAccount(context); // switch account

  vscode.commands.executeCommand('fc.extension.show.region.status');
}

// this method is called when your extension is deactivated
export function deactivate() {}
