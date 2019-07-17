import * as vscode from 'vscode';

export class SeverlessLensInvokeItem extends vscode.CodeLens {
  constructor(commandRange: vscode.Range, ...item: any[]) {
    super(commandRange, {
      title: 'FC: Local Run',
      command: 'fc.extension.localResource.local.invoke',
      arguments: item,
    })
  }
}
