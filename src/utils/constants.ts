export namespace serverlessCommands {
  export const BIND_ACCOUNT = {
    id: 'fc.extension.bind.account',
    title: 'Bind New Account',
  };
  export const CREATE_FUNCTION = {
    id: 'fc.extension.function.create',
    title: 'Create Function',
  };
  export const SERVICE_DEPLOY = {
    id: 'fc.extension.service.deploy',
    title: 'Deploy Service',
  };
  export const GOTO_FUNCTION_CODE = {
    id: 'fc.extension.localResource.gotoFunction',
    title: 'Goto Function Code',
  };
  export const GOTO_FUNCTION_TEMPLATE = {
    id: 'fc.extension.localResource.function.gotoTemplate',
    title: 'Goto Function Template',
  };
  export const GOTO_SERVICE_TEMPLATE = {
    id: 'fc.extension.localResource.service.gotoTemplate',
    title: 'Goto Service Template'
  };
  export const INIT_PROJECT = {
    id: 'fc.extension.project.init',
    title: 'Init Project',
  };
  export const LOCAL_DEBUG = {
    id: 'fc.extension.localResource.local.invoke.debug',
    title: 'Local Debug',
  };
  export const LOCAL_RUN = {
    id: 'fc.extension.localResource.local.invoke',
    title: 'Local Run',
  };
  export const REMOTE_INVOKE = {
    id: 'fc.extension.remoteResource.remote.invoke',
    title: 'Remote Invoke',
  };
  export const SHOW_REGION_STATUS = {
    id: 'fc.extension.show.region.status',
    title: 'Show Region Status',
  };
  export const SHOW_REMOTE_FUNCTION_INFO = {
    id: 'fc.extension.show.remote.functionInfo',
    title: 'Show Remote Function Info',
  };
  export const CLEAR_REMOTE_FUNCTION_INFO = {
    id: 'fc.extension.clear.remote.functionInfo',
    title: 'Clear Remote Function Info',
  };
  export const SHOW_REMOTE_SERVICE_INFO = {
    id: 'fc.extension.show.remote.serviceInfo',
    title: 'Show Remote Service Info',
  };
  export const CLEAR_REMOTE_SERVICE_INFO = {
    id: 'fc.extension.clear.remote.serviceInfo',
    title: 'Clear Remote Service Info',
  };
  export const SWITCH_ACCOUNT = {
    id: 'fc.extension.switch.account',
    title: 'Switch Account',
  };
  export const SWITCH_OR_BIND_ACCOUNT = {
    id: 'fc.extension.switchOrBind.account',
    title: 'Switch Or Bind Account',
  };
  export const SWITCH_REGION = {
    id: 'fc.extension.switch.region',
    title: 'Switch Region',
  };
  export const SWITCH_REGION_OR_ACCOUNT = {
    id: 'fc.extension.switch.regionOrAccount',
    title: 'Switch Region Or Account',
  };
  export const REFRESH_REMOTE_RESOURCE = {
    id: 'fc.extension.remoteResource.refresh',
    title: 'Refresh Remote Resource',
  };
  export const REFRESH_LOCAL_RESOURCE = {
    id: 'fc.extension.localResource.refresh',
    title: 'Refresh Local Resource',
  };
  export const IMPORT_SERVICE = {
    id: 'fc.extension.service.import',
    title: 'Import Service',
  };
  export const IMPORT_FUNCTION = {
    id: 'fc.extension.function.import',
    title: 'Import Function',
  };
}
export const FUN_INSTALL_URL = 'https://github.com/aliyun/fun';
export const FC_REGIONS = [
  'cn-hangzhou',
  'cn-shanghai',
  'cn-qingdao',
  'cn-beijing',
  'cn-zhangjiakou',
  'cn-huhehaote',
  'cn-shenzhen',
  'cn-hongkong',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-southeast-5',
  'ap-northeast-1',
  'eu-central-1',
  'us-west-1',
  'us-east-1',
  'ap-south-1',
]
export const ALIYUN_SERVERLESS_SERVICE_TYPE = 'Aliyun::Serverless::Service';
export const ALIYUN_SERVERLESS_FUNCTION_TYPE = 'Aliyun::Serverless::Function';
export const ALIYUN_SERVERLESS_CUSTOMDOMAIN_TYPE = 'Aliyun::Serverless::CustomDomain';
export const ALIYUN_SERVERLESS_API_TYPE = 'Aliyun::Serverless::Api';
export const ALIYUN_SERVERLESS_TABLESTORE_TYPE = 'Aliyun::Serverless::TableStore';
export const ALIYUN_SERVERLESS_TABLESTORE_TABLE_TYPE = 'Aliyun::Serverless::TableStore::Table';
export const ALIYUN_SERVERLESS_LOG_TYPE = 'Aliyun::Serverless::Log';
export const ALIYUN_SERVERLESS_LOG_LOGSTORE_TYPE = 'Aliyun::Serverless::Log::Logstore';
export const ALIYUN_SERVERLESS_MNSTOPIC_TYPE = 'Aliyun::Serverless::MNSTopic';
