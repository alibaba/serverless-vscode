import * as vscode from 'vscode'

let _channel: vscode.OutputChannel;

export function getFunctionComputeOutputChannel(): vscode.OutputChannel {
  if (!_channel) {
    _channel = vscode.window.createOutputChannel('Function Compute');
  }
  return _channel;
}
