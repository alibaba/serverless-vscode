import * as vscode from 'vscode';
import * as path from 'path';
import { ext } from '../extensionVariables';
import { MultiStepInput } from '../ui/MultiStepInput';
import { getSupportedRuntimes, isSupportedRuntime, isNodejs, isPython } from '../utils/runtime';
import { serverlessCommands, serverlessConfigs } from '../utils/constants';
import { isNotEmpty, checkExistsWithTimeout } from '../utils/file';
import { createCodeFile, isCustomRuntime } from '../utils/runtime';
import { getSupportedCustomRuntimeTemplates, isSupportedCustomRuntimeTemplates, createCustomRuntimeCodeFile } from '../utils/runtime';
import { recordPageView } from '../utils/visitor';
import { ServiceResource } from '../models/resource';
import { TemplateService } from '../services/TemplateService';
import { process as gotoFunctionCode } from './gotoFunctionCode';
import { templateChangeEventEmitter } from '../models/events';
import { toUnicode } from 'punycode';

export function createFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.CREATE_FUNCTION.id,
    async (node?: ServiceResource) => {
      recordPageView('/functionCreate');
      if (!node) {
        await process(context, '', path.resolve(ext.cwd ? ext.cwd : '', 'template.yml'))
          .catch(ex => vscode.window.showErrorMessage(ex.message));
        return;
      }
      await process(context, node.serviceName ? node.serviceName : '', node.templatePath as string)
        .catch(ex => vscode.window.showErrorMessage(ex.message));
    })
  );
}

