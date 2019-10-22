import * as vscode from 'vscode';
import * as Yaml from 'yaml-ast-parser';
import { ext } from '../extensionVariables';
import { isSupportedDocument } from '../utils/document';
import { ASTNode } from '../parser/ASTNode';
import { buildAstRecursively } from '../parser/parser';
import { JSONSchemaService } from '../language-service/services/jsonSchemaService';
import { ValidationResult, SchemaCollector } from '../language-service/parser/jsonParser';

const validationDelayMs = 200;
const diagnosticResult: { [uri: string]: vscode.DiagnosticCollection } = {};
export class ROSTemplateDiagnosticsProvider {
  private timer: NodeJS.Timer | undefined;
  public startDiagnostic() {
    if (vscode.window.activeTextEditor) {
      this.validateAndDiagnostic(vscode.window.activeTextEditor);
    }
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        this.validateAndDiagnostic(editor);
      }
    });
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (vscode.window.activeTextEditor
        && event.document === vscode.window.activeTextEditor.document
      ) {
        this.validateAndDiagnostic(vscode.window.activeTextEditor);
      }
    });
  }

  private validateAndDiagnostic(editor: vscode.TextEditor) {
    const document = editor.document;
    if (!document || !isSupportedDocument(document)) {
      return;
    }
    this.cleanTimer();
    this.timer = setTimeout(() => {
      this.doDiagnostic(document);
    }, validationDelayMs);
  }

  private async doDiagnostic(document: vscode.TextDocument): Promise<void> {
    const docRoot = this.parse(document.getText());
    const jsonSchemaService = JSONSchemaService.getJSONSchemaService();
    const resolvedSchema = await jsonSchemaService.getSchemaForResource();
    // 此处之所以做非空校验是因为 getSchemaForResource 方法的返回值标记了有可能返回 void
    // 目前并不会有得不到 schema 的情况
    if (!resolvedSchema) {
      return;
    }
    const validationResult = new ValidationResult();
    // matchingSchemas 是用来未来发生某些节点需要排除在本次校验外的情况
    // -1 和 undefined 代表没有要排除的节点，此处是做个预留
    // SchemaCollector 构造方法的第一个参数 focusOffset 代表要校验的 ASTNode 要包含该 offset，为 -1 代表不用校验 offset
    // SchemaCollector 构造方法的第二个参数 exclude 代表排除校验的 ASTNode，为 undefined 代表没有要排除校验的 ASTNode
    const matchingSchemas = new SchemaCollector(undefined, undefined);
    docRoot.validate(resolvedSchema.schema, validationResult, matchingSchemas);
    const diagnostics: vscode.Diagnostic[] = validationResult.problems.map(problem => {
      return new vscode.Diagnostic(
        new vscode.Range(
          document.positionAt(problem.location.start),
          document.positionAt(problem.location.end)
        ),
        problem.message,
        vscode.DiagnosticSeverity.Error,
      );
    });
    this.clearAndSetDocumentDiagnostic(document, diagnostics);
    return;
  }

  private clearAndSetDocumentDiagnostic(document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]) {
    let diagnosticCollection: vscode.DiagnosticCollection;
    if (!diagnosticResult[document.uri.fsPath]) {
      diagnosticResult[document.uri.fsPath] = vscode.languages.createDiagnosticCollection('FunctionCompute');
    }
    diagnosticCollection = diagnosticResult[document.uri.fsPath];
    diagnosticCollection.clear();
    diagnosticCollection.set(document.uri, diagnostics);
  }

  private parse(text: string): ASTNode {
    return buildAstRecursively(undefined, Yaml.load(text));;
  }

  private cleanTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

}
