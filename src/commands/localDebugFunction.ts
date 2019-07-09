import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as open from 'open';
import * as constants from '../utils/constants';
import { validateFunInstalled } from '../validate/validateFunInstalled';
import { isPathExists, createDirectory, createLaunchFile, createEventFile } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { FunService } from '../services/FunService';
import { TemplateService } from '../services/TemplateService';
import { Resource } from '../models/resource';

export function localDebugFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('fc.extension.localResource.local.invoke.debug', async (node: Resource) => {
    recordPageView('/localDebug');
    if (! await validateFunInstalled()) {
      vscode.window.showInformationMessage('You should install "@alicloud/fun" first', 'Goto', 'Cancel')
        .then(choice => {
          if (choice === 'Goto') {
            open(constants.FUN_INSTALL_URL);
          }
        });
      return;
    }
    const serviceName = node.resourceProperties && node.resourceProperties.serviceName ? node.resourceProperties.serviceName : '';
    const functionName = node.label;
    await process(serviceName, functionName);
  }));
}

async function process(serviceName: string, functionName: string) {
  let cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const templateService = new TemplateService(cwd);
  const functionInfo = await templateService.getFunction(serviceName, functionName);
  if (!functionInfo.Properties) {
    vscode.window.showInformationMessage(`Please complete ${serviceName}/${functionName} properties`);
    return;
  }
  const supportRuntome = ['nodejs6', 'nodejs8', 'python2.7', 'python3', 'php7.2'];
  const runtime = functionInfo.Properties.Runtime;
  if (!supportRuntome.includes(runtime)) {
    vscode.window.showInformationMessage(`${runtime} debug will be support soon.`);
  }
  // 尝试从 launch.json 读取配置
  const configurationName = getConfigurationName(serviceName, functionName);
  const launchFilePath = path.join(cwd, '.vscode','launch.json');
  const launchInfo = vscode.workspace.getConfiguration('launch', vscode.Uri.file(launchFilePath));
  const configurations = launchInfo.get('configurations');
  let filterConfigurations = (<vscode.DebugConfiguration[]>configurations).filter(configuration => configuration.name === configurationName);
  let configuration: vscode.DebugConfiguration;
  if (!filterConfigurations || !filterConfigurations.length) {
    // 生成默认 debug configuration
    configuration = generateDebugConfiguration(serviceName, functionName, functionInfo);
    // 将默认的 debug configuration 添加到 launch.json 中
    addDebugConfigurationToLaunchFile(configuration);
  } else {
    configuration = filterConfigurations[0];
  }
  let eventFilePath = "";
  let hasHttpTrigger = false;
  if (functionInfo.Events) {
    Object.entries(functionInfo.Events).forEach(([name, resource]) => {
      if (resource && (<any>resource).Type === "HTTP") {
        hasHttpTrigger = true;
      }
    })
  }
  if (!hasHttpTrigger) {
    // 普通的函数，读取 event 文件
    try {
      const codeUri = path.join(cwd, functionInfo.Properties.CodeUri);
      const eventFileStat = fs.statSync(codeUri);
      if (eventFileStat.isDirectory()) {
        eventFilePath = path.join(codeUri, 'event.dat');
      }
      if (eventFileStat.isFile()) {
        eventFilePath = path.join(path.dirname(codeUri), 'event.dat');
      }
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
      return;
    }
    if (!isPathExists(eventFilePath)) {
      // 生成默认 event 文件
      if (!createEventFile(eventFilePath)) {
        vscode.window.showErrorMessage(`Create ${eventFilePath} event file failed`);
        return;
      }
    }
  }
  // 启动 fun local
  const funService = new FunService(cwd);

  if (runtime === 'php7.2') {
    vscode.debug.startDebugging(undefined, configuration);
  }
  if (hasHttpTrigger) {
    funService.localStartDebug(serviceName, functionName, configuration.port);
  } else {
    funService.localInvokeDebug(serviceName, functionName, configuration.port, eventFilePath);
  }
  if (runtime.indexOf('python') > -1) {
    await new Promise((resolve) => {
      setTimeout(resolve, 4000);
    });
    vscode.debug.startDebugging(undefined, configuration);
  }
  if (runtime.indexOf('nodejs') > -1) {
    vscode.debug.startDebugging(undefined, configuration);
  }
}

