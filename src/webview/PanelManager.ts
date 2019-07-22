import * as vscode from 'vscode';
import { IInfoPanelCreator } from './IInfoPanelCreator';
import { ResourceDescriptor } from '../descriptors/descriptor';
export class PanelManager<T extends ResourceDescriptor> {
  private panelMap: Map<string, vscode.WebviewPanel>;
  public panelCreator: IInfoPanelCreator<T>;
  constructor(panelCreator: IInfoPanelCreator<T>) {
    this.panelMap = new Map<string, vscode.WebviewPanel>();
    this.panelCreator = panelCreator;
  }
  public static showPanel(panel: vscode.WebviewPanel) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;
    panel.reveal(column);
  }
  public getOrCreatePanel(panelTitle: string, descriptor: T): vscode.WebviewPanel {
    let panel = this.getPanel(panelTitle);
    if (!panel) {
      panel = this.panelCreator.create(descriptor);
      this.addPanel(panel);
    }
    return panel;
  }
  public getPanel(panelTitle: string):
  vscode.WebviewPanel | undefined {
    let panel = this.panelMap.get(panelTitle);
    return panel;
  }
  public addPanel(panel: vscode.WebviewPanel) {
    const panelTitle = panel.title;
    panel.onDidDispose(() => {
      this.panelMap.delete(panelTitle);
    })
    this.panelMap.set(panelTitle, panel);
  }
  public clear() {
    this.panelMap.clear();
  }
}
