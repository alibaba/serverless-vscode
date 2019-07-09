import * as vscode from 'vscode';
import { cpUtils } from '../utils/cpUtils';

export async function validateFunInstalled(): Promise<boolean> {
  try {
    await cpUtils.executeCommand(undefined, undefined, 'fun', '--version');
    return true;
  } catch (err) {
    return false;
  }
}
