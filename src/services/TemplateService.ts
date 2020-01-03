import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as util from 'util';
import { isJava } from '../utils/runtime';
import { isDirectory } from '../utils/file';
import { ALIYUN_SERVERLESS_FUNCTION_TYPE, ALIYUN_SERVERLESS_FLOW_TYPE } from '../utils/constants';
import { getSuffix } from '../utils/runtime';

const readFile = util.promisify(fs.readFile);

const JAVA_HELLO_WORLD_DEFAULT_HANDLER = 'example.App::handleRequest';

function getDefaultHandler(runtime: string) {
  if (isJava(runtime)) {
    return JAVA_HELLO_WORLD_DEFAULT_HANDLER;
  }
  return 'index.handler';
}

export class TemplateService {
  private templatePath: string;
  constructor(templatePath: string) {
    this.templatePath = templatePath;
  }
  getTemplatePath(): string {
    return this.templatePath;
  }
  getHandlerFilePathFromFunctionInfo(rootPath: string, functionInfo: any): string {
    if (!this.validateFunctionResource(functionInfo)) {
      return '';
    }
    const {
      Properties: {
        CodeUri: functionCodeUri,
        Runtime: runtime,
        Handler: handler,
      }
    } = functionInfo;
    let functionHandlerFilePath = path.join(rootPath, functionCodeUri);
    if (isDirectory(functionHandlerFilePath)) {
      functionHandlerFilePath = path.join(functionHandlerFilePath,
        this.getHandlerFileName(handler, runtime));
    }
    return functionHandlerFilePath;
  }
  getHandlerFunctionNameFromFunctionInfo(functionInfo: any): string {
    if (!this.validateFunctionResource(functionInfo)) {
      return '';
    }
    const {
      Properties: {
        Handler: handler,
      }
    } = functionInfo;
    return this.getHandlerFunctionName(handler);
  }
  validateFunctionResource(functionInfo: any): boolean {
    if (!functionInfo
    || functionInfo.Type !== ALIYUN_SERVERLESS_FUNCTION_TYPE
    || !functionInfo.Properties
    || !functionInfo.Properties.CodeUri
    || !functionInfo.Properties.Runtime
    || !functionInfo.Properties.Handler) {
      return false;
    }
    return true;
  }
  getHandlerFileName(handler: string, runtime: string): string {
    if (isJava(runtime)) {
      const packageAndClass = handler.split('::')[0];
      return `src/main/java/${packageAndClass.split('.').join('/')}.java`;
    }
    const prefix = handler.substring(0, handler.indexOf('.'));
    return `${prefix}${getSuffix(runtime)}`;
  }
  getHandlerFunctionName(handler: string): string {
    return handler.substring(handler.indexOf('.') + 1);
  }
  async getTemplateContent(): Promise<string> {
    if (!this.templateExists()) {
      return '';
    }
    const content = await readFile(this.getTemplatePath(), 'utf8');
    return content;
  }
  async getTemplateDefinition(): Promise<any> {
    if (!this.templateExists()) {
      return null;
    }
    const content = await readFile(this.getTemplatePath(), 'utf8');
    const tpl = yaml.safeLoad(content);
    return tpl;
  }
  getTemplateDefinitionSync(): any {
    if (!this.templateExists()) {
      return null;
    }
    const content = fs.readFileSync(this.getTemplatePath(), 'utf8');
    const tpl = yaml.safeLoad(content);
    return tpl;
  }
  async getService(serviceName: string): Promise<any> {
    if (!this.templateExists()) {
      return null;
    }
    const content = await readFile(this.getTemplatePath(), 'utf8');
    const tpl = <Tpl>yaml.safeLoad(content);
    if (!tpl.Resources) {
      return null;
    }
    const services = Object.entries(tpl.Resources)
      .filter(([name, resource]) => name === serviceName && resource.Type === 'Aliyun::Serverless::Service' );
    if (services.length > 0) {
      return services[0][1];
    }
    return null;
  }
  async getFlow(flowName: string): Promise<any> {
    if (!this.templateExists()) {
      return null;
    }
    const content = await readFile(this.getTemplatePath(), 'utf8');
    const tpl = <Tpl>yaml.safeLoad(content);
    if (!tpl.Resources) {
      return null;
    }
    const flows = Object.entries(tpl.Resources)
      .filter(([name, resource]) => name === flowName && resource.Type === ALIYUN_SERVERLESS_FLOW_TYPE );
    if (flows.length > 0) {
      return flows[0][1];
    }
    return null;
  }
  async getFunction(serviceName: string, functionName: string): Promise<any> {
    if (!this.templateExists()) {
      return null;
    }
    const service = await this.getService(serviceName);
    if (!service) {
      return null;
    }
    const functions = Object.entries(service)
      .filter(([name, resource]) =>
        name === functionName && (<TplResourceElementElement>resource).Type === 'Aliyun::Serverless::Function');
    if (functions.length > 0) {
      return functions[0][1];
    }
    return null;
  }
  async addFunction({ type, runtime, functionName, serviceName, codeUri }: State): Promise<boolean> {
    let tpl: any = await this.getTemplateContent();
    if (!tpl) {
      if (!this.initTemplate()) {
        vscode.window.showErrorMessage('Init template fail');
        return false;
      }
    }
    tpl = await this.getTemplateDefinition();
    if (!tpl) {
      vscode.window.showErrorMessage('Template definition error');
      return false;
    }
    if (!tpl.Resources) {
      tpl.Resources = {};
    }
    if (!tpl.Resources[serviceName]) {
      tpl.Resources[serviceName] = {
        Type: 'Aliyun::Serverless::Service',
        Properties: {
          Description: `This is ${serviceName} service`,
        }
      };
    }
    if (tpl.Resources[serviceName][functionName]) {
      vscode.window.showErrorMessage(`${serviceName}/${functionName} already in template file`);
      return false;
    }
    tpl.Resources[serviceName][functionName] = {
      Type: 'Aliyun::Serverless::Function',
      Properties: {
        Handler: getDefaultHandler(runtime),
        Runtime: runtime,
        Timeout: 60,
        MemorySize: 512,
        CodeUri: codeUri,
      }
    }
    if (type === 'HTTP') {
      tpl.Resources[serviceName][functionName] = {
        ...tpl.Resources[serviceName][functionName],
        Events: {
          httpTrigger: {
            Type: 'HTTP',
            Properties: {
              AuthType: 'ANONYMOUS',
              Methods: ['GET', 'POST'],
            }
          }
        }
      }
    }
    const tplContent = yaml.dump(tpl);
    return this.writeTemplate(tplContent);
  }
  templateExists(): boolean {
    try {
      fs.accessSync(this.getTemplatePath());
    } catch (err) {
      return false;
    }
    return true;
  }
  initTemplate(): boolean {
    try {
      fs.writeFileSync(this.getTemplatePath(), `ROSTemplateFormatVersion: '2015-09-01'
Transform: 'Aliyun::Serverless-2018-04-03'
Resources:
`
      );
    } catch (err) {
      return false;
    }
    return true;
  }
  writeTemplate(content: string): boolean {
    try {
      fs.writeFileSync(this.getTemplatePath(), content);
    } catch (err) {
      return false;
    }
    return true;
  }
}


interface State {
  type: string;
  runtime: string;
  functionName: string;
  serviceName: string;
  codeUri: string;
}
