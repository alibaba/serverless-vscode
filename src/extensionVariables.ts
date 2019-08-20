import * as vscode from 'vscode';

export namespace ext {
  export let context: vscode.ExtensionContext;
  export let cwd: string | undefined;
}
