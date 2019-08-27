import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { TriggerDescriptor } from '../descriptors/descriptor';
import { AbstractInfoPanelCreator } from './AbstractInfoPanelCreator';
import { FunctionComputeService } from '../services/FunctionComputeService';

export class TriggerInfoPanelCreator extends AbstractInfoPanelCreator<TriggerDescriptor> {
  viewType = 'triggerInfo';

  public constructor(extensionPath: string) {
    super(extensionPath);
  }

  public getPanelTitle(descriptor: TriggerDescriptor): string {
    return `${descriptor.serviceName}/${descriptor.functionName}/${descriptor.triggerName}`;
  }

  protected getHtmlForWebview(descriptor: TriggerDescriptor): string {
    const htmlPath = path.join(this.extensionPath, 'resources', 'web', 'trigger', descriptor.triggerType, 'index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent.replace('${baseHref}',
      vscode.Uri.file(
        path.join(this.extensionPath, 'resources', 'web', 'trigger')
      ).with({ scheme: 'vscode-resource' }).toString()
    );
    return htmlContent;
  }

  protected receiveMessage(message: any) {
  }

  protected async update(panel: vscode.WebviewPanel, descriptor: TriggerDescriptor) {
    const functionComputeService = new FunctionComputeService();
    const triggerInfo = await functionComputeService.getTrigger(
      descriptor.serviceName,
      descriptor.functionName,
      descriptor.triggerName,
    );
    panel.webview.postMessage({
      command: 'updateInfo',
      data: {
        regionId: functionComputeService.getRegion(),
        serviceName: descriptor.serviceName,
        functionName: descriptor.functionName,
        ...triggerInfo,
      },
    });
  }
}
