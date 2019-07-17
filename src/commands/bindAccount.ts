import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as yaml from 'js-yaml';
import * as util from 'util';
import { convertAccountInfoToConfig, getRegionId } from '../utils/config';
import { isPathExists, createFile } from '../utils/file';
import { MultiStepInput } from '../ui/MultiStepInput';
import { recordPageView } from '../utils/visitor';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export function bindAccount(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('fc.extension.bind.account', async () => {
    recordPageView('/bindAccount');
    await processCommand(context).catch(vscode.window.showErrorMessage);
  }));
}

async function processCommand(context: vscode.ExtensionContext) {
  interface State {
    accountId: string,
    accountAlias: string,
    accessKeyId: string,
    accessKeySecret: string,
  };

  async function collectAccountInfo() {
    const state = {} as Partial<State>;
    await MultiStepInput.run(input => inputAccountId(input, state));
    return state as State;
  }

  async function inputAccountId(input: MultiStepInput, state: Partial<State>) {
    const accountId = await input.showInputBox({
      title: 'Bind Aliyun Account (Input Account ID)',
      step: 1,
      totalSteps: 4,
      value: state.accountId ? state.accountId : '',
      prompt: 'Input Account ID',
      validate: validateAccountId,
    });
    state.accountId = accountId as string;
    return (input: MultiStepInput) => inputAccessKeyId(input, state);
  };

  async function inputAccessKeyId(input: MultiStepInput, state: Partial<State>) {
    const accessKeyId = await input.showInputBox({
      title: 'Bind Aliyun Account (Input AccessKey ID)',
      step: 2,
      totalSteps: 4,
      value: state.accessKeyId ? state.accessKeyId : '',
      prompt: 'Input AccessKey ID',
      validate: validateAccessKeyId,
    });
    state.accessKeyId = accessKeyId as string;
    return (input: MultiStepInput) => inputAccessKeySecret(input, state);
  };

  async function inputAccessKeySecret(input: MultiStepInput, state: Partial<State>) {
    const accessKeyId = await input.showInputBox({
      title: 'Bind Aliyun Account (Input AccessKey Secret)',
      step: 3,
      totalSteps: 4,
      value: state.accessKeySecret ? state.accessKeySecret : '',
      prompt: 'Input AccessKey Secret',
      validate: validateAccessKeySecret,
    });
    state.accessKeySecret = accessKeyId as string;
    return (input: MultiStepInput) => inputAccountAlias(input, state);
  };

  async function inputAccountAlias(input: MultiStepInput, state: Partial<State>) {
    const accountAlias = await input.showInputBox({
      title: 'Bind Aliyun Account (Input Account Alias)',
      step: 4,
      totalSteps: 4,
      value: state.accountAlias ? state.accountAlias : '',
      prompt: 'Input Account Alias (Help you remember account such as: account01、account02)',
      validate: validateAccountAlias,
    });
    state.accountAlias = accountAlias as string;
    return;
  }

  async function validateAccountId(input: string): Promise<string | undefined> {
    const reg = new RegExp('^[0-9]*$');
    if (!reg.test(input)) {
      return 'accountId is not valid';
    }
    return input ? undefined : 'accountId should not be null';
  };

  async function validateAccessKeyId(input: string): Promise<string | undefined> {
    return input ? undefined : 'accessKey id should not be null';
  }

  async function validateAccessKeySecret(input: string): Promise<string | undefined> {
    return input ? undefined : 'accessKey secret should not be null';
  }

  async function validateAccountAlias(input: string): Promise<string | undefined> {
    return input ? undefined : 'account alias should not be null';
  }

  async function validateBindAccountState(state: State): Promise<boolean> {
    if (!state || !state.accountId || !state.accessKeyId
      || !state.accessKeySecret || !state.accountAlias) {
      return false;
    }
    return true;
  }

  async function saveAccountInfo(state: State) {
    const configPath = path.join(os.homedir(), '.fcli', 'config.yaml')
    let content = '';
    // 检测 ~/.fcli/config.yaml 是否存在
    if (!isPathExists(configPath) && !createFile(configPath)) {
      vscode.window.showErrorMessage(`Failed to create ${configPath}`);
      return;
    }
    let config: any = convertAccountInfoToConfig(state);
    content = yaml.dump(config);
    await writeFile(configPath, content);
    // 检测 ~/.fun/config.yaml 是否存在
    const funConfigFilePath = path.join(os.homedir(), '.fun', 'config.yaml');
    let funConfig: any = {};
    if (!isPathExists(funConfigFilePath)) {
      if (!createFile(funConfigFilePath)) {
        vscode.window.showErrorMessage(`Failed to create ${funConfigFilePath}`);
        return;
      }
    } else {
      content = await readFile(funConfigFilePath, 'utf8');
      funConfig = yaml.safeLoad(content);
    }
    if (!funConfig) {
      funConfig = {};
    }
    const { accounts = [] } = funConfig;
    let doFound = false;
    for (const accountInfo of accounts) {
      if (accountInfo.name === state.accountAlias) {
        doFound = true;
        accountInfo.account = {
          accountId: state.accountId,
          accessKeyId: state.accessKeyId,
          accessKeySecret: state.accessKeySecret,
        }
      }
      break;
    }
    if (!doFound) {
      accounts.push({
        name: state.accountAlias,
        account: {
          accountId: state.accountId,
          accessKeyId: state.accessKeyId,
          accessKeySecret: state.accessKeySecret,
        }
      })
    }
    funConfig.accounts = accounts;
    funConfig.context = {
      ...funConfig.context,
      account: state.accountAlias,
      region: getRegionId(),
    }
    content = yaml.dump(funConfig);
    await writeFile(funConfigFilePath, content);
  }

  const state = await collectAccountInfo();
  if (!await validateBindAccountState(state)) {
    return;
  }
  await saveAccountInfo(state);
  vscode.commands.executeCommand('fc.extension.remoteResource.refresh');
  vscode.commands.executeCommand('fc.extension.show.region.status');
}
