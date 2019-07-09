import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as util from 'util';
import * as yaml from 'js-yaml';
import { isPathExists } from '../utils/file';

const regionStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);

export function showRegionStatus(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('fc.extension.show.region.status', async () => {
    await process(context).catch(vscode.window.showErrorMessage);
  }));
}

async function process(context: vscode.ExtensionContext) {
  const accountInfoConfigPath = path.join(os.homedir(), '.fcli', 'config.yaml');
  if (!isPathExists(accountInfoConfigPath)) {
    regionStatusBarItem.hide();
    return;
  }
  const readFile = util.promisify(fs.readFile);
  let content = await readFile(accountInfoConfigPath, 'utf8');
  let config = yaml.safeLoad(content);
  let { endpoint } = config;
  endpoint = (<string>endpoint).replace("https://", "");
  endpoint = (<string>endpoint).substring((<string>endpoint).indexOf('.') + 1);
  const regionId = (<string>endpoint).substring(0, (<string>endpoint).indexOf('.'));
  regionStatusBarItem.text = `ALIYUN REGION: ${regionId}`;
  regionStatusBarItem.command = 'fc.extension.switch.region';
  regionStatusBarItem.show();
}