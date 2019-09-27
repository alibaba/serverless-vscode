import * as vscode from 'vscode';
import { Resource } from './models/resource';

export namespace ext {
  export let context: vscode.ExtensionContext;
  export let cwd: string | undefined;
  export let localResourceTreeView: vscode.TreeView<Resource>;
}
