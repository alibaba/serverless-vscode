import * as vscode from 'vscode';
import * as open from 'open';
import { recordPageView } from '../utils/visitor';
import { serverlessCommands, ALIYUN_FUNCTION_COMPUTE_CONSOLE_URL } from '../utils/constants';

export function gotoFCConsole(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.FC_GOTO_CONSOLE.id,
    async () => {
      recordPageView('/gotoFCConsole');
      open(ALIYUN_FUNCTION_COMPUTE_CONSOLE_URL);
    }
  ));
}
