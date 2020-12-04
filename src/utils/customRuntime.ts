import * as vscode from 'vscode';
import { isPathExists, createDirectory } from './file';
import { FunService } from '../services/FunService';
import { serverlessCommands } from './constants';

const supportedSystemRuntimeTemplates = 
  [ 'event-nodejs12', 'event-nodejs10', 'event-nodejs8', 'event-nodejs6', 'event-python3',
    'event-python2.7', 'event-java8', 'event-java11', 'event-php7.2', 'event-dotnetcore2.1',
    'http-trigger-nodejs12', 'http-trigger-nodejs10', 'http-trigger-nodejs8', 'http-trigger-nodejs6',
    'http-trigger-python3', 'http-trigger-python2.7', 'http-trigger-java8', 'http-trigger-java11',
    'http-trigger-php7.2', 'http-trigger-dotnetcore2.1', 'http-trigger-spring-boot',
    'http-trigger-node-puppeteer' ];

// except custom-cpp and custom-fsharp
const supportedCustomRuntimeTemplates =
  [ 'custom-springboot', 'custom-golang', 'custom-dart', 'custom-lua',
    'custom-powershell', 'custom-ruby', 'custom-rust', 'custom-typescript' ];

export function getSupportedInitTemplates() {
  return supportedSystemRuntimeTemplates.concat(supportedCustomRuntimeTemplates);
}

export function getSupportedCustomRuntimeTemplates() {
  return supportedCustomRuntimeTemplates;
}

export function isSupportedCustomRuntimeTemplates(template: string) {
  return supportedCustomRuntimeTemplates.includes(template);
}

export async function createCustomRuntimeCodeFile(functionTemplate: string, codeUriPath: string) {
  if (!isSupportedCustomRuntimeTemplates(functionTemplate)) {
    throw new Error(`${functionTemplate} is not supported`);
  }

  if (!isPathExists(codeUriPath)) {
    if (!createDirectory(codeUriPath)) {
      throw new Error(`Create ${codeUriPath} error`);
    }
  }

  let cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return false;
  }

  // fun init under ${codeUriPath}
  const funService = new FunService(cwd);
  funService.initTemplate(functionTemplate, codeUriPath);
}