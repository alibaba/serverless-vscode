import * as path from 'path';
import * as yaml from 'js-yaml';
import * as util from 'util';
import * as fs from 'fs';
import { ext } from '../extensionVariables';
import { isPathExists, createFile, isDirectory } from '../utils/file';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const VALID_EVENT_TYPES = ['file'];

export async function getOrInitEventConfig(
  templatePath: string,
  serviceName: string,
  functionName: string,
  codeUri: string,
): Promise<string> {
  const cwd = ext.cwd as string;
  const configFilePath = getConfigFilePath();
  if (!isPathExists(configFilePath)) {
    if (!createFile(configFilePath)) {
      throw new Error(`Fail to create ${configFilePath}`);
    }
  }
  let eventFilePath = getDefaultEvtFilePath(templatePath, codeUri);
  const templateRelativePath = path.relative(cwd, templatePath);

  const configFileContent = await readFile(configFilePath, 'utf8');
  let invokeConfig = yaml.safeLoad(configFileContent) || {};
  invokeConfig.templates = invokeConfig.templates || {};

  invokeConfig.templates[templateRelativePath] = invokeConfig.templates[templateRelativePath] || {};

  invokeConfig.templates[templateRelativePath][serviceName] =
    invokeConfig.templates[templateRelativePath][serviceName] || {};

  if (!invokeConfig.templates[templateRelativePath][serviceName][functionName]
    || !invokeConfig.templates[templateRelativePath][serviceName][functionName].event
    || typeof invokeConfig.templates[templateRelativePath][serviceName][functionName].event !== 'string'
    || !invokeConfig.templates[templateRelativePath][serviceName][functionName].events
  ) {
    const evtConfig = {
      default_evt: {
        type: 'file',
        value: eventFilePath,
      },
    }
    invokeConfig.templates[templateRelativePath][serviceName][functionName] = {
      event: 'default_evt',
      events: invokeConfig.templates[templateRelativePath][serviceName][functionName]
       && invokeConfig.templates[templateRelativePath][serviceName][functionName].events ?
        {
          ...invokeConfig.templates[templateRelativePath][serviceName][functionName].events,
          ...evtConfig,
        }
        :
        evtConfig,
    };
    await writeFile(configFilePath, yaml.dump(invokeConfig));
  }
  const eventName = invokeConfig.templates[templateRelativePath][serviceName][functionName].event;
  if (!invokeConfig.templates[templateRelativePath][serviceName][functionName].events[eventName]
    ||!invokeConfig.templates[templateRelativePath][serviceName][functionName].events[eventName].type
    ||!invokeConfig.templates[templateRelativePath][serviceName][functionName].events[eventName].value
    ||!VALID_EVENT_TYPES.includes(
      invokeConfig.templates[templateRelativePath][serviceName][functionName].events[eventName].type
    )
    ||typeof invokeConfig.templates[templateRelativePath][serviceName][functionName].events[eventName].value
      !== 'string'
  ) {
    invokeConfig.templates[templateRelativePath][serviceName][functionName].events[eventName] = {
      type: 'file',
      value: eventFilePath,
    }
    await writeFile(configFilePath, yaml.dump(invokeConfig));
  }
  eventFilePath =
    invokeConfig.templates[templateRelativePath][serviceName][functionName].events[eventName].value;
  eventFilePath = path.resolve(cwd, eventFilePath);
  return eventFilePath;
}

export function getConfigFilePath(): string {
  return path.resolve(ext.cwd as string, '.vscode', 'fc_local_invoke_config.yml');
}

export async function setEventFilePath(
  templatePath: string,
  serviceName: string,
  functionName: string,
  codeUri: string,
  eventFilePath: string,
): Promise<void> {
  await getOrInitEventConfig(templatePath, serviceName, functionName, codeUri);
  const configFilePath = getConfigFilePath();
  const configFileContent = await readFile(configFilePath, 'utf8');
  let invokeConfig = yaml.safeLoad(configFileContent);
  const cwd = ext.cwd as string;
  const templateRelativePath = path.relative(cwd, templatePath);
  const eventName = invokeConfig.templates[templateRelativePath][serviceName][functionName].event;
  invokeConfig.templates[templateRelativePath][serviceName][functionName].events[eventName] = {
    type: 'file',
    value: eventFilePath,
  }
  await writeFile(configFilePath, yaml.dump(invokeConfig));
}

function getDefaultEvtFilePath(templatePath: string, codeUri: string): string {
  let eventFileDir = path.resolve(path.dirname(templatePath), codeUri);
  if (!isDirectory(eventFileDir)) {
    eventFileDir = path.dirname(eventFileDir);
  }
  eventFileDir = path.relative(ext.cwd as string, eventFileDir);
  return path.join(eventFileDir, 'event.evt');
}
