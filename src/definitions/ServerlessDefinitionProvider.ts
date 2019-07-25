import * as vscode from 'vscode';
import * as path from 'path';
import { isPathExists, isDirectory } from '../utils/file';
import { getHandlerFileName } from '../utils/runtime';
import { recordPageView } from '../utils/visitor';

export class ServerlessDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
  vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
    const cwd = vscode.workspace.rootPath;
    if (!cwd) {
      return;
    }
    if (!this.containsTemplate(document)) {
      return;
    }
    recordPageView('/showFuncDefineLink');
    const lineTxt = document.lineAt(position.line);
    const existHanderProp = lineTxt.text.indexOf('Handler') > -1;
    const existInitializerProp = lineTxt.text.indexOf('Initializer') > -1;
    if (existHanderProp || existInitializerProp) {
      let codeUri = this.findSiblingProp(document, position, 'CodeUri');
      if (!codeUri) {
        return;
      }
      codeUri = path.join(cwd, codeUri);
      if (!isPathExists(codeUri)) {
        return;
      }
      if (isDirectory(codeUri)) {
        let fileName: any;
        const runtime = this.findSiblingProp(document, position, 'Runtime');
        if (!runtime) {
          return;
        }
        if (existHanderProp) {
          const handler = this.findSiblingProp(document, position, 'Handler');
          if (!handler) {
            return;
          }
          fileName = getHandlerFileName(handler, runtime);
        }

        if (existInitializerProp) {
          const initializer = this.findSiblingProp(document, position, 'Initializer');
          if (!initializer) {
            return;
          }
          fileName = getHandlerFileName(initializer, runtime);
        }

        if (!fileName) {
          return;
        }
        codeUri = path.join(codeUri, fileName);
      }
      return <vscode.LocationLink[]> [
        {
          targetUri: vscode.Uri.file(codeUri),
          targetRange: new vscode.Range(0, 0, 0, 0),
          originSelectionRange: new vscode.Range(
            position.line,
            this.indexOfNonWhiteSpace(lineTxt.text, lineTxt.text.indexOf(':') + 1),
            position.line,
            lineTxt.text.length,
          ),
        }
      ]
    }
  }

  private containsTemplate(document: vscode.TextDocument): boolean {
    const cwd = vscode.workspace.rootPath;
    if (!cwd) {
      return false;
    }
    if (path.join(cwd, 'template.yml') !== document.fileName
      && path.join(cwd, 'template.yaml') !== document.fileName) {
      return false;
    }
    return true;
  }

  /**
   * 返回指定的 prop 在 document 中的 value
   * 该方法将会根据 position 指定的位置确定 prop 在 yaml 中的 level，依次在文档中向上向下寻找同级别的 prop，
   * 直到遇见 prop 或 读取到文档开头结尾 或 遇见父级 prop 就退出
  */
  private findSiblingProp(document: vscode.TextDocument, position: vscode.Position, propName: string)
    : string | undefined {
    let lineNumber = position.line;
    let lineTxt = document.lineAt(position.line).text;
    const spaceCnt = this.countLeadingSpace(lineTxt);
    let cnt = spaceCnt;
    while(cnt >= spaceCnt) {
      if (cnt === spaceCnt && lineTxt.indexOf(propName) > -1) {
        return this.getValue(lineTxt);
      }
      if (--lineNumber < 0) {
        break;
      }
      lineTxt = document.lineAt(lineNumber).text;
      cnt = this.countLeadingSpace(lineTxt);
    }
    lineNumber = position.line;
    lineTxt = document.lineAt(lineNumber).text;
    cnt = this.countLeadingSpace(lineTxt);;
    while(cnt >= spaceCnt) {
      if (cnt === spaceCnt && lineTxt.indexOf(propName) > -1) {
        return this.getValue(lineTxt);
      }
      if (++lineNumber >= document.lineCount) {
        break;
      }
      lineTxt = document.lineAt(lineNumber).text;
      cnt = this.countLeadingSpace(lineTxt);
    }
    return;
  }

  private countLeadingSpace(str: string) {
    let preSpaceCnt = 0;
    for (const ch of str) {
      if (ch === ' ') {
        preSpaceCnt++;
      } else {
        break;
      }
    }
    return preSpaceCnt;
  }

  private getValue(kvLine: string): string |  undefined {
    const arr = kvLine.split(':');
    if (arr.length !== 2) {
      return;
    }
    return arr[1].trim();
  }

  private indexOfNonWhiteSpace(str: string, startIndex: number) {
    let i = startIndex;
    while(i < str.length && str.charAt(i) === ' ') {
      i++;
    }
    return i;
  }
}
