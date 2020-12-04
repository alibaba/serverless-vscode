import { isPathExists, createDirectory } from './file';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as vscode from 'vscode';
import { ncp } from 'ncp';
import { FunService } from '../services/FunService';

const cp = util.promisify(ncp);

const supportedRuntimes =
  ['nodejs6', 'nodejs8', 'nodejs10', 'nodejs12', 'python2.7', 'python3', 'php7.2', 'java8', 'dotnetcore2.1', 'custom'];
  const types = ['NORMAL', 'HTTP'];

const supportedSystemRuntimeTemplates =
  ['event-nodejs12', 'event-nodejs10', 'event-nodejs8', 'event-nodejs6', 'event-python3',
    'event-python2.7', 'event-java8', 'event-java11', 'event-php7.2', 'event-dotnetcore2.1',
    'http-trigger-nodejs12', 'http-trigger-nodejs10', 'http-trigger-nodejs8', 'http-trigger-nodejs6',
    'http-trigger-python3', 'http-trigger-python2.7', 'http-trigger-java8', 'http-trigger-java11',
    'http-trigger-php7.2', 'http-trigger-dotnetcore2.1', 'http-trigger-spring-boot',
    'http-trigger-node-puppeteer'];

// except custom-cpp and custom-fsharp
const supportedCustomRuntimeTemplates =
  ['custom-springboot', 'custom-golang', 'custom-dart', 'custom-lua',
    'custom-powershell', 'custom-ruby', 'custom-rust', 'custom-typescript'];

export function getSupportedRuntimes() {
  return supportedRuntimes;
}

export function isSupportedRuntime(runtime: string) {
  return supportedRuntimes.includes(runtime);
}

export function getSupportedInitTemplates() {
  return supportedSystemRuntimeTemplates.concat(supportedCustomRuntimeTemplates);
}

export function isSupportedSystemRuntimeTemplates(template: string) {
  return supportedSystemRuntimeTemplates.includes(template);
}

export function getSupportedCustomRuntimeTemplates() {
  return supportedCustomRuntimeTemplates;
}

export function isSupportedCustomRuntimeTemplates(template: string) {
  return supportedCustomRuntimeTemplates.includes(template);
}

export function getHandlerFileByRuntime(runtime: string): string {
  if (runtime.indexOf('nodejs') > -1) {
    return 'index.js';
  }
  if (runtime.indexOf('python') > -1) {
    return 'index.py';
  }
  if (runtime.indexOf('java') > -1) {
    return ''; // TODO: support java
  }
  if (runtime.indexOf('php') > -1) {
    return 'index.php';
  }
  return '';
}

export function getSuffix(runtime: string): string | undefined {
  if (!supportedRuntimes.includes(runtime)) {
    return;
  }
  if (runtime.includes('nodejs')) {
    return '.js';
  }
  if (runtime.includes('python')) {
    return '.py';
  }
  if (runtime.includes('php')) {
    return '.php';
  }
  return;
}

export function getHandlerFileName(handler: string, runtime: string): string | undefined {
  if (!supportedRuntimes.includes(runtime)) {
    return;
  }
  const arr = handler.split('.');
  if (arr.length !== 2) {
    return;
  }
  return `${arr[0]}${getSuffix(runtime)}`;
}

export function createIndexFile(type: string, runtime: string, ph: string): boolean {
  if (!supportedRuntimes.includes(runtime)) {
    return false;
  }
  if (!types.includes(type)) {
    return false;
  }
  if (isPathExists(ph)) {
    return false;
  }
  if (runtime.includes('nodejs')) {
    return type === 'NORMAL' ? createNodejsHelloWorldIndexFile(ph) : createNodejsHttpIndexFile(ph);
  }
  if (runtime.includes('python')) {
    return type === 'NORMAL' ? createPythonHelloWorldIndexFile(ph) : createPythonHttpIndexFile(ph);
  }
  if (runtime.includes('php')) {
    return type === 'NORMAL' ? createPhpHelloWorldIndexFile(ph) : createPhpHttpIndexFile(ph);
  }
  return false;
}

