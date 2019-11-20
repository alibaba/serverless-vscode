import * as vscode from 'vscode';
import * as path from 'path';
import * as output from '../utils/output';
import * as os from 'os';
import { isDirectory, isNotEmpty } from '../utils/file';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { getFunctionComputeOutputChannel } from '../utils/channel';
import { FunctionComputeService } from '../services/FunctionComputeService';
import { Resource } from '../models/resource';

const cwd = vscode.workspace.rootPath;
const functionComputeService = new FunctionComputeService();

export function importService(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.IMPORT_SERVICE.id,
    async (node: Resource) => {
      recordPageView('importService');
      const serviceName = node.label;
      await process(serviceName);
    })
  );
}

async function process(serviceName: string) {
  if (!cwd) {
    vscode.window.showErrorMessage('Import service should under a workspace');
  }
  const channel = getFunctionComputeOutputChannel();
  channel.clear();
  channel.show();
  const selectedPath = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    defaultUri: vscode.Uri.file(cwd || os.homedir()),
    openLabel: '下载',
  });
  if (!selectedPath) {
    return;
  }
  const importPath = selectedPath[0].fsPath;
  const existFunctions = await existLocalFunctionFiles(serviceName, importPath);
  if (existFunctions.length > 0) {
    const choice = await vscode.window.showInformationMessage('These function already exists: '
      + existFunctions.join(',')
      + '. Continuing operations may result in the loss of local files. Continue ？', 'Continue', 'Cancel');
    if (choice !== 'Continue') {
      return;
    }
  }
  const { importService } = require('@alicloud/fun/lib/import/service.js');
  await output.output(() =>
    importService(serviceName, importPath).catch((ex: any) => { output.error(ex.message) })
  );
  vscode.commands.executeCommand(serverlessCommands.REFRESH_LOCAL_RESOURCE.id);
}

async function existLocalFunctionFiles(serviceName: string, importPath: string): Promise<string[]> {
  const serviceDirPath = path.join(importPath, serviceName);
  const existFunctions: string[] = [];
  if (isDirectory(serviceDirPath)) {
    const functionList = await functionComputeService.listAllRemoteFunctionInService(serviceName);
    functionList.forEach(funcInfo => {
      const funcInfoPath = path.join(serviceDirPath, funcInfo.functionName);
      if (isDirectory(funcInfoPath) && isNotEmpty(funcInfoPath)) {
        existFunctions.push(`${serviceName}/${funcInfo.functionName}`);
      }
    });
  }
  return existFunctions;
}
