import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { serverlessCommands } from '../utils/constants';
import { isPathExists, createEventFile } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { Resource, ResourceType, FunctionResource } from '../models/resource';
import { FunService } from '../services/FunService';

export function remoteInvokeFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.REMOTE_INVOKE.id,
    async (node: Resource) => {
      recordPageView('/remoteInvoke');
      if (node.resourceType !== ResourceType.Function) {
        return;
      }
      const funcRes = node as FunctionResource;
      await process(funcRes.serviceName, funcRes.functionName);
    })
  );
}

async function process(serviceName: string, functionName: string) {
  let cwd = vscode.workspace.rootPath;
  let eventFilePath = <string>vscode.workspace.getConfiguration().get('aliyun.fc.remoteSource.eventFile.path');
  if (cwd) {
    // 获取 event 文件
    if (!eventFilePath) {
      vscode.window.showErrorMessage('Please config aliyun.fc.remoteSource.eventFile.path');
      return;
    }
    if (!path.isAbsolute(eventFilePath)) {
      eventFilePath = path.join(cwd, eventFilePath);
    }
    if (!isPathExists(eventFilePath)) {
      if (!createEventFile(eventFilePath)) {
        vscode.window.showErrorMessage(`Create ${eventFilePath} event file failed`);
        return;
      }
    }
  }
  const funService = new FunService(cwd || os.homedir());
  if (cwd) {
    funService.remoteInvokeWithEventFilePath(serviceName, functionName, eventFilePath);
  } else {
    funService.remoteInvokeWithStdin(serviceName, functionName);
  }
}
