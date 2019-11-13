import * as vscode from 'vscode';
import * as path from 'path';
import { ext } from '../extensionVariables';
import { AbstractInfoPanelCreator } from './AbstractInfoPanelCreator';

export abstract class AbstractFlowPanelCreator<T> extends AbstractInfoPanelCreator<T> {
  protected getHtmlForWebview(): string {
    const manifest = require(
      path.join(ext.context.extensionPath, 'resources', 'web', 'flow', 'build', 'asset-manifest.json')
    );
    const mainScript = manifest.files['main.js'];
    const mainStyle = manifest.files['main.css'];
    const scriptPathOnDisk = vscode.Uri.file(
      path.join(ext.context.extensionPath, 'resources', 'web', 'flow', 'build', mainScript)
    );
    const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
    const stylePathOnDisk = vscode.Uri.file(
      path.join(ext.context.extensionPath, 'resources', 'web', 'flow', 'build', mainStyle)
    );
    const styleUri = stylePathOnDisk.with({ scheme: 'vscode-resource' });
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>React App</title>
        <link rel="stylesheet" type="text/css" href="${styleUri}">
        <base href="${vscode.Uri.file(
    path.join(ext.context.extensionPath, 'resources', 'web', 'flow', 'build')).with({ scheme: 'vscode-resource' })}/">
      </head>

      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root"></div>

        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  protected async update(panel: vscode.WebviewPanel, descriptor: T) {
  }
}
