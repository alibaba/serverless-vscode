import * as vscode from 'vscode';
import { ext } from '../extensionVariables';
import { TemplateService } from '../services/TemplateService';
import { serverlessCommands } from '../utils/constants';
import { isPython } from '../utils/runtime';
import { recordPageView } from '../utils/visitor';
import { Resource, FunctionResource, ResourceType } from '../models/resource';
import { MultiStepInput } from '../ui/MultiStepInput';
import { FunService } from '../services/FunService';

export function installPackage(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(
    serverlessCommands.INSTALL_PACKAGE.id,
    async (node: Resource) => {
      recordPageView('/installPackage');
      if (node.resourceType !== ResourceType.Function) {
        return;
      }
      const funcRes = node as FunctionResource;
      await process(funcRes.serviceName, funcRes.functionName, funcRes.templatePath as string)
        .catch(ex => vscode.window.showErrorMessage(ex.message));
    }
  ));
}

interface State {
  packageType: string;
  packageNames: string;
}

async function process(serviceName: string, functionName: string, templatePath: string) {
  if (!ext.cwd) {
    throw new Error('Please open a workspace');
  }

  const templateService = new TemplateService(templatePath);
  const functionInfo = await templateService.getFunction(serviceName, functionName);
  const {
    Properties: {
      Runtime: runtime = '',
      CodeUri: codeUri = '',
    } = {}
  } = functionInfo;

  if (!codeUri) {
    throw new Error('CodeUri should not be empty');
  }

  let packageTypes: vscode.QuickPickItem[] = [{ label: 'apt' }];
  if (isPython(runtime)) {
    packageTypes.push({ label: 'pip' });
  }

  async function collectInfo() {
    const state = {} as Partial<State>;
    await MultiStepInput.run(input => pickPackageType(input, state));
    return state as State;
  }

  async function pickPackageType(input: MultiStepInput, state: Partial<State>) {
    const pick = await input.showQuickPick({
      title: 'Install Package (Choose Package Type)',
      step: 1,
      totalSteps: 2,
      placeholder: 'Pick package type',
      items: packageTypes,
    });
    state.packageType = (<any>pick).label as string;
    return (input: MultiStepInput) => inputPackageNames(input, state);
  }

  async function inputPackageNames(input: MultiStepInput, state: Partial<State>) {
    const names = await input.showInputBox({
      title: 'Install Package (Input Package Names)',
      step: 2,
      totalSteps: 2,
      value: state.packageNames || '',
      prompt: 'Input package names separated by spaces(such as: a b c)',
      validate: validatePackageNames,
    });
    state.packageNames = names as string;
    return;
  }

  async function validatePackageNames(input: string): Promise<string | undefined> {
    return input ? undefined : 'Package names should not be empty';
  }

  const state = await collectInfo();

  if (!state.packageNames || !state.packageType) {
    return;
  }

  const funService = new FunService(templatePath);
  funService.install(runtime, codeUri, state.packageType, state.packageNames);
}