function getLanguage(runtime: string): string | undefined {
  if (isNodejs(runtime)) {
    return 'nodejs';
  }
  if (isPython(runtime)) {
    return 'python';
  }
  if (isPhp(runtime)) {
    return 'php';
  }
  if (isJava(runtime)) {
    return 'java';
  }
  if (isDotnetcore(runtime)) {
    return 'dotnetcore';
  }
  return;
}

function generateTemplateName(type: string, runtime: string): string | undefined {
  let suffix: string;
  if (type === 'NORMAL') {
    suffix = 'helloworld';
  } else if (type === 'HTTP') {
    suffix = 'http';
  } else {
    return;
  }
  const prefix = getLanguage(runtime);
  if (!prefix) {
    return;
  }
  return `${prefix}-${suffix}`;
}

export async function createCodeFile(type: string, runtime: string, codeUriPath: string) {
  if (!isSupportedRuntime(runtime)) {
    throw new Error(`${runtime} is not supported`);
  }
  if (!types.includes(type)) {
    throw new Error(`${type} is not supported`);
  }
  if (!isPathExists(codeUriPath)) {
    if (!createDirectory(codeUriPath)) {
      throw new Error(`Create ${codeUriPath} error`);
    }
  }
  const templateName = generateTemplateName(type, runtime);
  if (!templateName) {
    throw new Error(`fail to generate template name. type: ${type}, runtime: ${runtime}`);
  }
  const srcDirPath = path.join(__dirname, '..', '..', 'templates', templateName);

  await cp(srcDirPath, codeUriPath).catch((err) => { throw new Error(err) });
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

export function createNodejsHelloWorldIndexFile(ph: string): boolean {
  try {
    const srcPath = path.join(__dirname, '..', '..', 'templates', 'nodejs-helloworld', 'index.js');
    fs.copyFileSync(srcPath, ph);
    return true;
  } catch (err) {
    return false;
  }
}

export function createNodejsHttpIndexFile(ph: string): boolean {
  try {
    const srcPath = path.join(__dirname, '..', '..', 'templates', 'nodejs-http', 'index.js');
    fs.copyFileSync(srcPath, ph);
    return true;
  } catch (err) {
    return false;
  }
}


export function createPythonHelloWorldIndexFile(ph: string): boolean {
  try {
    const srcPath = path.join(__dirname, '..', '..', 'templates', 'python-helloworld', 'index.py');
    fs.copyFileSync(srcPath, ph);
    return true;
  } catch(err) {
    return false;
  }
}

export function createPythonHttpIndexFile(ph: string): boolean {
  try {
    const srcPath = path.join(__dirname, '..', '..', 'templates', 'python-http', 'index.py');
    fs.copyFileSync(srcPath, ph);
    return true;
  } catch(err) {
    return false;
  }
}

export function createPhpHelloWorldIndexFile(ph: string): boolean {
  try {
    const srcPath = path.join(__dirname, '..', '..', 'templates', 'php-helloworld', 'index.php');
    fs.copyFileSync(srcPath, ph);
    return true;
  } catch(err) {
    return false;
  }
}

export function createPhpHttpIndexFile(ph: string): boolean {
  try {
    const srcPath = path.join(__dirname, '..', '..', 'templates', 'php-http', 'index.php');
    fs.copyFileSync(srcPath, ph);
    return true;
  } catch(err) {
    return false;
  }
}

export function isPython(runtime: string): boolean {
  return runtime.indexOf('python') > -1;
}

export function isNodejs(runtime: string): boolean {
  return runtime.indexOf('nodejs') > -1;
}

export function isPhp(runtime: string): boolean {
  return runtime.indexOf('php') > -1;
}

export function isJava(runtime: string): boolean {
  return runtime.indexOf('java') > -1;
}

export function isDotnetcore(runtime: string): boolean {
  return runtime.indexOf('dotnetcore') > -1;
}

export function isCustomRuntime(runtime: string) {
  return runtime.indexOf('custom') > -1;
}