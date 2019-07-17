import * as vscode from 'vscode';

export class SeverlessLensDebugItem extends vscode.CodeLens {
  constructor(commandRange: vscode.Range, ...item: any[]) {
    super(commandRange, {
      title: 'FC: Local Debug',
      command: 'fc.extension.localResource.local.invoke.debug',
      arguments: item,
    })
  }
}
