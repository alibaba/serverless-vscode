import * as vscode from 'vscode';
import { FunctionDescriptor } from '../descriptors/descriptor';

export const templateChangeEventEmitter = new vscode.EventEmitter<string>();
export const localStartChangeEventEmitter = new vscode.EventEmitter<FunctionDescriptor>();
