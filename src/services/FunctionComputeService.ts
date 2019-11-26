import * as fc from '@alicloud/fc2';
import * as output from '../utils/output';
import { BaseService } from './BaseService';

const FCClient = require('@alicloud/fc2');

export class FunctionComputeService extends BaseService {
  newFCClient() {
    try {
      return new FCClient(this.getAccountId(), {
        accessKeyID: this.getAccessKeyId(),
        accessKeySecret: this.getAccessKeySecret(),
        region: this.getRegion(),
        timeout: this.getTimeout(),
      });
    } catch (ex) {
      output.error(ex.message);
    }
  }

  async listAllRemoteServices(): Promise<fc.Service[]> {
    let result, nextToken = null;
    const limit = 50;
    const services = [];
    const client = this.newFCClient();
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
        output.error(ex.message);
        break;
      }
    } while (result.data && result.data.nextToken);
    return services;
  }

  async listAllRemoteFunctionInService(serviceName: string): Promise<fc.Function[]> {
    let result, nextToken = null;
    const limit = 50;
    const functions = [];
    const client = this.newFCClient();
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
        output.error(ex.message);
        break;
      }
    } while (result.data && result.data.nextToken);
    return functions;
  }

  async listFunctions(serviceName: string, nextToken: string): Promise<any> {
    const client = this.newFCClient();
    if (!client) {
      return;
    }
    let result: any;
    if (nextToken) {
      result = await client.listFunctions(
        serviceName,
        { nextToken },
      );
    } else {
      result = await client.listFunctions(serviceName);
    }
    const { data: { functions = [], nextToken: newNextToken = '' } = {} } = result;
    return {
      functions,
      nextToken: newNextToken,
    }
  }

  async invokeFunction(serviceName: string, functionName: string, event: string) {
    let result: any = {};
    const client = this.newFCClient();
    if (!client) {
      return [];
    }
    try {
      result = await client.invokeFunction(serviceName, functionName, event, {
        'x-fc-log-type': 'Tail',
      });
    } catch (ex) {
      output.error(ex.message);
    }
    return result;
  }

  async listTriggers(serviceName: string, functionName: string): Promise<any[]> {
    const client = this.newFCClient();
    if (!client) {
      return [];
    }
    try {
      const { data: { triggers = [] } = {} } = await client.listTriggers(serviceName, functionName);
      return triggers;
    } catch (ex) {
      output.error(ex.message);
    }
    return [];
  }

  async getService(serviceName: string) {
    const client = this.newFCClient();
    try {
      const { data } = await client.getService(serviceName);
      return data;
    } catch (ex) {
      output.error(ex.message);
    }
  }

  async getFunction(serviceName: string, functionName: string) {
    const client = this.newFCClient();
    try {
      const { data } = await client.getFunction(serviceName, functionName);
      return data;
    } catch (ex) {
      output.error(ex.message);
    }
  }

  async getTrigger(serviceName: string, functionName: string, triggerName: string) {
    const client = this.newFCClient();
    try {
      const { data } = await client.getTrigger(serviceName, functionName, triggerName);
      return data;
    } catch (ex) {
      output.error(ex.message);
      return {};
    }
  }
}
