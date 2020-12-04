import * as fs from 'fs';
import * as path from 'path'
import { dirname } from 'path';

export function isPathExists(path: string): boolean {
  try {
    fs.accessSync(path);
  } catch (err) {
    return false;
  }
  return true;
}

export function isDirectory(p: string): boolean {
  try {
    const stat = fs.statSync(p);
    return stat.isDirectory();
  } catch (err) {
    return false;
  }
}

export function isNotEmpty(p: string): boolean {
  try {
    return fs.readdirSync(p).length > 0;
  } catch (err) {
    return false;
  }
}

export function createDirectory(p: string): boolean {
  try {
    if (isPathExists(dirname(p))) {
      fs.mkdirSync(p);
      return true;
    }
    if (!createDirectory(dirname(p))) {
      return false;
    }
    fs.mkdirSync(p);
    return true;
  } catch (err) {
    return false;
  }
}

const createFileRecursively = (content: string): (filePath: string) => boolean => {
  return (filePath: string): boolean => {
    if (isPathExists(filePath)) {
      return false;
    }
    if (!isPathExists(dirname(filePath)) && !createDirectory(dirname(filePath))) {
      return false;
    }
    try {
      fs.writeFileSync(filePath, content);
    } catch (err) {
      return false;
    }
    return true;
  }
}

export const createFile = createFileRecursively('');

export const createJsonFile = createFileRecursively(`{
}`);

export const createEventFile = createFileRecursively(`{
  "key": "value"
}`);

export const createLaunchFile = createFileRecursively(`{
  "version": "0.2.0",
  "configurations": []
}`);

export function checkExistsWithTimeout(filePath: string, timeout: number) {
  return new Promise(function (resolve, reject) {

      var timer = setTimeout(function () {
          watcher.close();
          reject(new Error('File did not exists and was not created during the timeout.'));
      }, timeout);

      fs.access(filePath, fs.constants.R_OK, function (err) {
          if (!err) {
              clearTimeout(timer);
              watcher.close();
              resolve();
          }
      });

      var dir = path.dirname(filePath);
      var basename = path.basename(filePath);
      var watcher = fs.watch(dir, function (eventType, filename) {
          if (eventType === 'rename' && filename === basename) {
              clearTimeout(timer);
              watcher.close();
              resolve();
          }
      });
  });
}
