import * as vscode from 'vscode';
import { ext } from './extensionVariables';
import { serverlessCommands } from './utils/constants';
import { recordPageView } from './utils/visitor';
import { initProject } from './commands/initProject';
import { createFunction } from './commands/createFunction';
import { gotoFCConsole } from './commands/gotoFCConsole';
import { gotoFunctionCode } from './commands/gotoFunctionCode';
import { gotoTemplate } from './commands/gotoTemplate';
import { gotoFunctionDefinition } from './commands/gotoFunctionDefinition';
import { gotoServiceDefinition } from './commands/gotoServiceDefinition';
import { gotoTriggerDefinition } from './commands/gotoTriggerDefinition';
import { gotoNasDefinition } from './commands/gotoNasDefinition';
import { openNasLocalDir } from './commands/openNasLocalDir';
import { deploy } from './commands/deploy';
import { deployService } from './commands/deployService';
import { deployFunction } from './commands/deployFunction';
import { syncNas } from './commands/syncNas';
import { localInvokeFunction } from './commands/localInvokeFunction';
import { localDebugFunction } from './commands/localDebugFunction';
import { localInvokeConfig } from './commands/localInvokeConfig';
import { remoteInvokeFunction } from './commands/remoteInvokeFunction';
import { bindAccount } from './commands/bindAccount';
import { switchAccount } from './commands/switchAccount';
import { switchRegion } from './commands/switchRegion';
import { switchRegionOrAccount } from './commands/switchRegionOrAccount';
import { switchOrBindAccount } from './commands/switchOrBindAccount';
import { showRegionStatus } from './commands/showRegionStatus';
import { ServerlessLensProvider } from './lens/ServerlessLensProvider';
import { ROSTemplateDefinitionProvider } from './definitions/ROSTemplateDefinitionProvider';
import { ROSTemplateCompletionProvider } from './completions/ROSTemplateCompletionProvider';
import { FlowDefinitionCompletionProvider } from './completions/FlowDefinitionCompletionProvider';
import { FunfileCompletionProvider } from './completions/FunfileCompletionProvider';
import { ROSTemplateDiagnosticsProvider } from './diagnostics/ROSTemplateDiagnosticsProvider';
import { FlowDefinitionDiagnosticsProvider } from './diagnostics/FlowDefinitionDiagnosticsProvider';
import { RainbowDecorator } from './decorations/RainbowDecorator';
import { LocalResourceProvider } from './tree/LocalResourceProvider';
import { RemoteResourceProvider } from './tree/RemoteResourceExplorer';
import { showRemoteFunctionInfo, clearRemoteFunctionInfo } from './commands/showRemoteFunctionInfo';
import { showRemoteServiceInfo, clearRemoteServiceInfo } from './commands/showRemoteServiceInfo';
import { showRemoteTriggerInfo, clearRemoteTriggerInfo } from './commands/showRemoteTriggerInfo';
import { importService } from './commands/importService';
import { importFunction } from './commands/importFunction';
import { viewDocumentation } from './commands/viewDocumentation';
import { viewSource } from './commands/viewSource';
import { reportIssue } from './commands/reportIssue';
import { viewQuickStart } from './commands/viewQuickStart';
import { showUpdateNotification } from './commands/showUpdateNotification';
import { referRuntimeLib } from './commands/referRuntimeLib';
import { isTemplateYaml } from './utils/document';
import { templateChangeEventEmitter } from './models/events';
import { ROSTemplateHoverProvider } from './hovers/ROSTemplateHoverProvider';
import { FlowDefinitionHoverProvider } from './hovers/FlowDefinitionHoverProvider';
import { installPackage } from './commands/installPackage';
import { startLocalSandbox } from './commands/startLocalSandbox';
import { showLocalInvokePanel } from './commands/showLocalInvokePanel';
import { createEventFile } from './commands/createEventFile';
import { localStartFunction } from './commands/localStartFunction';
import { copyFunction, pasteFunction } from './commands/copyPasteFunction';
import { switchEventFile } from './commands/switchEventFile';
import { FnFRemoteResourceProvider } from './tree/fnf/FnFRemoteResourceProvider';
import { createRemoteFlow } from './commands/fnf/createRemoteFlow';
import { gotoFnFConsole } from './commands/fnf/gotoFnFConsole';
import { showRemoteFlowInfo, clearRemoteFlowInfo } from './commands/fnf/showRemoteFlowInfo';
import { showDefinitionGraph } from './commands/fnf/showDefinitionGraph';
import { ROSTemplateDocumentSymbolProvider } from './documentSymbols/ROSTemplateDocumentSymbolProvider';

