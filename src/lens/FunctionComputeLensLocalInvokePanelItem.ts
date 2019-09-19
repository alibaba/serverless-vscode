import * as vscode from 'vscode';
import { serverlessCommands } from '../utils/constants';

export class FunctionComputeLensLocalInvokePanelItem extends vscode.CodeLens {
  constructor(commandRange: vscode.Range, ...item: any[]) {
    super(commandRange, {
      title: 'Invoke Panel',
      command: serverlessCommands.SHOW_LOCAL_INVOKE_PANEL.id,
      arguments: item,
    })
  }
}
