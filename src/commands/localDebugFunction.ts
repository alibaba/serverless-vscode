import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as rt from '../utils/runtime';
import * as Docker from 'dockerode';
import { ext } from '../extensionVariables';
import { serverlessCommands, serverlessConfigs } from '../utils/constants';
import { isPathExists, createDirectory, createLaunchFile, createEventFile } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { getOrInitEventConfig } from '../utils/localConfig';
import { cpUtils } from '../utils/cpUtils';
import { FunService } from '../services/FunService';
import { TemplateService } from '../services/TemplateService';
import { Resource, ResourceType, FunctionResource } from '../models/resource';

const { resolveRuntimeToDockerImage } = require('@alicloud/fun/lib/docker-opts.js');
const debugPortSet = new Set();
const docker = new Docker();

const EXTENSION_PYTHON_DEBUG = 'ms-python.python';
const EXTENSION_PHP_DEBUG = 'felixfbecker.php-debug';
let autoCheckPythonDebugger = true;
let autoCheckPhpDebugger = true;

export function localDebugFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.LOCAL_DEBUG.id,
    async (node: Resource, eventFilePath: string | undefined, reuse: boolean = false, debugPort?: string) => {
      recordPageView('/localDebug');
      if (node.resourceType !== ResourceType.Function) {
        return;
      }
      const funcRes = node as FunctionResource;
      await process(
        funcRes.serviceName, funcRes.functionName,
        funcRes.templatePath as string, eventFilePath,
        reuse,
        debugPort,
      )
        .catch(ex => vscode.window.showErrorMessage(ex.message));
    })
  );
  vscode.debug.onDidStartDebugSession(debugSession => {
    debugPortSet.add(debugSession.configuration.port);
  });
  vscode.debug.onDidTerminateDebugSession(debugSession => {
    debugPortSet.delete(debugSession.configuration.port);
  });
}

