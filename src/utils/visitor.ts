import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { isPathExists, createFile } from '../utils/file';

const ua = require('universal-analytics');
const uuidv4 = require('uuid/v4');
let machineId = '';

const confFilePath = path.join(os.homedir(), '.fc-vscode-extension', 'machine.dat');

if (!isPathExists(confFilePath)) {
  machineId = uuidv4();
  if (createFile(confFilePath)) {
    try {
      fs.writeFileSync(confFilePath, machineId);
    } catch (ex) {

    }
  }
} else {
  try {
    machineId = fs.readFileSync(confFilePath, 'utf8');
  } catch (ex) {
    machineId = uuidv4();
  }
}

const visitor = ua('UA-141899077-1', machineId);

export function recordPageView(page: string) {
  visitor.pageview(page).send();
}