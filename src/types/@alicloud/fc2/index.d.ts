declare module '@alicloud/fc2' {
  type Service = {
    serviceName: string,
    description: string,
    role: string,
  }

  type Function = {
    functionId: string,
    functionName: string,
    description: string,
    runtime: string,
    handler: string,
  }
}
