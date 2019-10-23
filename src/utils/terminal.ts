import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';

const END_OF_TEXT = '\x03';

export function getFunctionComputeTerminal(cwd?: string, terminalName?: string): vscode.Terminal {
  const name = terminalName || FUNCTION_COMPUTE_TERMINAL;
  const terminal = isExistFunctionComputeTerminal(name);
  if (terminal) {
    terminal.sendText(END_OF_TEXT);
    if (cwd) {
      terminal.sendText(generateChangeDirectoryCmd(cwd));
    }
    return terminal;
  }
  return createFunctionComputeTerminal(cwd, name);
}

export function abortTask(terminalName: string): vscode.Terminal | undefined {
  const terminal = isExistFunctionComputeTerminal(terminalName);
  if (terminal) {
    terminal.sendText(END_OF_TEXT);
    return terminal;
  }
}

export const FUNCTION_COMPUTE_TERMINAL = 'Function Compute#1';
export const FUNCTION_COMPUTE_WORKER_TERMINAL = 'Function Compute#2';

function isExistFunctionComputeTerminal(name: string): vscode.Terminal | null {
  let terminals = vscode.window.terminals;
  terminals = terminals.filter(terminal => terminal.name === name)
  if (terminals && terminals.length > 0) {
    return terminals[0];
  }
  return null;
}

function generateChangeDirectoryCmd(cwd: string) {
  if (os.platform() === 'win32') {
    const terminal = vscode.workspace.getConfiguration().get('terminal.integrated.shell.windows') as string;
    if (terminal && terminal.indexOf('cmd') > -1) {
      return `cd /d "${cwd}"`;
    }
  }
  return `cd "${cwd}"`;
}

function createFunctionComputeTerminal(cwd?: string, terminalName?: string): vscode.Terminal {
  const extBinPath = path.resolve(os.homedir(), '.aliyun-serverless', 'bin');
  const binPath = process.env.PATH + path.delimiter + extBinPath;
  return vscode.window.createTerminal({
    name: terminalName || FUNCTION_COMPUTE_TERMINAL,
    cwd,
    env: {
      'PATH': binPath,
      'FUN_DISABLE_VERSION_CHECK': '1',
    },
  });
}
