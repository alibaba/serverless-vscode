import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import { ext } from '../extensionVariables';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { TemplateService } from '../services/TemplateService';
import { Resource, ResourceType, FunctionResource, ServiceResource } from '../models/resource';

let copyFuncInfo: {
  templatePath: string,
  serviceName: string,
  functionName: string,
  functionInfo: any,
};

export function copyFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(
    serverlessCommands.COPY_FUNCTION.id,
    async (resource?: Resource) => {
      recordPageView('/copyFunction');
      const node = resource ? resource : ext.localResourceTreeView && ext.localResourceTreeView.selection[0];
      if (!node || node.resourceType !== ResourceType.Function) {
        return;
      }
      const funcRes = node as FunctionResource;
      await processCopy(
        funcRes.serviceName,
        funcRes.functionName,
        funcRes.templatePath as string,
      )
        .catch(ex => vscode.window.showErrorMessage(ex.message));
    }
  ));
}

async function processCopy(
  serviceName: string,
  functionName: string,
  templatePath: string,
) {
  const templateService = new TemplateService(templatePath);
  const functionInfo = await templateService.getFunction(serviceName, functionName);
  if (!functionInfo) {
    throw new Error(`${serviceName}/${functionInfo} not found`);
  }
  copyFuncInfo = {
    templatePath,
    serviceName,
    functionName,
    functionInfo,
  }
}

export function pasteFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(
    serverlessCommands.PASTE_FUNCTION.id,
    async (resource?: Resource) => {
      recordPageView('/pasteFunction');
      const node = resource ? resource : ext.localResourceTreeView && ext.localResourceTreeView.selection[0];
      if (!node || node.resourceType !== ResourceType.Service) {
        return;
      }
      const serviceRes = node as ServiceResource;
      await processPaste(
        serviceRes.serviceName,
        serviceRes.templatePath as string,
      )
        .catch(ex => vscode.window.showErrorMessage(ex.message));
    }
  ));
}

async function processPaste(
  serviceName: string,
  templatePath: string,
) {
  if (!copyFuncInfo) {
    return;
  }
  const templateService = new TemplateService(templatePath);
  const serviceInfo = await templateService.getService(serviceName);
  if (!serviceInfo) {
    throw new Error(`${serviceName} not found`);
  }
  const functions = Object.entries(serviceInfo)
    .filter(([name, resource]) =>
      name.startsWith(copyFuncInfo.functionName)
        &&
      (<any>resource).Type === 'Aliyun::Serverless::Function');
  let templateDef = await templateService.getTemplateDefinition();
  const functionNameSet = new Set();
  for ( const [name] of functions ) {
    functionNameSet.add(name);
  }
  if (!functionNameSet.has(copyFuncInfo.functionName)) {
    templateDef['Resources'][serviceName][copyFuncInfo.functionName] = copyFuncInfo.functionInfo;
  } else {
    let serialNumber = 1;
    let functionNamePrefix = `${copyFuncInfo.functionName}_`;
    while (functionNameSet.has(`${functionNamePrefix}${serialNumber}`)) {
      serialNumber++;
    }
    const functionName = `${functionNamePrefix}${serialNumber}`;
    templateDef['Resources'][serviceName][functionName] = copyFuncInfo.functionInfo;
  }
  templateService.writeTemplate(yaml.dump(templateDef));
  vscode.commands.executeCommand(serverlessCommands.REFRESH_LOCAL_RESOURCE.id);
}
