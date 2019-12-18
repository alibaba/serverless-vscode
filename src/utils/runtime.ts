import { isPathExists, createDirectory } from './file';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { ncp } from 'ncp';

const cp = util.promisify(ncp);

const supportedRuntimes =
  ['nodejs6', 'nodejs8', 'nodejs10', 'python2.7', 'python3', 'php7.2', 'java8'];
const types = ['NORMAL', 'HTTP'];

export function getSupportedRuntimes() {
  return supportedRuntimes;
}

export function isSupportedRuntime(runtime: string) {
  return supportedRuntimes.includes(runtime);
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
