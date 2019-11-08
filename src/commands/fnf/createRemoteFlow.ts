import * as vscode from 'vscode';
import * as fs from 'fs';
import { serverlessCommands } from '../../utils/constants';
import { recordPageView } from '../../utils/visitor';
import { MultiStepInput } from '../../ui/MultiStepInput';
import { isPathExists } from '../../utils/file';
import { FunctionFlowService } from '../../services/FunctionFlowService';

export function createRemoteFlow(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.FNF_CREATE_REMOTE_FLOW.id,
    async (uri: vscode.Uri) => {
      recordPageView('/createRemoteFlow');
      await processCommand(uri).catch(ex => vscode.window.showErrorMessage(ex.message));
    }));
}

interface State {
  flowName: string;
  description: string;
}

async function processCommand(uri: vscode.Uri) {
  if (uri.scheme !== 'file') {
    return;
  }

  const state = await collectInfo();
  if (!state.flowName || !state.description) {
    return;
  }

  if (!isPathExists(uri.fsPath)) {
    throw new Error(`${uri.fsPath} is not exists`);
  }

  const flowDefinition = fs.readFileSync(uri.fsPath, 'utf8');
  const functionFlowService = new FunctionFlowService();
  let existFlow = false;
  try {
    await functionFlowService.describeFlow(state.flowName);
    existFlow = true;
  } catch(ex) {
  }
  if (existFlow) {
    const choice = await vscode.window.showInformationMessage(
      `${state.flowName} already exists. Do you want to continue updating?`,
      'Continue',
      'Cancel',
    )
    if (choice !== 'Continue') {
      return;
    }
    await functionFlowService.updateFlow(state.flowName, state.description, flowDefinition);
  } else {
    await functionFlowService.createFlow(state.flowName, state.description, flowDefinition);
  }
  vscode.commands.executeCommand(serverlessCommands.FNF_REFRESH_REMOTE_RESOURCE.id);
  vscode.commands.executeCommand(serverlessCommands.VIEW_SHOW_ALIYUN_FUNCTION_FLOW.id);
}

async function collectInfo() {
  const state = {} as Partial<State>;
  await MultiStepInput.run(input => inputFlowName(input, state));
  return state as State;
}

async function inputFlowName(input: MultiStepInput, state: Partial<State>) {
  const names = await input.showInputBox({
    title: 'Deploy Flow (Input Flow Name)',
    step: 1,
    totalSteps: 2,
    value: state.flowName || '',
    prompt: 'Input Flow Name',
    validate: validateFlowName,
  });
  state.flowName = names as string;
  return (input: MultiStepInput) => inputFlowDescription(input, state);
}

async function validateFlowName(input: string): Promise<string | undefined> {
  return input ? undefined : 'Flow name should not be empty';
}

async function inputFlowDescription(input: MultiStepInput, state: Partial<State>) {
  const names = await input.showInputBox({
    title: 'Deploy Flow (Input Flow Description)',
    step: 2,
    totalSteps: 2,
    value: state.description || '',
    prompt: 'Input Flow Description',
    validate: validateFlowDescription,
  });
  state.description = names as string;
  return;
}

async function validateFlowDescription(input: string): Promise<string | undefined> {
  return input ? undefined : 'Flow description should not be empty';
}
