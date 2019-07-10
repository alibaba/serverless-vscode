import * as vscode from 'vscode';
import * as path from 'path';

export class TemplateUtil {
  getTemplateFilePath(): string | undefined {
    const cwd = vscode.workspace.rootPath;
    if (!cwd) {
      return;
    }
    return path.join(cwd, 'template.yaml');
  }


}

