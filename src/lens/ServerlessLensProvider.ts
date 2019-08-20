import * as vscode from 'vscode';
import * as path from 'path';
import * as util from 'util';
import * as glob from 'glob';
import { ext } from '../extensionVariables';
import { templateChangeEventEmitter } from '../models/events';
import { ALIYUN_SERVERLESS_SERVICE_TYPE, ALIYUN_SERVERLESS_FUNCTION_TYPE } from '../utils/constants';
import { TemplateService } from '../services/TemplateService';
import { SeverlessLensInvokeItem } from './ServerlessLensInvokeItem';
import { SeverlessLensDebugItem } from './ServerlessLensDebugItem';
import { FunctionResource } from '../models/resource';

const findFile = util.promisify(glob);

interface FunctionInfo {
  serviceName: string,
  functionName: string,
  templatePath: string,
  functionResource: any,
}

class FunctionInfoDict {
  static functionInfoDict = new FunctionInfoDict();
  private needLoad: boolean;
  private comparisonTable: Map<string, FunctionInfo>;
  private onDidChangeTemplateContent: vscode.Event<string>;
  private constructor() {
    this.comparisonTable = new Map();
    this.needLoad = true;
    this.onDidChangeTemplateContent = templateChangeEventEmitter.event;
    this.onDidChangeTemplateContent(() => {
      this.needLoad = true
    });
  }

  static getFunctionInfoDict(): FunctionInfoDict {
    return FunctionInfoDict.functionInfoDict;
  }

  private async load() {
    if (!ext.cwd) {
      return;
    }
    const files = await findFile('**/template.{yml,yaml}', {
      cwd: ext.cwd,
    });
    if (!files || !files.length) {
      vscode.window.showInformationMessage('No template.yml in current workspace');
      return;
    }
    files.forEach(file => {
      const templatePath = path.resolve(ext.cwd as string, file);
      const templateService = new TemplateService(templatePath);
      const tpl = templateService.getTemplateDefinitionSync();
      if (!tpl || !tpl.Resources) {
        return;
      }
      const services = Object.entries(tpl.Resources)
        .filter(([_, resource]) => {
          return (<any>resource).Type === ALIYUN_SERVERLESS_SERVICE_TYPE
        });
      services.forEach(([serviceName, serviceResource]) => {
        Object.entries(<any>serviceResource)
          .filter(([_, functionResource]) => {
            return (<any>functionResource).Type === ALIYUN_SERVERLESS_FUNCTION_TYPE;
          })
          .forEach(([functionName, functionResource]) => {
            const functionHandlerFilePath =
              templateService.getHandlerFilePathFromFunctionInfo(path.dirname(templatePath), functionResource);
            if (functionHandlerFilePath) {
              this.comparisonTable.set(functionHandlerFilePath, {
                serviceName,
                functionName,
                templatePath,
                functionResource,
              });
            }
          })
      });
    });
    this.needLoad = false;
  }

  async lookup(filePath: string): Promise<FunctionInfo | undefined> {
    if (this.needLoad) {
      await this.load();
    }
    return this.comparisonTable.get(filePath);
  }
}

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
    if (!ext.cwd) {
      return <vscode.CodeLens[]>[];
    }
    const functionInfoDict = FunctionInfoDict.getFunctionInfoDict();
    const filePath = document.uri.fsPath;
    const functionInfo = await functionInfoDict.lookup(filePath);
    if (functionInfo) {
      const templateService = new TemplateService(functionInfo.templatePath);
      const handlerFunctionName = templateService.getHandlerFunctionNameFromFunctionInfo(functionInfo.functionResource);
      const documentRange = this.getCodeLensRange(document, handlerFunctionName);
      return <vscode.CodeLens[]>[
        this.createServerlessLensInvokeItem(
          documentRange, functionInfo.serviceName, functionInfo.functionName, functionInfo.templatePath),
        this.createServerlessLensDebugItem(
          documentRange, functionInfo.serviceName, functionInfo.functionName, functionInfo.templatePath),
      ]
    }
    return <vscode.CodeLens[]>[];
  }

  createServerlessLensInvokeItem(
    documentRange:vscode.Range,
    serviceName: string,
    functionName: string,
    templatePath: string,
  )
    : SeverlessLensInvokeItem {
    return new SeverlessLensInvokeItem(documentRange,
      new FunctionResource(
        serviceName, functionName, undefined, undefined, templatePath
      )
    );
  }

  createServerlessLensDebugItem(
    documentRange:vscode.Range,
    serviceName: string,
    functionName: string,
    templatePath: string,
  )
    : SeverlessLensDebugItem {
    return new SeverlessLensDebugItem(documentRange,
      new FunctionResource(
        serviceName, functionName, undefined, undefined, templatePath
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
