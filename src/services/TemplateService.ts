import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as util from 'util';
import { isJava, isDotnetcore } from '../utils/runtime';
import { isDirectory } from '../utils/file';
import { ALIYUN_SERVERLESS_FUNCTION_TYPE, ALIYUN_SERVERLESS_FLOW_TYPE } from '../utils/constants';
import { getSuffix } from '../utils/runtime';

const readFile = util.promisify(fs.readFile);
const rmFile = util.promisify(fs.unlink);

const JAVA_DEFAULT_HANDLER = 'example.App::handleRequest';
const DOTNET_DEFAULT_HANDLER = 'project::example.App::HandleRequest';

function getDefaultHandler(runtime: string) {
  if (isJava(runtime)) {
    return JAVA_DEFAULT_HANDLER;
  }
  if (isDotnetcore(runtime)) {
    return DOTNET_DEFAULT_HANDLER;
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
        Runtime: runtime,
      }
    } = functionInfo;
    return this.getHandlerFunctionName(handler, runtime);
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
    if (isDotnetcore(runtime)) {
      const arr = handler.split('::');
      if (arr.length !== 3) {
        throw new Error(`Handler ${handler} is invalid`);
      }
      const namespaceAndClassName = arr[1].split('.');
      return `${namespaceAndClassName[namespaceAndClassName.length-1]}.cs`;
    }
    const prefix = handler.substring(0, handler.indexOf('.'));
    return `${prefix}${getSuffix(runtime)}`;
  }
  getHandlerFunctionName(handler: string, runtime: string): string {
    if (isJava(runtime) || isDotnetcore(runtime)) {
      const arr = handler.split('::');
      return arr[arr.length - 1];
    }
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
  async replaceFunction(serviceName: string, functionName: string, newFunctionRes: string) {
    if (!newFunctionRes) {
      vscode.window.showErrorMessage(`empty definition of function ${functionName}`);
      return false;
    }
    
    let tpl: any = await this.getTemplateDefinition();
    if (!tpl) {
      vscode.window.showErrorMessage(`${this.getTemplatePath()} not exist`);
      return false;
    }
    
    if (!tpl.Resources) {
      vscode.window.showErrorMessage(`Resources not exist in ${this.getTemplatePath()}`);
      return false;
    }
    if (!tpl.Resources[serviceName]) {
      vscode.window.showErrorMessage(`service ${serviceName} not exist in ${this.getTemplatePath()}`);
      return false;
    }
    tpl.Resources[serviceName][functionName] = newFunctionRes;
    const tplContent = yaml.dump(tpl);
    return this.writeTemplate(tplContent);
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
  async rmTemplate() {
    await rmFile(this.getTemplatePath());
  }
}


interface State {
  type: string;
  runtime: string;
  functionName: string;
  serviceName: string;
  codeUri: string;
}
