import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as yaml from 'js-yaml';
import * as util from 'util';
import { FC_REGIONS, serverlessCommands } from '../utils/constants';
import { isPathExists, createFile } from '../utils/file';
import { MultiStepInput } from '../ui/MultiStepInput';
import { recordPageView } from '../utils/visitor';
import { getConfig } from '../utils/config';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

function isTrue(value: any) {
  return value === 'true' || value === true;
}

export function switchRegion(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SWITCH_REGION.id, async () => {
    recordPageView('/switchRegion');

    const profile = await getConfig();
    if (!isTrue(profile.enableCustomEndpoint)) {
      vscode.window.showInformationMessage('Region is not available because you have configured custom endpoint!');
      return;
    }

    await process(context).catch(vscode.window.showErrorMessage);
  }));
}

async function process(context: vscode.ExtensionContext) {
  interface State {
    regionId: string;
  }

  async function collectRegionInfo() {
    const state = {} as Partial<State>;
    await MultiStepInput.run(input => pickRegion(input, state));
    return state as State;
  }

  async function pickRegion(input: MultiStepInput, state: Partial<State>) {
    const region = await input.showQuickPick({
      title: 'Please Select A Region',
      step: 1,
      totalSteps: 1,
      placeholder: 'Pick function runtime',
      items: FC_REGIONS.map(regionId => <vscode.QuickPickItem>{ label: regionId }),
    });
    state.regionId = (<any>region).label as string;
    return;
  }

  async function validateRegionInfo(state: State): Promise<boolean> {
    if (!state || !state.regionId) {
      return false;
    }
    return true;
  }

  async function saveRegionInfo(state: State) {
    const configPath = path.join(os.homedir(), '.fcli', 'config.yaml');
    if (!isPathExists(configPath)) {
      vscode.window.showInformationMessage('Please Bind New Account First');
      return;
    }
    let content = await readFile(configPath, 'utf8');
    const config = yaml.safeLoad(content);
    let { endpoint } = config;
    endpoint = (<string>endpoint).replace('https://', '');
    const accountId = (<string>endpoint).substring(0, (<string>endpoint).indexOf('.'));
    config.endpoint = `https://${accountId}.${state.regionId}.fc.aliyuncs.com`;
    config.sls_endpoint = `${state.regionId}.log.aliyuncs.com`;
    content = yaml.dump(config);
    await writeFile(configPath, content);

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
    funConfig.context = {
      ...funConfig.context,
      region: state.regionId,
    }
    content = yaml.dump(funConfig);
    await writeFile(funConfigFilePath, content);
  }

  const state = await collectRegionInfo();
  if (!await validateRegionInfo(state)) {
    return;
  }
  await saveRegionInfo(state);
  vscode.commands.executeCommand(serverlessCommands.REFRESH_REMOTE_RESOURCE.id);
  vscode.commands.executeCommand(serverlessCommands.FNF_REFRESH_REMOTE_RESOURCE.id);
  vscode.commands.executeCommand(serverlessCommands.SHOW_REGION_STATUS.id);
  vscode.commands.executeCommand(serverlessCommands.CLEAR_REMOTE_FUNCTION_INFO.id);
  vscode.commands.executeCommand(serverlessCommands.CLEAR_REMOTE_SERVICE_INFO.id);
  vscode.commands.executeCommand(serverlessCommands.CLEAR_REMOTE_TRIGGER_INFO.id);
}
