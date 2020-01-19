import * as fc from '@alicloud/fc2';
import { error } from '../utils/output';
import { BaseService } from './BaseService';

const FCClient = require('@alicloud/fc2');


const output = primaryAccountPromptDecorator(
  enableServicePromptDecorator(
    permissionPromptDecorator(error)
  )
);

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
      output(ex.message);
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
        output(ex.message);
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
        output(ex.message);
        break;
      }
    } while (result.data && result.data.nextToken);
    return functions;
  }

  async listAllRemoteTriggerInFunction(serviceName: string, functionName: string): Promise<any[]> {
    let result, nextToken = null;
    const limit = 50;
    const triggers: any[] = [];
    const client = this.newFCClient();
    if (!client) {
      return [];
    }
    do {
      try {
        result = await client.listTriggers(serviceName, functionName, { nextToken, limit });
        ({ data: { nextToken = null } = {} } = result);
        if (result.data && result.data.triggers) {
          triggers.push(...result.data.triggers);
        }
      } catch (ex) {
        output(ex.message);
        break;
      }
    } while (result.data && result.data.nextToken);
    return triggers;
  }

  async listFunctions(serviceName: string, nextToken: string): Promise<any> {
    const client = this.newFCClient();
    if (!client) {
      return;
    }
    let result: any;
    try {
      if (nextToken) {
        result = await client.listFunctions(
          serviceName,
          { nextToken },
        );
      } else {
        result = await client.listFunctions(serviceName);
      }
    } catch (ex) {
      output(ex.message);
      return {
        functions: [],
        nextToken: '',
      };
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
      output(ex.message);
    }
    return result;
  }

  async listTriggers(serviceName: string, functionName: string, nextToken: string): Promise<any> {
    const client = this.newFCClient();
    if (!client) {
      return [];
    }
    let result: any;
    try {
      if (nextToken) {
        result = await client.listTriggers(
          serviceName,
          functionName,
          { nextToken },
        );
      } else {
        result = await client.listTriggers(serviceName, functionName);
      }
    } catch (ex) {
      output(ex.message);
      return {
        triggers: [],
        nextToken: '',
      };
    }
    const { data: { triggers = [], nextToken: newNextToken = '' } = {} } = result;
    return {
      triggers,
      nextToken: newNextToken,
    }
  }

  async getService(serviceName: string) {
    const client = this.newFCClient();
    try {
      const { data } = await client.getService(serviceName);
      return data;
    } catch (ex) {
      output(ex.message);
    }
  }

  async getFunction(serviceName: string, functionName: string) {
    const client = this.newFCClient();
    try {
      const { data } = await client.getFunction(serviceName, functionName);
      return data;
    } catch (ex) {
      output(ex.message);
    }
  }

  async getTrigger(serviceName: string, functionName: string, triggerName: string) {
    const client = this.newFCClient();
    try {
      const { data } = await client.getTrigger(serviceName, functionName, triggerName);
      return data;
    } catch (ex) {
      output(ex.message);
      return {};
    }
  }
}


function permissionPromptDecorator(output: (msg: string) => void) {
  return function(msg: string) {
    output(msg);
    const reg = new RegExp("the caller is not authorized to perform '(.*)' on resource");
    const res = reg.exec(msg);
    if (!res) {
      return;
    }
    error(`
=====
{
  "Statement": [
      {
          "Effect": "Allow",
          "Action": [
              "${res[1]}"
          ],
          "Resource": "*"
      }
  ],
  "Version": "1"
}
You can create the above permission policies and grant current user.
https://ram.console.aliyun.com/policies/new
=====`);
  }
}

function enableServicePromptDecorator(output: (msg: string) => void) {
  return function(msg: string) {
    output(msg);
    const reg = new RegExp('FC service is not enabled for current user');
    const res = reg.exec(msg);
    if (!res) {
      return;
    } else {
      error(`
=====
To view Resource Panel you should enable Function Compute service.
http://fc.console.aliyun.com/
=====`);
    }
  }
}

function primaryAccountPromptDecorator(output: (msg: string) => void) {
  return function(msg: string) {
    output(msg);
    const reg = new RegExp('The service or function doesn\'t belong to you');
    const res = reg.exec(msg);
    if (!res) {
      return;
    } else {
      error(`
=====
The accountId you entered is incorrect.
You can only use the primary account id, whether or not you use a sub-account or a primary account ak.
You can get primary account ID on this page https://account.console.aliyun.com/#/secure .
=====`);
    }
  }
}
