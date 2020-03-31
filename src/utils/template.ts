import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';
import { serverlessConfigs } from './constants';

export async function getTemplateFiles(): Promise<string[]> {
  const singleMode = <boolean>vscode.workspace.getConfiguration()
    .get(serverlessConfigs.ALIYUN_FC_SINGLE_TEMPLATE_MODE);
  const workspaceRoot = vscode.workspace.rootPath;
  const files: string[] = [];

  if (!workspaceRoot) {
    return files;
  }

  if (singleMode) {
    for (const template of ['template.yml', 'template.yaml']) {
      const templatePath = path.resolve(workspaceRoot, template);
      if (await fs.pathExists(templatePath)) {
        files.push(templatePath);
        break;
      }
    }
  } else {
    const templates = <string[]>vscode.workspace.getConfiguration()
      .get(serverlessConfigs.ALIYUN_FC_MULTI_TEMPLATES_PATH);
    for (const template of templates) {
      const templatePath = path.isAbsolute(template) ? template : path.resolve(workspaceRoot, template);
      if (await fs.pathExists(templatePath)) {
        files.push(templatePath);
      }
    }
  }

  return files;
}