async function process(
  serviceName: string, functionName: string,
  templatePath: string, eventFilePath: string | undefined,
  reuse: boolean, debugPort?: string,
) {
  if (!ext.cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const templateService = new TemplateService(templatePath);
  const functionInfo = await templateService.getFunction(serviceName, functionName);
  if (!functionInfo.Properties) {
    vscode.window.showInformationMessage(`Please complete ${serviceName}/${functionName} properties`);
    return;
  }
  const runtime = functionInfo.Properties.Runtime;
  if (!rt.isSupportedRuntime(runtime)) {
    vscode.window.showInformationMessage(`${runtime} debug will be support soon.`);
    return;
  }
  if (!rt.isNodejs(runtime)) {
    const autoCheck = rt.isPython(runtime) ? autoCheckPythonDebugger : rt.isPhp(runtime) && autoCheckPhpDebugger;
    if (autoCheck) {
      try {
        const installExtensions = await cpUtils.executeCommand(undefined, undefined, 'code', '--list-extensions');
        const searchExtension = rt.isPython(runtime) ? EXTENSION_PYTHON_DEBUG : EXTENSION_PHP_DEBUG;
        if (!installExtensions.includes(searchExtension)) {
          vscode.window.showInformationMessage(
            `Extension ${searchExtension} should be installed to enable local debug ${runtime} runtime`,
            'OK',
          );
          vscode.commands.executeCommand(
            'workbench.extensions.action.showExtensionsWithIds', [searchExtension]
          );
          return;
        } else {
          if (rt.isPython(runtime)) {
            autoCheckPythonDebugger = false;
          }
          if (rt.isPhp(runtime)) {
            autoCheckPhpDebugger = false;
          }
        }
      } catch (ex) {
        vscode.window.showErrorMessage(ex.message);
        return;
      }
    }
  }
  // 尝试从 launch.json 读取配置
  const configurationName = getConfigurationName(serviceName, functionName);
  const launchFilePath = path.join(ext.cwd, '.vscode', 'launch.json');
  const launchInfo = vscode.workspace.getConfiguration('launch', vscode.Uri.file(launchFilePath));
  const configurations = launchInfo.get('configurations');
  let filterConfigurations = (<vscode.DebugConfiguration[]>configurations)
    .filter(configuration => configuration.name === configurationName);
  let configuration: vscode.DebugConfiguration;
  if (!filterConfigurations || !filterConfigurations.length) {
    // 生成 debug configuration
    configuration = generateDebugConfiguration(serviceName, functionName, functionInfo, templatePath);
    // 不将 debug configuration 添加进配置文件，保证了每次都可以支持多 Session 调试
    // 如果用户想配置可以自行在 launch.json 中配置
    // 但是需要注意 launch.json 中配置的 port 不能重复，不然无法支持多 Session 调试
  } else {
    configuration = filterConfigurations[0];
  }
  let hasHttpTrigger = false;
  if (functionInfo.Events) {
    Object.entries(functionInfo.Events).forEach(([name, resource]) => {
      if (resource && (<any>resource).Type === 'HTTP') {
        hasHttpTrigger = true;
      }
    })
  }
  if (!hasHttpTrigger) {
    // 普通的函数，读取 event 文件
    eventFilePath = eventFilePath || await getOrInitEventConfig(
      templatePath,
      serviceName,
      functionName,
      functionInfo.Properties.CodeUri
    );
    if (!isPathExists(eventFilePath)) {
      // 生成默认 event 文件
      if (!createEventFile(eventFilePath)) {
        throw new Error(`Create ${eventFilePath} event file failed`);
      }
    }
  }
  // 启动 fun local
  const funService = new FunService(templatePath);
  configuration.port = debugPort || configuration.port;
  if (rt.isPhp(runtime)) {
    if (debugPort && debugPortSet.has(debugPort)
    ) {
      return;
    }
    vscode.debug.startDebugging(undefined, configuration);
  }
  let terminal: vscode.Terminal;
  if (hasHttpTrigger) {
    terminal = funService.localStartDebug(serviceName, functionName, configuration.port);
  } else {
    terminal = funService.localInvokeDebug(
      serviceName, functionName, configuration.port, eventFilePath as string, reuse
    );
  }
  if (debugPort && debugPortSet.has(debugPort)) {
    return;
  }
  if (rt.isNodejs(runtime) || rt.isPython(runtime)) {
    try {
      const { Properties: properties } = functionInfo;
      await waitUntilImagePullCompleted(properties.Runtime);
      await waitUntilContainerStarted(properties.Runtime, configuration.port);
      vscode.debug.startDebugging(undefined, configuration).then(() => {
        terminal.show();
      });
    } catch (ex) {
      vscode.window.showErrorMessage(ex.message);
    }
  }
}

async function untilDebuggerListening(terminal: vscode.Terminal) {
  const disposables: vscode.Disposable[] = [];
  try {
    return await new Promise((resolve, reject) => {
      let str = '';
      disposables.push(
        (<any>terminal).onDidWriteData((data: any) => {
          str += new String(data);
          // TODO:
          // 目前基于日志判断镜像是否存在或 container 是否启动的方法非常不牢靠
          // 未来需要改为 lib 方式
          if (str.indexOf('Debugger listening on') > -1
            || str.indexOf('Downloaded newer image') > -1
            || str.indexOf('skip pulling image') > -1) {
            resolve();
          }
        }),
        vscode.window.onDidCloseTerminal((t: vscode.Terminal) => {
          if (t === terminal) {
            reject();
          }
        })
      );
    });
  } finally {
    disposables.forEach(d => d.dispose());
  }
}

async function waitUntilImagePullCompleted(runtime: string) {
  const imageName: string = await resolveRuntimeToDockerImage(runtime);
  return new Promise((resolve, reject) => {
    const checkImageExist = () => {
      imageExist(imageName).then((exist) => {
        if (exist) {
          resolve();
        } else {
          setTimeout(() => {
            checkImageExist();
          }, 3000);
        }
      }).catch((ex) => {
        reject(ex);
      });
    }
    checkImageExist();
  });
}

async function waitUntilContainerStarted(runtime: string, port: number) {
  const imageName: string = await resolveRuntimeToDockerImage(runtime);
  return new Promise((resolve, reject) => {
    const checkContainerStarted = () => {
      containerStarted(imageName, port)
        .then((started) => {
          if (started) {
            resolve();
          } else {
            setTimeout(() => {
              checkContainerStarted();
            }, 3000);
          }
        })
        .catch(reject);
    }
    checkContainerStarted();
  });
}

async function containerStarted(imageName: string, port: number): Promise<boolean> {
  const containers = await docker.listContainers({
    filters: {
      ancestor: [imageName],
      expose: [port.toString()],
    }
  });
  return containers.length > 0;
}

async function imageExist(imageName: string): Promise<boolean> {
  const images = await docker.listImages({
    filters: {
      reference: [imageName]
    }
  });
  return images.length > 0;
}

function getConfigurationName(serviceName: string, functionName: string) {
  return `fc/${serviceName}/${functionName}`;
}

function getDebugPort(): number {
  let port = 3000 + Math.floor(Math.random() * 100);
  while (debugPortSet.has(port)) {
    port = 3000 + Math.floor(Math.random() * 100);
  }
  return port;
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
  if (runtime === 'nodejs8' || runtime === 'nodejs10') {
    return 'inspector';
  }
  return ''; // TODO: support other runtime;
}

function generateDebugConfiguration(serviceName: string,
  functionName: string, resource: TplResourceElementElement, templatePath: string): vscode.DebugConfiguration {
  const { Properties: properties } = resource;
  let localRootPath = path.join(path.dirname(templatePath), properties.CodeUri);
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

function generateDebugConfigurationItem(serviceName: string,
  functionName: string, runtime: string, localRoot: string): vscode.DebugConfiguration {
  if (runtime.indexOf('nodejs') > -1) {
    return <vscode.DebugConfiguration> {
      name: getConfigurationName(serviceName, functionName),
      type: getDebugTypeFromLanguage(runtime),
      request: 'attach',
      address: 'localhost',
      port: getDebugPort(),
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
      port: getDebugPort(),
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
      port: getDebugPort(),
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
      vscode.window.showErrorMessage('Create .vscode folder failed');
      return;
    }
  }
  const launchFilePath = path.join(cwd, '.vscode', 'launch.json');
  if (!isPathExists(launchFilePath)) {
    // 生成默认 launch.json 文件
    if (!createLaunchFile(launchFilePath)) {
      vscode.window.showErrorMessage('Create launch.json failed');
      return;
    }
  }
  const launchInfo = vscode.workspace.getConfiguration('launch', vscode.Uri.file(launchFilePath));
  const debugConfigurations = <vscode.DebugConfiguration[]>launchInfo.get('configurations');
  launchInfo.update('configurations', [...debugConfigurations, debugConfiguration]);
}
