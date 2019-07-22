import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ServiceDescriptor } from '../descriptors/descriptor';
import { AbstractInfoPanelCreator } from './AbstractInfoPanelCreator';
import { FunctionComputeService } from '../services/FunctionComputeService';

export class ServiceInfoPanelCreator extends AbstractInfoPanelCreator<ServiceDescriptor> {
  viewType = 'serviceInfo';

  public constructor(extensionPath: string) {
    super(extensionPath);
  }

  public getPanelTitle(descriptor: ServiceDescriptor): string {
    return descriptor.serviceName;
  }

  protected getHtmlForWebview(): string {
    const htmlPath = path.join(this.extensionPath, 'resources', 'web', 'service', 'index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent.replace('${baseHref}',
      vscode.Uri.file(
        path.join(this.extensionPath, 'resources', 'web', 'service')
      ).with({ scheme: 'vscode-resource' }).toString()
    );
    return htmlContent;
  }

  protected receiveMessage(message: any) {
  }

  protected async update(panel: vscode.WebviewPanel, descriptor: ServiceDescriptor) {
    const functionComputeService = new FunctionComputeService();
    let serviceInfo = await functionComputeService.getService(descriptor.serviceName);
    serviceInfo = {
      ...serviceInfo,
      regionId: functionComputeService.getRegion(),
    }
    panel.webview.postMessage({
      command: 'updateInfo',
      data: serviceInfo,
    });
  }
}
