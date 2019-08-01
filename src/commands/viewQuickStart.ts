import * as vscode from 'vscode';
import { recordPageView } from '../utils/visitor';
import { serverlessCommands, SERVERLESS_EXTENTION_QUICKSTART_URL } from '../utils/constants';
import * as open from 'open';

export function viewQuickStart(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.VIEW_QUICK_START.id,
    async () => {
      recordPageView('/viewQuickStart');
      open(SERVERLESS_EXTENTION_QUICKSTART_URL);
    }))
  ;
}
