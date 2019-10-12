import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as glob from 'glob';
import * as terminalService from '../utils/terminal';
import { ext } from '../extensionVariables';
import { getOrInitEventConfig } from '../utils/localConfig';
import { InvokeDescriptor, FunctionDescriptor } from '../descriptors/descriptor';
import { AbstractInfoPanelCreator } from './AbstractInfoPanelCreator';
import { isDirectory, isPathExists, createEventFile } from '../utils/file';
import { serverlessCommands } from '../utils/constants';
import { FunctionResource } from '../models/resource';
import { localStartChangeEventEmitter } from '../models/events';

const findFile = util.promisify(glob);
export class LocalInvokePanelCreator extends AbstractInfoPanelCreator<InvokeDescriptor> {
  viewType = 'localInvoke';

  private onLocalStartChange: vscode.Event<FunctionDescriptor>;

  public constructor(extensionPath: string) {
    super(extensionPath);
    this.onLocalStartChange = localStartChangeEventEmitter.event;
  }

  public create(descriptor: InvokeDescriptor): vscode.WebviewPanel {
    const panel = super.create(descriptor);
    const disposable = this.onLocalStartChange((e: FunctionDescriptor) => {
      if (e.serviceName !== descriptor.serviceName || e.functionName !== descriptor.functionName) {
        this.updateRunningState(panel, 'STOPPED');
      }
    });
    panel.onDidDispose(() => {
      disposable.dispose();
      sendEndOfTextToWorkTerminal();
    });
    return panel;
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
      case 'isDefaultEventFile': {
        const eventFilePath = path.join(eventFileDir, message.data);
        getOrInitEventConfig(
          descriptor.templatePath,
          descriptor.serviceName,
          descriptor.functionName,
          descriptor.codeUri,
        ).then(defaultEventFilePath => {
          panel.webview.postMessage({
            command: 'isDefaultEventFile',
            data: defaultEventFilePath === eventFilePath,
          });
        });
        return;
      }
      case 'switchEventFile': {
        const eventFilePath = path.join(eventFileDir, message.data);
        vscode.commands.executeCommand(
          serverlessCommands.SWITCH_EVENT_FILE.id,
          descriptor.templatePath,
          descriptor.serviceName,
          descriptor.functionName,
          descriptor.codeUri,
          path.relative(
            ext.cwd as string, eventFilePath,
          ),
        );
        panel.webview.postMessage({
          command: 'isDefaultEventFile',
          data: true,
        });
        return;
      }
      case 'updateEventFileList': {
        this.getEventFiles(descriptor.templatePath, descriptor.codeUri)
          .then((files) => {
            panel.webview.postMessage({
              command: 'updateEventFileList',
              data: {
                files,
              },
            });
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
      case 'localRun': {
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
          true,
        );
        return;
      }
      case 'localDebug': {
        const { eventFile, debugPort } = message.data;
        const eventFilePath = path.join(eventFileDir, eventFile);
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
          true,
          debugPort,
        );
        return;
      }
      case 'start': {
        const { data: { debugMode = false } = {} } = message;
        vscode.commands.executeCommand(
          serverlessCommands.LOCAL_START.id,
          new FunctionResource(
            descriptor.serviceName,
            descriptor.functionName,
            undefined,
            undefined,
            descriptor.templatePath,
          ),
          debugMode ? true : false,
          debugMode ? (debugPort: string) => {
            this.updateDebugPort(panel, debugPort);
          } : undefined,
        );
        this.updateRunningState(panel, debugMode ? 'DEBUGGING' : 'RUNNING');
        localStartChangeEventEmitter.fire({
          serviceName: descriptor.serviceName,
          functionName: descriptor.functionName,
        });
        return;
      }
      case 'stop': {
        const terminal = sendEndOfTextToWorkTerminal();
        if (terminal) {
          terminal.show();
        }
        this.updateRunningState(panel, 'STOPPED');
        return;
      }
    }
  }

  private updateDebugPort(panel: vscode.WebviewPanel, debugPort: string) {
    if (panel && panel.webview) {
      panel.webview.postMessage({
        command: 'updateDebugPort',
        data: debugPort,
      });
    }
  }

  private updateRunningState(panel: vscode.WebviewPanel, state: string) {
    if (panel && panel.webview) {
      panel.webview.postMessage({
        command: 'updateRunningState',
        data: state,
      });
    }
  }

  protected async update(panel: vscode.WebviewPanel, descriptor: InvokeDescriptor) {
    panel.webview.postMessage({
      command: 'initFunctionInfo',
      data: {
        serviceName: descriptor.serviceName,
        functionName: descriptor.functionName,
      }
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

function sendEndOfTextToWorkTerminal() {
  const terminal = terminalService.abortTask(terminalService.FUNCTION_COMPUTE_WORKER_TERMINAL);
  return terminal;
}
