import * as vscode from 'vscode';
import * as path from 'path';
import * as output from '../utils/output';
import * as os from 'os';
import { isDirectory, isNotEmpty } from '../utils/file';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { getFunctionComputeOutputChannel } from '../utils/channel';
import { Resource, ResourceType, FunctionResource } from '../models/resource';

const cwd = vscode.workspace.rootPath;

export function importFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.IMPORT_FUNCTION.id,
    async (node: Resource) => {
      recordPageView('importFunction');
      if (node.resourceType !== ResourceType.Function) {
        return;
      }
      const funcRes = node as FunctionResource;
      await process(funcRes.serviceName, funcRes.functionName);
    })
  );
}

async function process(serviceName: string, functionName: string) {
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
  if (! await existLocalFunctionFiles(serviceName, functionName, importPath)) {
    const choice = await vscode.window.showInformationMessage('Function already exists: '
      + `${serviceName}/${functionName}`
      + '. Continuing operations may result in the loss of local files. Continue ？', 'Continue', 'Cancel');
    if (choice !== 'Continue') {
      return;
    }
  }
  const { importFunction } = require('@alicloud/fun/lib/import/function.js');
  await output.output(() =>
    importFunction(serviceName, functionName, importPath).catch((ex: any) => { output.error(ex.message) })
  );
  vscode.commands.executeCommand(serverlessCommands.REFRESH_LOCAL_RESOURCE.id);
}

async function existLocalFunctionFiles(
  serviceName: string,
  functionName: string,
  importPath: string
): Promise<boolean> {
  const serviceDirPath = path.join(importPath, serviceName);
  const funcDirPath = path.join(serviceDirPath, functionName);
  if (isDirectory(serviceDirPath)
    && isDirectory(funcDirPath)
    && isNotEmpty(funcDirPath)) {
    return false;
  }
  return true;
}
