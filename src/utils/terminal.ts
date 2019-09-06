import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';

export function getFunctionComputeTerminal(cwd?: string): vscode.Terminal {
  const terminal = isExistFunctionComputeTerminal();
  if (terminal) {
    terminal.dispose();
  }
  return createFunctionComputeTerminal(cwd);
}

export function getFunctionComputeWorkderTerminal(): vscode.Terminal {
  const terminal = isExistFunctionComputeWorkerTerminal();
  if (terminal) {
    return terminal;
  }
  return createFunctionComputeWorkerTerminal();
}

const FUNCTION_COMPUTE_TERMINAL = 'Function Compute#1';
const FUNCTION_COMPUTE_WORKER_TERMINAL = 'Function Compute#2';

function isExistFunctionComputeTerminal(): vscode.Terminal | null {
  let terminals = vscode.window.terminals;
  terminals = terminals.filter(terminal => terminal.name === FUNCTION_COMPUTE_TERMINAL)
  if (terminals && terminals.length > 0) {
    return terminals[0];
  }
  return null;
}

function isExistFunctionComputeWorkerTerminal(): vscode.Terminal | null {
  let terminals = vscode.window.terminals;
  terminals = terminals.filter(terminal => terminal.name === FUNCTION_COMPUTE_WORKER_TERMINAL)
  if (terminals && terminals.length > 0) {
    return terminals[0];
  }
  return null;
}

function createFunctionComputeTerminal(cwd?: string): vscode.Terminal {
  const extBinPath = path.resolve(os.homedir(), '.aliyun-serverless', 'bin');
  const binPath = process.env.PATH + path.delimiter + extBinPath;
  return vscode.window.createTerminal({
    name: FUNCTION_COMPUTE_TERMINAL,
    cwd,
    env: {
      'PATH': binPath,
    },
  });
}

function createFunctionComputeWorkerTerminal(): vscode.Terminal {
  return vscode.window.createTerminal(FUNCTION_COMPUTE_WORKER_TERMINAL);
}
