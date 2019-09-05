import * as vscode from 'vscode';
import { recordPageView } from '../utils/visitor';
import { FunService } from '../services/FunService';
import { serverlessCommands } from '../utils/constants';
import { Resource, FunctionResource, ResourceType } from '../models/resource';

export function startLocalSandbox(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(
    serverlessCommands.START_LOCAL_SANDBOX.id,
    async (node: Resource) => {
      recordPageView('/startLocalSandbox');
      if (node.resourceType !== ResourceType.Function) {
        return;
      }
      const funcRes = node as FunctionResource;
      await process(funcRes.serviceName, funcRes.functionName, funcRes.templatePath as string);
    }
  ));
}

async function process(serviceName: string, functionName: string, templatePath: string) {
  const funService = new FunService(templatePath);
  funService.installSbox(serviceName, functionName);
}
