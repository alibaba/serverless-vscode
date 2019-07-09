import * as fs from 'fs';
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

export function createFile(p: string): boolean {
  try {
    if (isPathExists(p)) {
      return false;
    }
    if (isPathExists(dirname(p))) {
      fs.writeFileSync(p, '');
      return true;
    }
    if (!createDirectory(dirname(p))) {
      return false;
    }
    fs.writeFileSync(p, '');
    return true;
  } catch (err) {
    return false;
  }
}

export function createEventFile(eventFilePath: string): boolean {
  try {
    fs.writeFileSync(eventFilePath, `{
"key": "value"
}`);
  } catch(err) {
    return false;
  }
  return true;
}

export function createLaunchFile(launchFilePath: string): boolean {
  try {
    fs.writeFileSync(launchFilePath, `{
"version": "0.2.0",
"configurations": []
}`);
  } catch(err) {
    return false;
  }
  return true;
}