export function activate(context: vscode.ExtensionContext) {
  recordPageView('/');
  ext.context = context;
  const cwd = vscode.workspace.rootPath;
  ext.cwd = cwd;

  const localResourceProvider = new LocalResourceProvider(cwd);
  const localResourceTreeView = vscode.window.createTreeView('fcLocalResource', {
    treeDataProvider: localResourceProvider,
  })
  ext.localResourceTreeView = localResourceTreeView;
  vscode.commands.registerCommand(serverlessCommands.REFRESH_LOCAL_RESOURCE.id,
    () => localResourceProvider.refresh()
  );

  const remoteResourceProvider = new RemoteResourceProvider();
  vscode.window.registerTreeDataProvider('fcRemoteResource', remoteResourceProvider);
  vscode.commands.registerCommand(serverlessCommands.REFRESH_REMOTE_RESOURCE.id,
    () => remoteResourceProvider.refresh()
  );

  const fnfRemoteResourceProvider = new FnFRemoteResourceProvider();
  vscode.window.registerTreeDataProvider('fnfRemoteResource', fnfRemoteResourceProvider);
  vscode.commands.registerCommand(serverlessCommands.FNF_REFRESH_REMOTE_RESOURCE.id,
    () => fnfRemoteResourceProvider.refresh()
  );

  initProject(context); // init project
  createFunction(context); // create function
  gotoFunctionCode(context); // goto function code
  gotoFunctionDefinition(context); // goto function template
  gotoServiceDefinition(context); // goto service template
  gotoTriggerDefinition(context);
  gotoNasDefinition(context);
  openNasLocalDir(context);
  deploy(context); // deploy
  localInvokeFunction(context); // local invoke function
  localDebugFunction(context); // local debug function
  localInvokeConfig(context);
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
  showRemoteTriggerInfo(context);
  clearRemoteTriggerInfo(context);
  importService(context);
  importFunction(context);
  viewQuickStart(context);
  viewDocumentation(context);
  viewSource(context);
  reportIssue(context);
  showUpdateNotification(context);
  deployService(context);
  deployFunction(context);
  syncNas(context);
  gotoTemplate(context);
  referRuntimeLib(context);
  installPackage(context);
  startLocalSandbox(context);
  showLocalInvokePanel(context);
  createEventFile(context);
  localStartFunction(context);
  copyFunction(context);
  pasteFunction(context);
  switchEventFile(context);
  createRemoteFlow(context);
  gotoFnFConsole(context);
  showRemoteFlowInfo(context);
  clearRemoteFlowInfo(context);
  showDefinitionGraph(context);
  gotoFCConsole(context);

  vscode.commands.executeCommand(serverlessCommands.SHOW_REGION_STATUS.id);
  vscode.commands.executeCommand(serverlessCommands.SHOW_UPDATE_NOTIFICATION.id);
  vscode.languages.registerCodeLensProvider(['javascript', 'python', 'php'], new ServerlessLensProvider(cwd));

  RainbowDecorator.getRainbowDecorator().decorate();

  const selector = { pattern: '**/*.{yml,yaml}' };
  vscode.languages.registerDefinitionProvider(
    selector,
    new ROSTemplateDefinitionProvider()
  );
  vscode.languages.registerCompletionItemProvider(
    selector,
    new ROSTemplateCompletionProvider(),
  );
  vscode.languages.registerHoverProvider(
    selector,
    new ROSTemplateHoverProvider(),
  );
  new ROSTemplateDiagnosticsProvider().startDiagnostic();
  vscode.languages.registerDocumentSymbolProvider(
    selector,
    new ROSTemplateDocumentSymbolProvider(),
  );

  vscode.languages.registerCompletionItemProvider(
    { pattern: '**/Funfile' },
    new FunfileCompletionProvider(),
  );

  const flowDefinitionSelector = { pattern: '**/*.{yml,yaml}' };
  vscode.languages.registerCompletionItemProvider(
    flowDefinitionSelector,
    new FlowDefinitionCompletionProvider(),
  );
  vscode.languages.registerHoverProvider(
    flowDefinitionSelector,
    new FlowDefinitionHoverProvider(),
  );
  new FlowDefinitionDiagnosticsProvider().startDiagnostic();

  vscode.workspace.onDidChangeTextDocument((event) => {
    const document = event.document;
    if (isTemplateYaml(document) && !document.isDirty) {
      templateChangeEventEmitter.fire();
    }
  })
}

// this method is called when your extension is deactivated
export function deactivate() {}
