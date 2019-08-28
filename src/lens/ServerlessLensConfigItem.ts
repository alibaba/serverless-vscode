import * as vscode from 'vscode';
import { serverlessCommands } from '../utils/constants';
export class ServerlessLensConfigItem extends vscode.CodeLens {
  constructor(commandRange: vscode.Range, ...item: any[]) {
    super(commandRange, {
      title: 'FC: Invoke Config',
      command: serverlessCommands.LOCAL_INVOKE_CONFIG.id,
      arguments: item,
    })
  }
}
