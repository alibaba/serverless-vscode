import { BaseService } from './BaseService';
import * as output from '../utils/output';
const FnFClient = require('@alicloud/fnf-2019-03-15');

export class FunctionFlowService extends BaseService {
  newFnFClient() {
    try {
      return new FnFClient({
        endpoint: `https://${this.getAccountId()}.${this.getRegion()}.fnf.aliyuncs.com`,
        accessKeyId: this.getAccessKeyId(),
        accessKeySecret: this.getAccessKeySecret(),
      });
    } catch (ex) {
      output.error(ex.message);
    }
  }

  async createFlow(flowName: string, description: string, definition: string) {
    const client = this.newFnFClient();
    await client.createFlow({
      Type: 'FDL',
      Name: flowName,
      Description: description,
      Definition: definition,
    });
  }

  async listAllRemoteFlows(): Promise<any[]> {
    let result, nextToken = undefined;
    const flows: any[] = [];
    const client = this.newFnFClient();
    if (!client) {
      return flows;
    }
    do {
      try {
        if (nextToken) {
          result = await client.listFlows({
            NextToken: nextToken,
          });
        } else {
          result = await client.listFlows();
        }
        ( { NextToken: nextToken } = result );
        if (result.Flows) {
          flows.push(...result.Flows);
        }
      } catch (ex) {
        output.error(ex.message);
        break;
      }
    } while (result.Flows && result.NextToken);
    return flows;
  }

  async listAllRemoteExecutions(flowName: string): Promise<any[]> {
    let result, nextToken = undefined;
    const executions: any[] = [];
    const client = this.newFnFClient();
    if (!client) {
      return executions;
    }
    do {
      try {
        if (nextToken) {
          result = await client.listExecutions({
            FlowName: flowName,
            NextToken: nextToken,
          });
        } else {
          result = await client.listExecutions({
            FlowName: flowName,
          });
        }
        ( { NextToken: nextToken } = result );
        if (result.Executions) {
          executions.push(...result.Executions);
        }
      } catch (ex) {
        output.error(ex.message);
        break;
      }
    } while (result.Executions && result.NextToken);
    return executions;
  }
}