async function process(context: vscode.ExtensionContext, serviceName: string, templatePath: string) {
  const functionTypes: vscode.QuickPickItem[] = [{
    label: 'NORMAL',
    description: 'Event Trigger',
  }, {
    label: 'HTTP',
    description: 'HTTP Trigger',
  }];
  const customRuntimeTemplates: vscode.QuickPickItem[] = getSupportedCustomRuntimeTemplates().map(label => <vscode.QuickPickItem>{ label });

  const runtimes: vscode.QuickPickItem[] = getSupportedRuntimes().map(label => <vscode.QuickPickItem>{ label });

  interface State {
    type: string;
    runtime: string;
    functionName: string;
    serviceName: string;
    step: number;
    totalSteps: number;
    codeUri: string;
    functionTemplate: string;
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
      title: 'Create Function (Input Service Name)',
      step: 1,
      totalSteps: 5,
      value: state.serviceName || '',
      prompt: 'Input service name',
      validate: validateServiceName,
    });
    state.serviceName = name as string;
    return (input: MultiStepInput) => inputFunctionName(input, state);
  }

  async function inputFunctionName(input: MultiStepInput, state: Partial<State>) {
    const name = await input.showInputBox({
      title: 'Create Function (Input Function Name)',
      step: 2,
      totalSteps: 5,
      value: state.functionName || '',
      prompt: 'Input function name',
      validate: validateFunctionName,
    });
    state.functionName = name as string;
    return (input: MultiStepInput) => inputCodeUri(input, state);
  }

  async function inputCodeUri(input: MultiStepInput, state: Partial<State>) {
    const prefix = <string>vscode.workspace.getConfiguration().get(
      serverlessConfigs.ALIYUN_FC_CREATEFUNCTION_CODEURI_PREFIX,
    );
    let defaultCodeUri = prefix ?
      path.join(prefix, state.serviceName as string, state.functionName as string)
      :
      path.join(state.serviceName as string, state.functionName as string);
    const codeUri = await input.showInputBox({
      title: 'Create Function (Check Code Uri, Recommended not to modify)',
      step: 3,
      totalSteps: 5,
      value: defaultCodeUri,
      prompt: 'Check code uri which is the relative path to template file. Recommended not to modify',
      validate: validateCodeUri,
    });
    state.codeUri = codeUri as string;
    return (input: MultiStepInput) => pickFunctionRuntime(input, state);
  }

  async function pickFunctionRuntime(input: MultiStepInput, state: Partial<State>) {
    const pick = await input.showQuickPick({
      title: 'Create Function (Choose Function Runtime)',
      step: 4,
      totalSteps: 5,
      placeholder: 'Pick function runtime',
      items: runtimes,
    });
    state.runtime = (<any>pick).label as string;
    if (isCustomRuntime(state.runtime)) {
      return (input: MultiStepInput) => pickFunctionTemplate(input, state);
    } else {
      return (input: MultiStepInput) => pickFunctionType(input, state);
    }
  }

  async function pickFunctionType(input: MultiStepInput, state: Partial<State>) {
    const pick = await input.showQuickPick({
      title: 'Create Function (Choose Function Type)',
      step: 5,
      totalSteps: 5,
      placeholder: 'Pick function type',
      items: functionTypes,
    });
    state.type = (<any>pick).label as string;
  }

  async function pickFunctionTemplate(input: MultiStepInput, state: Partial<State>) {
    const pick = await input.showQuickPick({
      title: 'Create Function (Choose Function Template)',
      step: 5,
      totalSteps: 5,
      placeholder: 'Pick function template',
      items: customRuntimeTemplates,
    });
    state.functionTemplate = (<any>pick).label as string;
  }

  async function validateServiceName(input: string): Promise<string | undefined> {
    return input ? undefined : 'Service name should not be null';
  }

  async function validateFunctionName(input: string): Promise<string | undefined> {
    return input ? undefined : 'Function name should not be null';
  }

  async function validateCodeUri(input: string): Promise<string | undefined> {
    return input ? undefined : 'Code uri should not be null';
  }

  async function validateCreateFuncionState(state: State): Promise<boolean> {
    const functionTypes = ['NORMAL', 'HTTP'];
    if (!state || !state.serviceName
      || !state.functionName 
      || !state.runtime
      || (!isCustomRuntime(state.runtime) && !functionTypes.includes(state.type))
      || !isSupportedRuntime(state.runtime) 
      || (isCustomRuntime(state.runtime) && !isSupportedCustomRuntimeTemplates(state.functionTemplate))) {
      return false;
    }
    return true;
  }

  async function createFunctionFile(state: State): Promise<void> {
    const { runtime, type, functionTemplate } = state;
    if (!ext.cwd) {
      throw new Error('You should open a workspace');
    }
    const codeUriPath = path.resolve(path.dirname(templatePath as string), state.codeUri);
    if (isNotEmpty(codeUriPath)) {
      const choose = await vscode.window.showInformationMessage(
        `There are some files in the directory: ${codeUriPath}. `
        + 'If you choose to continue, you may overwrite some files.',
        'Continue',
        'Cancel',
      );
      if (choose !== 'Continue') {
        throw new Error('Interrupt create function operation');
      }
    }
    if (isCustomRuntime(runtime)) {
      await createCustomRuntimeCodeFile(functionTemplate, codeUriPath);
    } else {
      await createCodeFile(type, runtime, codeUriPath);
    }
  }
  
  const state = await collectFuncInfo();
  if (!await validateCreateFuncionState(state)) {
    return;
  }
  const templateService = new TemplateService(templatePath as string);
  if (!await templateService.addFunction(state)) {
    return;
  }
  templateChangeEventEmitter.fire();
  await createFunctionFile(state);

  await vscode.commands.executeCommand(serverlessCommands.REFRESH_LOCAL_RESOURCE.id);

  if (isCustomRuntime(state.runtime)) {
    const initProjectTemplatePath = path.resolve(path.dirname(templatePath as string), state.codeUri, 'template.yml');
    await checkExistsWithTimeout(initProjectTemplatePath, 10000);
    const initProjectTemplateService = new TemplateService(initProjectTemplatePath as string);

    const functionRes = await initProjectTemplateService.getFunction(state.functionName, state.functionName);
    if (functionRes && functionRes.Properties && functionRes.Properties.CodeUri) {
      functionRes.Properties.CodeUri = path.join(state.codeUri, functionRes.Properties.CodeUri);
    } else {
      vscode.window.showErrorMessage(`Function definition error in ${initProjectTemplatePath}`);
    }

    await initProjectTemplateService.rmTemplate();
    if (!await templateService.replaceFunction(state.serviceName, state.functionName, functionRes)) {
      return;
    }
  } else {
    await gotoFunctionCode(state.serviceName, state.functionName, templatePath);
    if (isNodejs(state.runtime) || isPython(state.runtime)) {
      vscode.commands.executeCommand(serverlessCommands.REFERENCE_RUNTIME_LIB.id, state.runtime);
    }
  }
}
