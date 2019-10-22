import * as vscode from 'vscode';
import * as Yaml from 'yaml-ast-parser';
import * as _ from 'lodash';
import { isFlowDefinitionDocument } from '../utils/document';
import { ASTNode } from '../parser/ASTNode';
import { buildAstRecursively } from '../parser/parser';
import { JSONSchemaService } from '../language-service/services/jsonSchemaService';
import { ValidationResult, SchemaCollector } from '../language-service/parser/jsonParser';
import { recordPageView } from '../utils/visitor';

const validationDelayMs = 200;
const diagnosticResult: { [uri: string]: vscode.DiagnosticCollection } = {};

export class FlowDefinitionDiagnosticsProvider {
  private diagnostic = _.throttle(this.doDiagnostic, validationDelayMs);
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
    if (!document || !isFlowDefinitionDocument(document)) {
      return;
    }
    recordPageView('/flowDefinitionDiagnostic');
    this.diagnostic(document);
  }

  private async doDiagnostic(document: vscode.TextDocument): Promise<void> {
    const docRoot = this.parse(document.getText());
    const jsonSchemaService = JSONSchemaService.getJSONSchemaService();
    const resolvedSchema = await jsonSchemaService.getSchemaForFlow();
    if (!resolvedSchema) {
      return;
    }
    const validationResult = new ValidationResult();
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
      diagnosticResult[document.uri.fsPath] = vscode.languages.createDiagnosticCollection('FunctionFlow');
    }
    diagnosticCollection = diagnosticResult[document.uri.fsPath];
    diagnosticCollection.clear();
    diagnosticCollection.set(document.uri, diagnostics);
  }

  private parse(text: string): ASTNode {
    return buildAstRecursively(undefined, Yaml.load(text));;
  }

}
