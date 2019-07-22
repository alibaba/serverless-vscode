import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as open from 'open';
import { serverlessCommands, FUN_INSTALL_URL } from '../utils/constants';
import { validateFunInstalled } from '../validate/validateFunInstalled';
import { isPathExists, createEventFile } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { FunService } from '../services/FunService';
import { TemplateService } from '../services/TemplateService';
import { Resource } from '../models/resource';

export function localInvokeFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.LOCAL_RUN.id,
    async (node: Resource) => {
      recordPageView('/localInvoke');
      if (! await validateFunInstalled()) {
        vscode.window.showInformationMessage('You should install "@alicloud/fun" first', 'Goto', 'Cancel')
          .then(choice => {
            if (choice === 'Goto') {
              open(FUN_INSTALL_URL);
            }
          });
        return;
      }
      const serviceName = node.resourceProperties && node.resourceProperties.serviceName
        ? node.resourceProperties.serviceName : '';
      const functionName = node.label;
      await process(serviceName, functionName);
    })
  );
}

async function process(serviceName: string, functionName: string) {
  let cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const templateService = new TemplateService(cwd);
  const functionInfo = await templateService.getFunction(serviceName, functionName);
  let eventFilePath = '';
  let hasHttpTrigger = false;
  if (functionInfo.Events) {
    Object.entries(functionInfo.Events).forEach(([name, resource]) => {
      if (resource && (<any>resource).Type === 'HTTP') {
        hasHttpTrigger = true;
      }
    })
  }
  if (!hasHttpTrigger) {
    // 普通的函数，读取 event 文件
    try {
      const localRoot = path.join(cwd, functionInfo.Properties.CodeUri);
      const eventFileStat = fs.statSync(localRoot);
      if (eventFileStat.isDirectory()) {
        eventFilePath = path.join(localRoot, 'event.dat');
      } else if (eventFileStat.isFile()) {
        eventFilePath = path.join(path.dirname(localRoot), 'event.dat');
      }
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
      return;
    }
    if (!isPathExists(eventFilePath)) {
      // 生成默认 event 文件
      if (!createEventFile(eventFilePath)) {
        vscode.window.showErrorMessage(`Create ${eventFilePath} event file failed`);
        return;
      }
    }
  }
  // 启动 fun local
  const funService = new FunService(cwd);
  if (hasHttpTrigger) {
    funService.localStart(serviceName, functionName);
  } else {
    funService.localInvoke(serviceName, functionName, eventFilePath);
  }
}
