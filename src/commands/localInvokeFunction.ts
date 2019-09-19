import * as vscode from 'vscode';
import { ext } from '../extensionVariables';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { getOrInitEventConfig } from '../utils/localConfig';
import { FunService } from '../services/FunService';
import { TemplateService } from '../services/TemplateService';
import { Resource, ResourceType, FunctionResource } from '../models/resource';
import { isPathExists, createEventFile } from '../utils/file';

export function localInvokeFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.LOCAL_RUN.id,
    async (node: Resource, eventFilePath: string | undefined) => {
      recordPageView('/localInvoke');
      if (node.resourceType !== ResourceType.Function) {
        return;
      }
      const funcRes = node as FunctionResource;
      await process(funcRes.serviceName, funcRes.functionName, funcRes.templatePath as string, eventFilePath)
        .catch(ex => vscode.window.showErrorMessage(ex.message));
    })
  );
}

async function process(
  serviceName: string, functionName: string,
  templatePath: string, eventFilePath: string | undefined,
) {
  if (!ext.cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const templateService = new TemplateService(templatePath);
  const functionInfo = await templateService.getFunction(serviceName, functionName);
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
    eventFilePath = eventFilePath || await getOrInitEventConfig(
      templatePath,
      serviceName,
      functionName,
      functionInfo.Properties.CodeUri
    );
    if (!isPathExists(eventFilePath)) {
      // 生成默认 event 文件
      if (!createEventFile(eventFilePath)) {
        throw new Error(`Create ${eventFilePath} event file failed`);
      }
    }
  }
  // 启动 fun local
  const funService = new FunService(templatePath);
  if (hasHttpTrigger) {
    funService.localStart(serviceName, functionName);
  } else {
    funService.localInvoke(serviceName, functionName, eventFilePath as string);
  }
}