function getConfigurationName(serviceName: string, functionName: string) {
  return `fc/${serviceName}/${functionName}`;
}

function getDebugTypeFromLanguage(runtime: string): string {
  if (runtime.indexOf('nodejs') > -1) {
    return 'node';
  }
  if (runtime.indexOf('python') > -1) {
    return 'python';
  }
  if (runtime.indexOf('php') > -1) {
    return 'php';
  }
  return 'node';
}

function getDebugProtocol(runtime: string): string {
  if (runtime === 'nodejs6') {
    return 'legacy'; 
  }
  if (runtime === 'nodejs8') {
    return 'inspector';
  }
  return ''; // TODO: support other runtime;
}

function generateDebugConfiguration(serviceName: string, functionName: string, resource: TplResourceElementElement): vscode.DebugConfiguration {
  const { Properties: properties } = resource;
  let cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return <vscode.DebugConfiguration> {};
  }
  let localRootPath = path.join(cwd, properties.CodeUri);
  try {
    const localRootStat = fs.statSync(localRootPath);
    if (localRootStat.isFile()) {
      localRootPath = path.dirname(localRootPath);
    }
  } catch (err) {
    vscode.window.showErrorMessage(err.message);
    return <vscode.DebugConfiguration> {};
  }
  return generateDebugConfigurationItem(serviceName, functionName, properties.Runtime, localRootPath);
}

function generateDebugConfigurationItem(serviceName: string, functionName: string, runtime: string, localRoot: string): vscode.DebugConfiguration {
  if (runtime.indexOf('nodejs') > -1) {
    return <vscode.DebugConfiguration> {
      name: getConfigurationName(serviceName, functionName),
      type: getDebugTypeFromLanguage(runtime),
      request: 'attach',
      address: 'localhost',
      port: 3000,
      localRoot: localRoot,
      remoteRoot: '/code',
      protocol: getDebugProtocol(runtime),
      stopOnEntry: false,
    };
  }
  if (runtime.indexOf('python') > -1) {
    return <vscode.DebugConfiguration> {
      name: getConfigurationName(serviceName, functionName),
      type: getDebugTypeFromLanguage(runtime),
      request: 'attach',
      host: 'localhost',
      port: 3000,
      pathMappings: [
        {
          localRoot: localRoot,
          remoteRoot: '/code',
        }
      ]
    };
  }
  if (runtime.indexOf('php') > -1) {
    return <vscode.DebugConfiguration> {
      name: getConfigurationName(serviceName, functionName),
      type: getDebugTypeFromLanguage(runtime),
      request: 'launch',
      port: 3000,
      stopOnEntry: false,
      pathMappings: {
        '/code': localRoot,
      },
      ignore: [
        '/var/fc/runtime/**',
      ],
    };
  }
  return <vscode.DebugConfiguration> {};
}

function addDebugConfigurationToLaunchFile(debugConfiguration: vscode.DebugConfiguration) {
  let cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return <vscode.DebugConfiguration> {};
  }
  const vscodeDirPath = path.join(cwd, '.vscode');
  if (!isPathExists(vscodeDirPath)) {
    if (!createDirectory(vscodeDirPath)) {
      vscode.window.showErrorMessage(`Create .vscode folder failed`);
      return;
    }
  }
  const launchFilePath = path.join(cwd, '.vscode','launch.json');
  if (!isPathExists(launchFilePath)) {
    // 生成默认 launch.json 文件
    if (!createLaunchFile(launchFilePath)) {
      vscode.window.showErrorMessage(`Create launch.json failed`);
      return;
    }
  }
  const launchInfo = vscode.workspace.getConfiguration('launch', vscode.Uri.file(launchFilePath));
  const debugConfigurations = <vscode.DebugConfiguration[]>launchInfo.get('configurations');
  launchInfo.update('configurations', [...debugConfigurations, debugConfiguration]);
}