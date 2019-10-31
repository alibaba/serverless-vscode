import * as vscode from 'vscode';
import * as open from 'open';
import { recordPageView } from '../../utils/visitor';
import { serverlessCommands, ALIYUN_FUNCTION_FLOW_CONSOLE_URL } from '../../utils/constants';

export function gotoFnFConsole(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.FNF_GOTO_CONSOLE.id,
    async () => {
      recordPageView('/gotoFnFConsole');
      open(ALIYUN_FUNCTION_FLOW_CONSOLE_URL);
    }
  ));
}
