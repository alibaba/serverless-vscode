import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { serverlessCommands } from '../utils/constants';
import { isPathExists, createEventFile } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { Resource, ResourceType, FunctionResource } from '../models/resource';
import { FunService } from '../services/FunService';
import { getOrInitEventConfig } from '../utils/localConfig';

export function remoteInvokeFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.REMOTE_INVOKE.id,
    async (node: Resource, eventFilePath: string | undefined) => {
      recordPageView('/remoteInvoke');
      if (node.resourceType !== ResourceType.Function) {
        return;
      }
      const funcRes = node as FunctionResource;
      await process(funcRes.serviceName, funcRes.functionName, eventFilePath);
    })
  );
}

async function process(
  serviceName: string,
  functionName: string,
  eventFilePath: string | undefined,
) {
  let cwd = vscode.workspace.rootPath;
  if (cwd) {
    // 获取 event 文件
    eventFilePath = eventFilePath || await getOrInitEventConfig(
      path.resolve(cwd, 'template.yml'),
      serviceName,
      functionName,
      path.join(serviceName, functionName),
    );
    if (!isPathExists(eventFilePath)) {
      if (!createEventFile(eventFilePath)) {
        vscode.window.showErrorMessage(`Create ${eventFilePath} event file failed`);
        return;
      }
    }
  }
  const funService = new FunService(cwd || os.homedir());
  if (cwd) {
    funService.remoteInvokeWithEventFilePath(serviceName, functionName, eventFilePath as string);
  } else {
    funService.remoteInvokeWithStdin(serviceName, functionName);
  }
}
