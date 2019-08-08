import * as vscode from 'vscode';
import { ext } from './extensionVariables';
import { serverlessCommands } from './utils/constants';
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
import { ServerlessLensProvider } from './lens/ServerlessLensProvider';
import { ServerlessDefinitionProvider } from './definitions/ServerlessDefinitionProvider';
import { ServerlessCompletionProvider } from './completions/ServerlessCompletionProvider';
import { ServerlessDiagnosticsProvider } from './diagnostics/ServerlessDiagnosticsProvider';
import { LocalResourceProvider } from './tree/LocalResourceProvider';
import { RemoteResourceProvider } from './tree/RemoteResourceExplorer';
import { showRemoteFunctionInfo, clearRemoteFunctionInfo } from './commands/showRemoteFunctionInfo';
import { showRemoteServiceInfo, clearRemoteServiceInfo } from './commands/showRemoteServiceInfo';
import { importService } from './commands/importService';
import { importFunction } from './commands/importFunction';
import { viewDocumentation } from './commands/viewDocumentation';
import { viewSource } from './commands/viewSource';
import { reportIssue } from './commands/reportIssue';
import { viewQuickStart } from './commands/viewQuickStart';
import { showUpdateNotification } from './commands/showUpdateNotification';

export function activate(context: vscode.ExtensionContext) {
  recordPageView('/');
  ext.context = context;
  const cwd = vscode.workspace.rootPath;

  const localResourceProvider = new LocalResourceProvider(cwd);
  vscode.window.registerTreeDataProvider('fcLocalResource', localResourceProvider);
  vscode.commands.registerCommand(serverlessCommands.REFRESH_LOCAL_RESOURCE.id,
    () => localResourceProvider.refresh()
  );

  const remoteResourceProvider = new RemoteResourceProvider();
  vscode.window.registerTreeDataProvider('fcRemoteResource', remoteResourceProvider);
  vscode.commands.registerCommand(serverlessCommands.REFRESH_REMOTE_RESOURCE.id,
    () => remoteResourceProvider.refresh()
  );

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
  switchRegionOrAccount(context);
  switchOrBindAccount(context); // switch or bind account
  switchAccount(context); // switch account
  showRemoteFunctionInfo(context); // show remote function info
  clearRemoteFunctionInfo(context);
  showRemoteServiceInfo(context); // show remote service info
  clearRemoteServiceInfo(context);
  importService(context);
  importFunction(context);
  viewQuickStart(context);
  viewDocumentation(context);
  viewSource(context);
  reportIssue(context);
  showUpdateNotification(context);

  vscode.commands.executeCommand(serverlessCommands.SHOW_REGION_STATUS.id);
  vscode.commands.executeCommand(serverlessCommands.SHOW_UPDATE_NOTIFICATION.id);
  vscode.languages.registerCodeLensProvider(['javascript', 'python', 'php'], new ServerlessLensProvider(cwd));

  const selector = { pattern: '**/template.{yml,yaml}' };
  vscode.languages.registerDefinitionProvider(
    selector,
    new ServerlessDefinitionProvider()
  );
  vscode.languages.registerCompletionItemProvider(
    selector,
    new ServerlessCompletionProvider(),
  );
  new ServerlessDiagnosticsProvider().startDiagnostic();
}

// this method is called when your extension is deactivated
export function deactivate() {}
