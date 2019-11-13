import * as vscode from 'vscode';
import { IInfoPanelCreator } from './IInfoPanelCreator';
import { ResourceDescriptor } from '../descriptors/descriptor';

export abstract class AbstractInfoPanelCreator<T extends ResourceDescriptor> implements IInfoPanelCreator<T> {
  protected viewType = '';
  protected readonly extensionPath: string;

  protected abstract getHtmlForWebview(descriptor: T): string;
  protected abstract receiveMessage(message: any, descriptor: T, panel: vscode.WebviewPanel): any;
  protected abstract async update(panel: vscode.WebviewPanel, descriptor: T): Promise<any>;
  protected abstract getPanelTitle(descriptor: T): string;

  public constructor(extensionPath: string) {
    this.extensionPath = extensionPath;
  }


  public create(descriptor: T, viewColumn?: vscode.ViewColumn): vscode.WebviewPanel {
    const column = viewColumn || (vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined);
    const panel = vscode.window.createWebviewPanel(
      this.viewType,
      this.getPanelTitle(descriptor),
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );
    const disposables: vscode.Disposable[] = [];
    panel.webview.html = this.getHtmlForWebview(descriptor);
    panel.onDidDispose(() => this.dispose(disposables), null, disposables);
    panel.webview.onDidReceiveMessage(
      message => this.receiveMessage(message, descriptor, panel), null, disposables
    );
    this.update(panel, descriptor);
    return panel;
  }

  private dispose(disposables: vscode.Disposable[]) {
    while (disposables.length) {
      const d = disposables.pop();
      if (d) {
        d.dispose();
      }
    }
  }
}
