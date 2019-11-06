export interface ResourceDescriptor {

}

export interface ServiceDescriptor extends ResourceDescriptor {
  serviceName: string;
}

export interface FunctionDescriptor extends ResourceDescriptor {
  serviceName: string;
  functionName: string;
}

export interface TriggerDescriptor extends ResourceDescriptor {
  serviceName: string;
  functionName: string;
  triggerName: string;
  triggerType: string;
}

export interface InvokeDescriptor extends ResourceDescriptor {
  templatePath: string;
  serviceName: string;
  functionName: string;
  codeUri: string;
}

export interface FlowDescriptor extends ResourceDescriptor {
  flowName: string;
}
