import * as vscode from 'vscode';

const rosRegExp = /"?'?ROSTemplateFormatVersion"?'?:\s*"?'?2015-09-01"?'?/
const transformRegExp = /"?'?Transform"?'?:\s*"?'?Aliyun::Serverless-2018-04-03"?'?/

/**
 * 是否是支持的文档
 * @param textDocument
 */
export function isSupportedDocument(document: vscode.TextDocument): boolean {
  const textDocument = document.getText();
  return rosRegExp.test(textDocument) && transformRegExp.test(textDocument);
}

interface Output {
  newText: string;
}

interface Range {
  start: number;
  end: number;
}

function isEOF(c: number): boolean {
  return c === 0x0a /* LF */ || c === 0x0d /* CR */
}

/**
 * 使当前所在行变为合法 yaml node
 * @param textDocument
 * @param textDocumentPosition
 */
export function fixNodeForCompletion(document: vscode.TextDocument, textDocPosition: vscode.Position): Output {
  const textDocument = document.getText();
  const lineOffsets = resolveOffsetsOfLineStart(textDocument);
  const linePos = textDocPosition.line;
  const { start, end } = getRangeOfLine(textDocument, lineOffsets, linePos);
  const textLine = textDocument.substring(start, end);

  let newText = textDocument;

  // 检测当前行是否是 yaml node
  if (textLine.indexOf(':') === -1) {
    // 填充 : 使该行成为 node 节点
    // 比如：
    //    空 => aliyun:
    //    a => a:
    //    - => - aliyun:
    const trimmedText = textLine.trim();
    if (trimmedText.length === 0 ||
      (trimmedText.length === 1 && trimmedText === '-')) {
      newText =
        textDocument.substring(0, start + textLine.length) +
        (trimmedText[0] === '-' && !textLine.endsWith(' ') ? ' ' : '') +
        'aliyun:\r\n' +
        textDocument.substring(lineOffsets[linePos + 1] || textDocument.length);
    } else {
      newText =
        textDocument.substring(0, start + textLine.length) +
        ':\r\n' +
        textDocument.substring(lineOffsets[linePos + 1] || textDocument.length);
    }
  }
  return {
    newText,
  };
}

function getRangeOfLine(textDocument:string, lineOffsets: number[], linePos: number): Range {
  const start = lineOffsets[linePos];
  let end = 0;
  if (lineOffsets[linePos + 1]) {
    end = lineOffsets[linePos + 1];
  } else {
    end = textDocument.length;
  }
  while (end - 1 >= 0 && isEOF(textDocument.charCodeAt(end - 1))) {
    end--;
  }
  return { start, end };
}

/**
 * 获取每行开始偏移量
 * @param textDoc
 */
function resolveOffsetsOfLineStart(textDoc: string): number[] {
  const lineOffsets: number[] = [];
  const text = textDoc;
  let isLineStart = true;
  for (let i = 0; i < text.length; i++) {
    if (isLineStart) {
      isLineStart = false;
      lineOffsets.push(i);
    }
    const ch = text.charAt(i);
    isLineStart = ch === '\r' || ch === '\n';
    // 处理 /r/n 为换行的情况
    if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
      i++;
    }
  }
  if (isLineStart) {
    lineOffsets.push(text.length);
  }
  return lineOffsets;
}
