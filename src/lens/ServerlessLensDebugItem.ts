import * as vscode from 'vscode';
import { serverlessCommands } from '../utils/constants';

export class SeverlessLensDebugItem extends vscode.CodeLens {
  constructor(commandRange: vscode.Range, ...item: any[]) {
    super(commandRange, {
      title: 'Local Debug',
      command: serverlessCommands.LOCAL_DEBUG.id,
      arguments: item,
    })
  }
}
