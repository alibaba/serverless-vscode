import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as yaml from 'js-yaml';
import * as util from 'util';
import { FC_REGIONS } from '../utils/constants';
import { isPathExists, createFile } from '../utils/file';
import { MultiStepInput } from '../ui/MultiStepInput';
import { recordPageView } from '../utils/visitor';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export function switchRegion(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('fc.extension.switch.region', async () => {
    recordPageView('/switchRegion');
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
  vscode.commands.executeCommand('fc.extension.remoteResource.refresh');
  vscode.commands.executeCommand('fc.extension.show.region.status');
}
