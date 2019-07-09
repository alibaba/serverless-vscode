import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';

const configFilePath = path.join(os.homedir(), '.fcli', 'config.yaml');

export function getConfig() {
  if (!fs.existsSync(configFilePath)) {
    vscode.window.showErrorMessage('Please run fun config first');
    return null;
  }
  const configContent = fs.readFileSync(configFilePath, 'utf8');
  const config = yaml.safeLoad(configContent, { schema: yaml.JSON_SCHEMA });
  return config;
}