import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { serverlessCommands } from '../utils/constants';
import { FunctionDescriptor } from '../descriptors/descriptor';
import { AbstractInfoPanelCreator } from './AbstractInfoPanelCreator';
import { FunctionComputeService } from '../services/FunctionComputeService';
import { FunctionResource } from '../models/resource';

export class FunctionInfoPanelCreator extends AbstractInfoPanelCreator<FunctionDescriptor> {
  viewType = 'functionInfo';

  public constructor(extensionPath: string) {
    super(extensionPath);
  }

  public getPanelTitle(descriptor: FunctionDescriptor): string {
    return `${descriptor.serviceName}/${descriptor.functionName}`;
  }

  protected getHtmlForWebview(): string {
    const htmlPath = path.join(this.extensionPath, 'resources', 'web', 'function', 'index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent.replace('${baseHref}', vscode.Uri.file(
      path.join(this.extensionPath, 'resources', 'web', 'function')
    ).with({ scheme: 'vscode-resource' }).toString());
    return htmlContent;
  }

  protected receiveMessage(message: any, descriptor: FunctionDescriptor) {
    switch (message.command) {
      case 'remoteInvoke': {
        vscode.commands.executeCommand(
          serverlessCommands.REMOTE_INVOKE.id,
          new FunctionResource(descriptor.serviceName, descriptor.functionName)
        );
        return;
      }
    }
  }

  protected async update(panel: vscode.WebviewPanel, descriptor: FunctionDescriptor) {
    const functionComputeService = new FunctionComputeService();
    const functionInfo = await functionComputeService.getFunction(descriptor.serviceName, descriptor.functionName);
    const functionBaseInfo: any = {
      ...functionInfo,
      serviceName: descriptor.serviceName,
      regionId: functionComputeService.getRegion(),
      accountId: functionComputeService.getAccountId(),
    };
    panel.webview.postMessage({
      command: 'updateBaseInfo',
      data: functionBaseInfo,
    });
  }
}
