import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { isPathExists, isDirectory, createFile } from '../utils/file';
import { serverlessCommands } from '../utils/constants';
import { MultiStepInput } from '../ui/MultiStepInput';

export function createEventFile(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(
    serverlessCommands.CREATE_EVENT_FILE.id,
    async (
      templatePath: string,
      codeUri: string,
      srcEventFilePath: string,
      callback: (fileName: string) => any,
    ) => {
      await process(templatePath, codeUri, srcEventFilePath, callback)
        .catch(ex => vscode.window.showErrorMessage(ex.message));
    }
  ));
}

interface State {
  templateName: string;
}

async function process(
  templatePath: string,
  codeUri: string,
  srcEventFilePath: string,
  callback: (fileName: string) => any,
) {
  if (!isPathExists(srcEventFilePath)) {
    throw new Error(`${srcEventFilePath} not exist`);
  }
  async function collectInfo() {
    const state = {} as Partial<State>;
    await MultiStepInput.run(input => inputTemplateName(input, state));
    return state as State;
  }

  async function inputTemplateName(input: MultiStepInput, state: Partial<State>) {
    const names = await input.showInputBox({
      title: 'Create Event Template(Input Template Name)',
      step: 1,
      totalSteps: 1,
      value: state.templateName || '',
      prompt: 'Input template name',
      validate: validateTemplateName,
    });
    state.templateName = names as string;
    return;
  }

  async function validateTemplateName(input: string): Promise<string | undefined> {
    return input ? undefined : 'Template name should not be empty';
  }

  const state = await collectInfo();

  if (!state.templateName) {
    return;
  }

  const fileName = `${state.templateName}.evt`;
  let targetEventPath = path.resolve(path.dirname(srcEventFilePath), fileName);

  if (isPathExists(targetEventPath)) {
    throw new Error(`${targetEventPath} already exist`);
  }

  const eventContent = fs.readFileSync(srcEventFilePath, 'utf8');
  if (!createFile(targetEventPath)) {
    throw new Error(`${targetEventPath} create fail`);
  }
  fs.writeFileSync(targetEventPath, eventContent);

  callback(fileName);
}
