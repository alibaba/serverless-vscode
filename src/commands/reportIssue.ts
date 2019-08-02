import * as vscode from 'vscode';
import { recordPageView } from '../utils/visitor';
import { serverlessCommands, SERVERLESS_EXTENTION_REPORT_ISSUE_URL } from '../utils/constants';
import * as open from 'open';

export function reportIssue(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.REPORT_ISSUE.id,
    async () => {
      recordPageView('/reportIssue');
      open(SERVERLESS_EXTENTION_REPORT_ISSUE_URL);
    }))
  ;
}
