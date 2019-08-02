import * as vscode from 'vscode';
import { ALIYUN_SERVERLESS_SERVICE_TYPE, ALIYUN_SERVERLESS_FUNCTION_TYPE } from '../utils/constants';
import { TemplateService } from '../services/TemplateService';
import { SeverlessLensInvokeItem } from './ServerlessLensInvokeItem';
import { SeverlessLensDebugItem } from './ServerlessLensDebugItem';
import { Resource, ResourceType } from '../models/resource';

export class ServerlessLensProvider implements vscode.CodeLensProvider {
  _onDidChangeCodeLenses: vscode.EventEmitter<void | undefined> = new vscode.EventEmitter<void | undefined>();
  onDidChangeCodeLenses?: vscode.Event<void | undefined> = this._onDidChangeCodeLenses.event;

  constructor(private workspaceRoot: string | undefined) {

  }

  refresh() {
    this._onDidChangeCodeLenses.fire();
  }

  provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken)
    : vscode.ProviderResult<vscode.CodeLens[]> {
    return this.processLens(document);
  }

  async processLens(document: vscode.TextDocument) {
    const cwd = this.workspaceRoot;
    if (!cwd) {
      return <vscode.CodeLens[]>[];
    }
    const filePath = document.uri.fsPath;
    const templateService = new TemplateService(cwd);
    const tpl: any = await templateService.getTemplateDefinition();
    const services = Object.entries(tpl.Resources)
      .filter(([_, resource]) => (<any>resource).Type === ALIYUN_SERVERLESS_SERVICE_TYPE);
    for (const [serviceName, serviceResource] of services) {
      for (const [functionName, functionResource] of Object.entries(<any>serviceResource)) {
        if (!templateService.validateFunctionResource(functionResource)) {
          continue;
        }
        const functionHandlerFilePath = templateService.getHandlerFilePathFromFunctionInfo(cwd, functionResource);
        const handlerFunctionName = templateService.getHandlerFunctionNameFromFunctionInfo(functionResource);
        if (filePath === functionHandlerFilePath) {
          const documentRange = this.getCodeLensRange(document, handlerFunctionName);
          return <vscode.CodeLens[]>[
            this.createSeverlessLensInvokeItem(documentRange, serviceName, functionName),
            this.createSeverlessLensDebugItem(documentRange, serviceName, functionName),
          ]
        }
      }
    }
    return <vscode.CodeLens[]>[];
  }

  createSeverlessLensInvokeItem(documentRange:vscode.Range, serviceName: string, functionName: string)
    : SeverlessLensInvokeItem {
    return new SeverlessLensInvokeItem(documentRange,
      new Resource(
        functionName,
        ResourceType.Function,
        vscode.TreeItemCollapsibleState.None,
        {
          serviceName: serviceName
        }
      )
    );
  }

  createSeverlessLensDebugItem(documentRange:vscode.Range, serviceName: string, functionName: string)
    : SeverlessLensDebugItem {
    return new SeverlessLensDebugItem(documentRange,
      new Resource(
        functionName,
        ResourceType.Function,
        vscode.TreeItemCollapsibleState.None,
        {
          serviceName: serviceName
        }
      )
    );
  }

  getCodeLensRange(document: vscode.TextDocument, functionName: string): vscode.Range {
    const lineCount = document.lineCount;
    for (let i = 0; i < lineCount; i++) {
      const textLine = document.lineAt(i);
      if (textLine.text.indexOf(functionName) > -1) {
        return <vscode.Range> {
          start: {
            line: i,
            character: 0,
          },
          end: {
            line: i,
            character: 0,
          }
        }
      }
    }
    return <vscode.Range> {
      start: {
        line: 0,
        character: 0,
      }
    }
  }
}
