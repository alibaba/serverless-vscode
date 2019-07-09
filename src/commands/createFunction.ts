import * as vscode from 'vscode';
import * as path from 'path';
import { MultiStepInput } from '../ui/MultiStepInput';
import { isPathExists, createDirectory } from '../utils/file';
import { getSuffix, createIndexFile } from '../utils/runtime';
import { recordPageView } from '../utils/visitor';
import { Resource } from '../models/resource';
import { TemplateService } from '../services/TemplateService';
import { process as gotoFunctionCode } from './gotoFunctionCode';

export function createFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('fc.extension.function.create', async (node: Resource) => {
    recordPageView("/functionCreate");
    let serviceName = '';
		if (node) {
			serviceName = node.label;
		}
		await process(context, serviceName).catch(vscode.window.showErrorMessage);
  }));
}

async function process(context: vscode.ExtensionContext, serviceName = '') {
  const functionTypes: vscode.QuickPickItem[] = [{
      label: "NORMAL",
      description: "Event Trigger",
    }, {
      label: "HTTP",
      description: "HTTP Trigger",
  }];
  const runtimes: vscode.QuickPickItem[] = ["nodejs6", "nodejs8", "python2.7", "python3", "php7.2"].map(label => <vscode.QuickPickItem>{ label });

  interface State {
    type: string;
    runtime: string;
    functionName: string;
    serviceName: string;
    step: number;
    totalSteps: number;
    codeUri: string;
  }

  const cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage("You should open a workspace");
    return;
  }

  async function collectFuncInfo() {
    const state = {} as Partial<State>;
    if (serviceName) {
      state.serviceName = serviceName;
      await MultiStepInput.run(input => inputFunctionName(input, state));
    } else {
      await MultiStepInput.run(input => pickServiceName(input, state));
    }
    return state as State;
  }

  async function pickServiceName(input: MultiStepInput, state: Partial<State>) {
    const name = await input.showInputBox({
      title: "Create Function (Input Service Name)",
      step: 1,
      totalSteps: 4,
      value: state.serviceName || "",
      prompt: "Input service name",
      validate: validateServiceName,
    });
    state.serviceName = name as string;
    return (input: MultiStepInput) => inputFunctionName(input, state);
  }

  async function inputFunctionName(input: MultiStepInput, state: Partial<State>) {
    const name = await input.showInputBox({
      title: "Create Function (Input Function Name)",
      step: 2,
      totalSteps: 4,
      value: state.functionName || "",
      prompt: "Input function name",
      validate: validateFunctionName,
    });
    state.functionName = name as string;
    return (input: MultiStepInput) => pickFunctionRuntime(input, state);
  }

  async function pickFunctionRuntime(input: MultiStepInput, state: Partial<State>) {
    const pick = await input.showQuickPick({
      title: "Create Function (Choose Function Runtime)",
      step: 3,
      totalSteps: 4,
      placeholder: "Pick function runtime",
      items: runtimes,
    });
    state.runtime = (<any>pick).label as string;
    return (input: MultiStepInput) => pickFunctionType(input, state);
  }

  async function pickFunctionType(input: MultiStepInput, state: Partial<State>) {
    const pick = await input.showQuickPick({
      title: "Create Function (Choose Function Type)",
      step: 4,
      totalSteps: 4,
      placeholder: "Pick function type",
      items: functionTypes,
    });
    state.type = (<any>pick).label as string;
  }

  async function validateServiceName(input: string): Promise<string | undefined> {
    return input ? undefined : "Service name should not be null";
  }

  async function validateFunctionName(input: string): Promise<string | undefined> {
    return input ? undefined : "Function name should not be null";
  }

  async function validateCreateFuncionState(state: State): Promise<boolean> {
    const functionTypes = ["NORMAL", "HTTP"];
    const runtimes = ["nodejs6", "nodejs8", "python2.7", "python3", "php7.2"];
    if (!state || !state.serviceName || !state.functionName || !functionTypes.includes(state.type) || !runtimes.includes(state.runtime)) {
      return false;
    }
    return true;
  }

  async function createFunctionFile(state: State): Promise<boolean> {
    const { serviceName, functionName, runtime, type } = state;
    if (!cwd) {
      vscode.window.showErrorMessage("You should open a workspace");
      return false;
    }
    const servicePath = path.join(cwd, serviceName);
    if (!isPathExists(servicePath)) {
      if (!createDirectory(servicePath)) {
        vscode.window.showErrorMessage(`Create ${servicePath} error`);
        return false;
      }
    }
    const functionPath = path.join(servicePath, functionName);
    if (!isPathExists(functionPath)) {
      if (!createDirectory(functionPath)) {
        vscode.window.showErrorMessage(`Create ${functionPath} error`);
        return false;
      }
    }
    const suffix = getSuffix(runtime);
    if (!suffix) {
      vscode.window.showErrorMessage(`${runtime} runtime is not supported`);
      return false;
    }
    const indexPath = path.join(functionPath, `index${suffix}`)
    if (isPathExists(indexPath)) {
      vscode.window.showErrorMessage(`${indexPath} is already exist`);
      return false;
    }
    if (!createIndexFile(type, runtime, indexPath)) {
      vscode.window.showErrorMessage(`Create ${runtime} index file error`);
      return false;
    }
    state.codeUri = path.join(serviceName, functionName);
    return true;
  }

  const state = await collectFuncInfo();
  if (!await validateCreateFuncionState(state)) {
    return;
  }
  if (!await createFunctionFile(state)) {
    return;
  }
  const templateService = new TemplateService(cwd);
  if (!await templateService.addFunction(state)) {
    return;
  }
  vscode.commands.executeCommand("fc.extension.localResource.refresh");
  await gotoFunctionCode(state.serviceName, state.functionName);
}