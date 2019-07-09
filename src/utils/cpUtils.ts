import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as os from 'os';

export namespace cpUtils {
  export async function tryExecuteCommand(outputChannel: vscode.OutputChannel | undefined, workDirectory: string | undefined, command: string, ...args: string[]): Promise<ICommandResult> {
    return await new Promise((resolve: (res: ICommandResult) => void, reject: (e: Error) => void) => {
      let output: string = '';
      let outputIncludingStderr: string = '';
      const formattedArgs: string = args.join(' ');

      workDirectory = workDirectory || os.tmpdir();
      const options: cp.SpawnOptions = {
        shell: true,
        cwd: workDirectory,
      };
      const childProc: cp.ChildProcess = cp.spawn(command, args, options);

      if (outputChannel) {
        outputChannel.appendLine(`Running command: ${command} ${formattedArgs}`);
      }

      childProc.stdout.on('data', (data: string | Buffer) => {
        data = data.toString();
        output = output.concat(data);
        outputIncludingStderr = outputIncludingStderr.concat(data);
        if (outputChannel) {
          outputChannel.append(data);
        }
      });

      childProc.stderr.on('data', (data: string | Buffer) => {
        data = data.toString();
        outputIncludingStderr = outputIncludingStderr.concat(data);
        if (outputChannel) {
          outputChannel.append(data);
        }
      });

      childProc.on('error', reject);
      childProc.on('close', (code: number) => {
        resolve({
          code,
          output,
          outputIncludingStderr,
          formattedArgs,
        });
      })
    });
  }

  export async function executeCommand(outputChannel: vscode.OutputChannel | undefined, workDirectory: string | undefined, command: string, ...args: string[]): Promise<string> {
    const result: ICommandResult = await tryExecuteCommand(outputChannel, workDirectory, command, ...args);
    if (result.code !== 0) {
      if (outputChannel) {
        outputChannel.show();
        throw new Error(`Fail to run ${command} command. Check output for more details`);
      } else {
        throw new Error(`Command "${command} ${result.formattedArgs}" failed with exit code "${result.code}":${os.EOL}${result.outputIncludingStderr}`);
      }
    } else {
      if (outputChannel) {
        outputChannel.appendLine(`Finished running command: "${command} ${result.formattedArgs}".`);
      }
    }
    return result.output;
  }

  export interface ICommandResult {
    code: number;
    output: string;
    outputIncludingStderr: string;
    formattedArgs: string;
  }
}
