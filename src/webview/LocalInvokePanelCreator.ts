import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as glob from 'glob';
import { InvokeDescriptor } from '../descriptors/descriptor';
import { AbstractInfoPanelCreator } from './AbstractInfoPanelCreator';
import { isDirectory, isPathExists, createEventFile } from '../utils/file';
import { FunService } from '../services/FunService';
import { serverlessCommands } from '../utils/constants';
import { FunctionResource } from '../models/resource';

const findFile = util.promisify(glob);
export class LocalInvokePanelCreator extends AbstractInfoPanelCreator<InvokeDescriptor> {
  viewType = 'localInvoke';

  public constructor(extensionPath: string) {
    super(extensionPath);
  }

  public getPanelTitle(descriptor: InvokeDescriptor): string {
    return `${descriptor.serviceName}/${descriptor.functionName}`;
  }

  protected getHtmlForWebview(descriptor: InvokeDescriptor): string {
    const htmlPath = path.join(this.extensionPath, 'resources', 'web', 'localInvoke', 'index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent.replace('${baseHref}',
      vscode.Uri.file(
        path.join(this.extensionPath, 'resources', 'web', 'localInvoke')
      ).with({ scheme: 'vscode-resource' }).toString()
    );
    return htmlContent;
  }

  protected receiveMessage(message: any, descriptor: InvokeDescriptor, panel: vscode.WebviewPanel) {
    let eventFileDir = path.resolve(path.dirname(descriptor.templatePath), descriptor.codeUri);
    if (!isDirectory(eventFileDir)) {
      eventFileDir = path.dirname(eventFileDir);
    }
    switch (message.command) {
      case 'getEventData': {
        const eventFilePath = path.join(eventFileDir, message.data);
        const eventData = fs.readFileSync(eventFilePath, 'utf8');
        panel.webview.postMessage({
          command: 'setEventData',
          data: eventData,
        });
        return;
      }
      case 'updateEventContent': {
        const eventFilePath = path.join(eventFileDir, message.data.eventFile);
        fs.writeFileSync(eventFilePath, message.data.eventContent);
        return;
      }
      case 'createEventFile': {
        const eventFilePath = path.join(eventFileDir, message.data);
        vscode.commands.executeCommand(
          serverlessCommands.CREATE_EVENT_FILE.id,
          descriptor.templatePath,
          descriptor.codeUri,
          eventFilePath,
          async (fileName: string) => {
            const files = await this.getEventFiles(descriptor.templatePath, descriptor.codeUri);
            panel.webview.postMessage({
              command: 'updateEventFileList',
              data: {
                files,
                selected: fileName,
              },
            });
          }
        );
        return;
      }
      case 'localInvoke': {
        const eventFilePath = path.join(eventFileDir, message.data);
        vscode.commands.executeCommand(
          serverlessCommands.LOCAL_RUN.id,
          new FunctionResource(
            descriptor.serviceName,
            descriptor.functionName,
            undefined,
            undefined,
            descriptor.templatePath,
          ),
          eventFilePath,
        );
        return;
      }
      case 'localDebug': {
        const eventFilePath = path.join(eventFileDir, message.data);
        vscode.commands.executeCommand(
          serverlessCommands.LOCAL_DEBUG.id,
          new FunctionResource(
            descriptor.serviceName,
            descriptor.functionName,
            undefined,
            undefined,
            descriptor.templatePath,
          ),
          eventFilePath,
        );
      }
    }
  }

  protected async update(panel: vscode.WebviewPanel, descriptor: InvokeDescriptor) {
    const files = await this.getEventFiles(descriptor.templatePath, descriptor.codeUri);
    panel.webview.postMessage({
      command: 'updateEventFileList',
      data: {
        files,
      },
    });
  }

  private async getEventFiles(templatePath: string, codeUri: string) {
    const eventFilePath = path.resolve(
      path.dirname(templatePath), codeUri, 'event.evt'
    );
    if (!isPathExists(eventFilePath)) {
      if (!createEventFile(eventFilePath)) {
        throw new Error(`Create ${eventFilePath} event file failed`);
      }
    }
    let eventFileDir = path.dirname(eventFilePath);
    const files = await findFile('*.evt', {
      cwd: eventFileDir,
    })
    return files;
  }
}
