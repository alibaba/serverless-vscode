import * as vscode from 'vscode';
import { recordPageView } from '../utils/visitor';
import { serverlessCommands, SERVERLESS_EXTENTION_DOCUMENTATION_URL } from '../utils/constants';
import * as open from 'open';

export function viewDocumentation(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.VIEW_DOCUMENTATION.id,
    async () => {
      recordPageView('/viewDocumentation');
      open(SERVERLESS_EXTENTION_DOCUMENTATION_URL);
    }))
  ;
}
