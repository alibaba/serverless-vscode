import * as vscode from 'vscode';
import { serverlessCommands } from '../utils/constants';
import { MultiStepInput } from '../ui/MultiStepInput';
import { recordPageView } from '../utils/visitor';

export function switchRegionOrAccount(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SWITCH_REGION_OR_ACCOUNT.id,
    async () => {
      recordPageView('/switchRegionOrAccount');
      await process(context);
    }))
  ;
}

async function process(context: vscode.ExtensionContext) {
  interface State {
    choice: string;
  }

  async function collectChoiceInfo() {
    const state = {} as Partial<State>;
    await MultiStepInput.run(input => pickChoice(input, state));
    return state as State;
  }

  async function pickChoice(input: MultiStepInput, state: Partial<State>) {
    const choice = await input.showQuickPick({
      title: 'Switch region or account',
      step: 1,
      totalSteps: 1,
      placeholder: 'Pick your choice',
      items: <vscode.QuickPickItem[]>[
        {
          label: 'Switch Region',
        },
        {
          label: 'Switch Account',
        },
      ],
    });
    state.choice = (<any>choice).label as string;
    return;
  }

  async function validateChoiceInfo(state: State): Promise<boolean> {
    if (!state || !state.choice) {
      return false;
    }
    return true;
  }

  const state = await collectChoiceInfo();
  if (!await validateChoiceInfo(state)) {
    return;
  }
  if (state.choice === 'Switch Region') {
    vscode.commands.executeCommand(serverlessCommands.SWITCH_REGION.id);
  }
  if (state.choice === 'Switch Account') {
    vscode.commands.executeCommand(serverlessCommands.SWITCH_OR_BIND_ACCOUNT.id);
  }
}
