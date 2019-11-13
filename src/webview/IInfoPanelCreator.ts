import * as vscode from 'vscode';
import { ResourceDescriptor } from '../descriptors/descriptor';

export interface IInfoPanelCreator<T extends ResourceDescriptor> {
  create(descriptor: T | undefined, column?: vscode.ViewColumn): vscode.WebviewPanel;
}
