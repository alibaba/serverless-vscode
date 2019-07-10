import * as vscode from 'vscode';
import * as fc from '@alicloud/fc2';
import { getConfig } from '../utils/config';

const FCClient = require('@alicloud/fc2');

export class FunctionComputeService {

  getAccountId(): string | undefined {
    const config = getConfig();
    if (!config || !config.endpoint) {
      return;
    }
    let { endpoint } = config;
    endpoint = (<string>endpoint).replace('https://', '');
    return (<string>endpoint).substring(0, (<string>endpoint).indexOf('.'));
  }

  getRegion(): string | undefined {
    const config = getConfig();
    if (!config || !config.endpoint) {
      return;
    }
    let { endpoint } = config;
    endpoint = (<string>endpoint).substring((<string>endpoint).indexOf('.') + 1);
    return (<string>endpoint).substring(0, (<string>endpoint).indexOf('.'));
  }

  getAccessKeyId(): string | undefined {
    const config = getConfig();
    if (!config || !config.access_key_id) {
      return;
    }
    let { access_key_id } = config;
    return access_key_id;
  }

  getAccessKeySecret(): string | undefined {
    const config = getConfig();
    if (!config || !config.access_key_secret) {
      return;
    }
    let { access_key_secret } = config;
    return access_key_secret;
  }

  getTimeout(): number | undefined {
    const config = getConfig();
    if (!config || !config.timeout) {
      return;
    }
    let { timeout } = config;
    if (!timeout || !Number(timeout)) {
      return 60000; // default is 60s
    }
    return Number(timeout) * 1000;
  }

  getNewFCClient() {
    try {
      return new FCClient(this.getAccountId(), {
        accessKeyID: this.getAccessKeyId(),
        accessKeySecret: this.getAccessKeySecret(),
        region: this.getRegion(),
        timeout: this.getTimeout(),
      });
    } catch (ex) {
      vscode.window.showErrorMessage(ex.message);
    }
  }

  async listAllRemoteServices(): Promise<fc.Service[]> {
    let result, nextToken = null;
    const limit = 50;
    const services = [];
    const client = this.getNewFCClient();
    if (!client) {
      return [];
    }
    do {
      try {
        result = await client.listServices({ nextToken, limit });
        ({ data: { nextToken = null } = {} } = result);
        if (result.data && result.data.services) {
          services.push(...result.data.services);
        }
      } catch (ex) {
        vscode.window.showErrorMessage(ex.message);
        break;
      }
    } while (result.data && result.data.nextToken);
    return services;
  }

  async listAllRemoteFunctionInService(serviceName: string): Promise<fc.Function[]> {
    let result, nextToken = null;
    const limit = 50;
    const functions = [];
    const client = this.getNewFCClient();
    if (!client) {
      return [];
    }
    do {
      try {
        result = await client.listFunctions(serviceName, { nextToken, limit });
        ({ data: { nextToken = null } = {} } = result);
        if (result.data && result.data.functions) {
          functions.push(...result.data.functions);
        }
      } catch (ex) {
        vscode.window.showErrorMessage(ex.message);
        break;
      }
    } while (result.data && result.data.nextToken);
    return functions;
  }

  async invokeFunction(serviceName: string, functionName: string, event: string) {
    let result: any = {};
    const client = this.getNewFCClient();
    if (!client) {
      return [];
    }
    try {
      result = await client.invokeFunction(serviceName, functionName, event, {
        'x-fc-log-type': 'Tail',
      });
    } catch (ex) {
      vscode.window.showErrorMessage(ex.message);
    }
    return result;
  }
}
