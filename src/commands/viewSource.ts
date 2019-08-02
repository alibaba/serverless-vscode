import * as vscode from 'vscode';
import { recordPageView } from '../utils/visitor';
import { serverlessCommands, SERVERLESS_EXTENTION_SOURCE_URL } from '../utils/constants';
import * as open from 'open';

export function viewSource(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.VIEW_SOURCE_ON_GITHUB.id,
    async () => {
      recordPageView('/viewSource');
      open(SERVERLESS_EXTENTION_SOURCE_URL);
    }))
  ;
}
