import * as vscode from 'vscode'
import { createDecorationTypesByColors, isSupportedDocument } from '../utils/document';
import { recordPageView } from '../utils/visitor';

const decorationTypes = createDecorationTypesByColors(
  { r: 255, g: 255, b: 64, a: 0.07 },
  { r: 127, g: 255, b: 255, a: 0.07 },
  { r: 255, g: 127, b: 255, a: 0.07 },
);

const decorateDelay = 100;

export class RainbowDecorator {
  private timer: NodeJS.Timer | undefined;
  private startedDecoration: boolean = false;
  private static readonly rainbowDecorator
  : RainbowDecorator = new RainbowDecorator();
  public static getRainbowDecorator(): RainbowDecorator {
    return RainbowDecorator.rainbowDecorator;
  }
  private constructor() {

  }
  public decorate() {
    if (this.startedDecoration) {
      return;
    }
    this.startedDecoration = true;
    if (vscode.window.activeTextEditor) {
      this.triggerDecorateEditor(vscode.window.activeTextEditor);
    }
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        this.triggerDecorateEditor(editor);
      }
    });
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (vscode.window.activeTextEditor
        && event.document === vscode.window.activeTextEditor.document
      ) {
        this.triggerDecorateEditor(vscode.window.activeTextEditor);
      }
    });
  }

  private triggerDecorateEditor(editor: vscode.TextEditor) {
    if (!this.validateEditor(editor)) {
      return;
    }
    this.cleanTimer();
    this.timer = setTimeout(() => {
      this.decorateEditor(editor);
    }, decorateDelay);
  }

  private validateEditor(editor: vscode.TextEditor): boolean {
    const document = editor.document;
    if (!document) {
      return false;
    }
    return isSupportedDocument(document);
  }

  private decorateEditor(editor: vscode.TextEditor) {
    recordPageView('/decorateEditor');
    const regex = /^[ ]+/gm;
    const decorators: vscode.DecorationOptions[][] = new Array(decorationTypes.length).fill(undefined).map(_ => []);
    const textDocument = editor.document.getText();
    const tabSize = editor.options.tabSize as number || 2;
    let match;
    while (match = regex.exec(textDocument)) {
      const matchStr = match[0];
      if (matchStr.length % tabSize !== 0) { // 判断是否是有效空格数
        continue;
      }
      let i = 0;
      let decorationTypeIndex = 0;
      while (i < matchStr.length) {
        const startPos = editor.document.positionAt(match.index + i);
        i += tabSize;
        const endPos = editor.document.positionAt(match.index + i);
        decorators[decorationTypeIndex].push(
          <vscode.DecorationOptions>{
            range: new vscode.Range(startPos, endPos),
          }
        );
        decorationTypeIndex = decorationTypeIndex + 1 === decorationTypes.length ? 0 : decorationTypeIndex + 1;
      }
    }
    decorationTypes.forEach((decorationType, index) => {
      editor.setDecorations(decorationType, decorators[index]);
    });
  }

  private cleanTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
