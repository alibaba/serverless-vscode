import * as vscode from 'vscode';
import * as path from 'path';
import * as terminalService from '../utils/terminal';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { FunService } from '../services/FunService';
import { Resource, ResourceType, FunctionResource } from '../models/resource';

export function localStartFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(
    serverlessCommands.LOCAL_START.id,
    async (
      node: Resource,
      debugMode: boolean = false,
      callback?: (debugPort: string) => void,
    ) => {
      recordPageView('/localStart');
      if (node.resourceType !== ResourceType.Function) {
        return;
      }
      const funcRes = node as FunctionResource;
      await process(
        funcRes.serviceName,
        funcRes.functionName,
        funcRes.templatePath as string,
        debugMode,
        callback,
      )
        .catch(ex => vscode.window.showErrorMessage(ex.message));
    }
  ));
}

async function process(
  serviceName: string, functionName: string, templatePath: string,
  debugMode: boolean, callback?: (debugPort: string) => void,
) {
  const funService = new FunService(templatePath);
  const terminal = terminalService.getFunctionComputeTerminal(
    path.dirname(templatePath),
    terminalService.FUNCTION_COMPUTE_WORKER_TERMINAL,
  );
  if (debugMode) {
    const debugPort = generateDebugPort().toString();
    funService.localStartDebug(serviceName, functionName, debugPort, terminal);
    if (callback) {
      callback(debugPort);
    }
  } else {
    funService.localStart(serviceName, functionName, terminal);
  }
}

function generateDebugPort(): number {
  return 4000 + Math.floor(Math.random() * 100);
}
