export interface ResourceDescriptor {

}

export interface ServiceDescriptor extends ResourceDescriptor {
  serviceName: string;
}

export interface FunctionDescriptor extends ResourceDescriptor {
  serviceName: string;
  functionName: string;
}
