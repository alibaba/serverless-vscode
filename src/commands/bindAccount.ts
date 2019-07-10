import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as yaml from 'js-yaml';
import * as util from 'util';
import { isPathExists, createFile } from '../utils/file';
import { MultiStepInput } from '../ui/MultiStepInput';
import { recordPageView } from '../utils/visitor';

const readFile = util.promisify(fs.readFile);

export function bindAccount(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('fc.extension.bind.account', async () => {
    recordPageView("/bindAccount");
    await process(context).catch(vscode.window.showErrorMessage);
  }));
}

async function process(context: vscode.ExtensionContext) {
  interface State {
    accountId: string,
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
      totalSteps: 3,
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
      totalSteps: 3,
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
      totalSteps: 3,
      value: state.accessKeySecret ? state.accessKeySecret : '',
      prompt: 'Input AccessKey Secret',
      validate: validateAccessKeySecret,
    });
    state.accessKeySecret = accessKeyId as string;
    return;
  };

  async function validateAccountId(input: string): Promise<string | undefined> {
    return input ? undefined : 'accountId should not be null';
  };

  async function validateAccessKeyId(input: string): Promise<string | undefined> {
    return input ? undefined : 'accessKey id should not be null';
  }

  async function validateAccessKeySecret(input: string): Promise<string | undefined> {
    return input ? undefined : 'accessKey secret should not be null';
  }

  async function validateBindAccountState(state: State): Promise<boolean> {
    if (!state || !state.accountId || !state.accessKeyId || !state.accessKeySecret) {
      return false;
    }
    return true;
  }

  async function saveAccountInfo(state: State) {
    const accountInfoConfigPath = path.join(os.homedir(), '.fcli', 'config.yaml');
    let config = {};
    let content = '';
    if (!isPathExists(accountInfoConfigPath)) {
      if (!createFile(accountInfoConfigPath)) {
        vscode.window.showErrorMessage(`Failed to create ${accountInfoConfigPath}`);
        return;
      }
    } else {
      content = await readFile(accountInfoConfigPath, 'utf8');
      config = yaml.safeLoad(content);
    }
    config = {
      ...config,
      ...convertAccountInfoToConfig(state),
    }
    content = yaml.dump(config);
    fs.writeFileSync(accountInfoConfigPath, content);
  }

  function convertAccountInfoToConfig(state: State) {
    return {
      endpoint: `https://${state.accountId}.cn-shanghai.fc.aliyuncs.com`,
      api_version: '2016-08-15',
      access_key_id: state.accessKeyId,
      access_key_secret: state.accessKeySecret,
      security_token: '',
      useragent: '@alicloud/fcli/1.0.0',
      debug: false,
      timeout: 60,
      sls_endpoint: 'cn-shanghai.log.aliyuncs.com',
      retries: 3,
      report: true,
    };
  }

  const state = await collectAccountInfo();
  if (!await validateBindAccountState(state)) {
    return;
  }
  await saveAccountInfo(state);
  vscode.commands.executeCommand("fc.extension.remoteResource.refresh");
  vscode.commands.executeCommand('fc.extension.show.region.status');
}
