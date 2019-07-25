import * as vscode from 'vscode';
import { IInfoPanelCreator } from './IInfoPanelCreator';
import { ResourceDescriptor } from '../descriptors/descriptor';

export abstract class AbstractInfoPanelCreator<T extends ResourceDescriptor> implements IInfoPanelCreator<T> {
  protected viewType = '';
  protected readonly extensionPath: string;

  protected abstract getHtmlForWebview(): string;
  protected abstract receiveMessage(message: any, descriptor: T): any;
  protected abstract async update(panel: vscode.WebviewPanel, descriptor: T): Promise<any>;
  protected abstract getPanelTitle(descriptor: T): string;

  protected disposables: vscode.Disposable[] = [];

  public constructor(extensionPath: string) {
    this.extensionPath = extensionPath;
  }


  public create(descriptor: T): vscode.WebviewPanel {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;
    const panel = vscode.window.createWebviewPanel(
      this.viewType,
      this.getPanelTitle(descriptor),
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );
    panel.webview.html = this.getHtmlForWebview();
    panel.onDidDispose(() => this.dispose(), null, this.disposables);
    panel.webview.onDidReceiveMessage(message => this.receiveMessage(message, descriptor), null, this.disposables);
    this.update(panel, descriptor);
    return panel;
  }

  private dispose() {
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) {
        d.dispose();
      }
    }
  }
}
