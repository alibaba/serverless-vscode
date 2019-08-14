import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as util from 'util';
import * as open from 'open';
import { isPathExists, isDirectory, createFile } from '../utils/file';
import { serverlessCommands, ALIYUN_SERVERLESS_VERSION, ALIYUN_SERVERLESS_CHANGELOG_URL } from '../utils/constants';
import { recordPageView } from '../utils/visitor';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export function showUpdateNotification(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SHOW_UPDATE_NOTIFICATION.id,
    async () => {
      await process(context).catch((ex) => vscode.window.showErrorMessage(ex.message));;
    }
  ));
}

async function process(context: vscode.ExtensionContext) {
  let showNotification = true;
  const versionFilePath = path.join(os.homedir(), '.aliyun-serverless', 'VERSION');
  if (isPathExists(versionFilePath) && !isDirectory(versionFilePath)) {
    const version = await readFile(versionFilePath, 'utf8').catch((ex) => vscode.window.showErrorMessage(ex.message));
    if (version === ALIYUN_SERVERLESS_VERSION) {
      showNotification = false;
    }
  }
  if (showNotification) {
    recordPageView('/showUpdateNotification');
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
      },
      (progress) => {
        progress.report({increment: 100});
        return vscode.window.showInformationMessage(
          `Aliyun Serverless has been updated to ${ALIYUN_SERVERLESS_VERSION} -- check out what's new`,
          'Release Notes',
        ).then(item => {
          if (item === 'Release Notes') {
            open(ALIYUN_SERVERLESS_CHANGELOG_URL);
          }
        });
      }
    );
    if (isPathExists(versionFilePath) || createFile(versionFilePath)) {
      writeFile(versionFilePath, ALIYUN_SERVERLESS_VERSION).catch((ex) => vscode.window.showErrorMessage(ex.message));
    }
  }
}
