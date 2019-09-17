import * as vscode from 'vscode';
import { serverlessCommands } from '../utils/constants';
export class SeverlessLensInvokeItem extends vscode.CodeLens {
  constructor(commandRange: vscode.Range, ...item: any[]) {
    super(commandRange, {
      title: 'Local Run',
      command: serverlessCommands.LOCAL_RUN.id,
      arguments: item,
    })
  }
}
