import * as vscode from 'vscode';
import * as util from 'util';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { serverlessCommands } from '../utils/constants';
import { convertAccountInfoToConfig } from '../utils/config';
import { isPathExists } from '../utils/file';
import { MultiStepInput } from '../ui/MultiStepInput';
import { recordPageView } from '../utils/visitor';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export function switchAccount(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SWITCH_ACCOUNT.id, async () => {
    recordPageView('/switchAccount');
    await process(context);
  }));
}

async function process(context: vscode.ExtensionContext) {
  interface State {
    accountAlias: string;
  }

  const funConfigFilePath = path.join(os.homedir(), '.fun', 'config.yaml');
  let funConfig: any = {};
  if (isPathExists(funConfigFilePath)) {
    const content = await readFile(funConfigFilePath, 'utf8');
    funConfig = yaml.safeLoad(content);
  }

  const { accounts = [] } = funConfig;
  const accountInfoMap = new Map();
  (<any[]>accounts).forEach(accountInfo => {
    accountInfoMap.set(accountInfo.name, accountInfo.account);
  })

  async function collectChoiceInfo() {
    const state = {} as Partial<State>;
    await MultiStepInput.run(input => pickChoice(input, state));
    return state as State;
  }

  async function pickChoice(input: MultiStepInput, state: Partial<State>) {
    const choice = await input.showQuickPick({
      title: 'Switch account',
      step: 1,
      totalSteps: 1,
      placeholder: 'Pick your account',
      items: (<any[]>accounts).map(accountInfo => <vscode.QuickPickItem>{
        label: accountInfo.name,
      }),
    });
    state.accountAlias = (<any>choice).label as string;
    return;
  }

  async function validateChoiceInfo(state: State): Promise<boolean> {
    if (!state || !state.accountAlias) {
      return false;
    }
    return true;
  }

  async function saveAccountInfo(state: State) {
    const configPath = path.join(os.homedir(), '.fcli', 'config.yaml');
    const config = convertAccountInfoToConfig({
      ...accountInfoMap.get(state.accountAlias),
      accountAlias: state.accountAlias,
    });
    let content = yaml.dump(config);
    await writeFile(configPath, content);

    const funConfigFilePath = path.join(os.homedir(), '.fun', 'config.yaml');
    let funConfig: any = {};
    if (!isPathExists(funConfigFilePath)) {
      vscode.window.showErrorMessage(`${funConfigFilePath} not exist`);
      return;
    }
    content = await readFile(funConfigFilePath, 'utf8');
    funConfig = yaml.safeLoad(content);
    if (!funConfig) {
      funConfig = {};
    }
    funConfig.context = {
      ...funConfig.context,
      account: state.accountAlias,
    }
    content = yaml.dump(funConfig);
    await writeFile(funConfigFilePath, content);
  }

  const state = await collectChoiceInfo();
  if (!await validateChoiceInfo(state)) {
    return;
  }
  await saveAccountInfo(state);
  vscode.commands.executeCommand(serverlessCommands.REFRESH_REMOTE_RESOURCE.id);
  vscode.commands.executeCommand(serverlessCommands.SHOW_REGION_STATUS.id);
  vscode.commands.executeCommand(serverlessCommands.CLEAR_REMOTE_FUNCTION_INFO.id);
  vscode.commands.executeCommand(serverlessCommands.CLEAR_REMOTE_SERVICE_INFO.id);
  vscode.commands.executeCommand(serverlessCommands.CLEAR_REMOTE_TRIGGER_INFO.id);
}
