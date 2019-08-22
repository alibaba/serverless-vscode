import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { serverlessCommands } from '../utils/constants';
import { isPathExists, createEventFile } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { FunctionComputeService } from '../services/FunctionComputeService';
import { getFunctionComputeOutputChannel } from '../utils/channel';
import { Resource, ResourceType, FunctionResource } from '../models/resource';

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
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }
  // 获取 event 文件
  let eventFilePath = <string>vscode.workspace.getConfiguration().get('aliyun.fc.remoteSource.eventFile.path');
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
  const event: string = fs.readFileSync(eventFilePath, 'utf8');
  const functionComputeService = new FunctionComputeService();
  const channel = getFunctionComputeOutputChannel();

  channel.clear();
  channel.show();
  channel.appendLine(`invoke remote function: ${serviceName}/${functionName} ...`);

  const task: Promise<any> = new Promise(resolve => {
    const httpTriggerUrls: any[] = [];
    functionComputeService.listTriggers(serviceName, functionName)
      .then(triggers => {
        (<any[]>triggers).forEach(trigger => {
          if (trigger.triggerType === 'http') {
            httpTriggerUrls.push(
              `https://${functionComputeService.getAccountId()}.${functionComputeService.getRegion()}.` +
              `fc.aliyuncs.com/2016-08-15/proxy/${serviceName}.${trigger.qualifier || 'LATEST'}/${functionName}/`
            );
          }
        })
        if (httpTriggerUrls.length > 0) {
          const result = {
            data: httpTriggerUrls.join('\n'),
          }
          channel.appendLine(
            'This HTTP trigger can be accessed ' +
            'through the folowing url by your favourite toolkit such as curl or postman.'
          );
          channel.appendLine('======================================================');
          resolve(result);
          return;
        } else {
          channel.appendLine('local event file path: '
            + `${<string>vscode.workspace.getConfiguration().get('aliyun.fc.remoteSource.eventFile.path')}`);
          channel.appendLine('======================================================');
          functionComputeService.invokeFunction(serviceName, functionName, event)
            .then(result => {
              resolve(result);
            });
          return;
        }
      });
  })

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'invoke remote function ...',
    cancellable: true,
  }, (progress, token) => {
    return task;
  })

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Window,
    title: 'invoke remote function ...',
  }, (progress, token) => {
    return task;
  })

  task.then(result => {
    const { data = '', headers = {} } = result;
    channel.appendLine(data);
    channel.appendLine('======================================================');
    const logInfo = headers['x-fc-log-result'];
    if (logInfo) {
      try {
        channel.appendLine(Buffer.from(logInfo, 'base64').toString('UTF8'));
      } catch (ex) {
        vscode.window.showErrorMessage(ex.message);
      }
    }
  })
}
