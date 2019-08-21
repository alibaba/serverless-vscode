import { isPathExists } from './file';
import * as fs from 'fs';
import * as path from 'path';

const supportedRuntimes = ['nodejs6', 'nodejs8', 'nodejs10', 'python2.7', 'python3', 'php7.2'];
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
