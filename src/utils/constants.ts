export namespace serverlessCommands {
  export const BIND_ACCOUNT = {
    id: 'fc.extension.bind.account',
    title: 'Bind New Account',
  };
  export const CREATE_FUNCTION = {
    id: 'fc.extension.function.create',
    title: 'Create Function',
  };
  export const DEPLOY = {
    id: 'fc.extension.deploy',
    title: 'Deploy',
  };
  export const DEPLOY_SERVICE = {
    id: 'fc.extension.deploy.service',
    title: 'Deploy Service',
  };
  export const DEPLOY_FUNCTION = {
    id: 'fc.extension.deploy.function',
    title: 'Deploy Function',
  };
  export const GOTO_FUNCTION_CODE = {
    id: 'fc.extension.localResource.gotoFunction',
    title: 'Goto Function Code',
  };
  export const GOTO_TEMPLATE = {
    id: 'fc.extension.localResource.gotoTemplate',
    title: 'Goto Template',
  };
  export const GOTO_FUNCTION_DEFINITION = {
    id: 'fc.extension.localResource.function.gotoDefinition',
    title: 'Goto Function Definition',
  };
  export const GOTO_SERVICE_DEFINITION = {
    id: 'fc.extension.localResource.service.gotoDefinition',
    title: 'Goto Service Definition'
  };
  export const GOTO_TRIGGER_DEFINITION = {
    id: 'fc.extension.localResource.trigger.gotoDefinition',
    title: 'Goto Trigger Definition'
  };
  export const GOTO_NAS_DEFINITION = {
    id: 'fc.extension.localResource.nas.gotoDefinition',
    title: 'Goto NAS Definition'
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
  export const VIEW_QUICK_START = {
    id: 'fc.extension.view.quickstart',
    title: 'View Quick Start',
  };
  export const VIEW_DOCUMENTATION = {
    id: 'fc.extension.view.documentation',
    title: 'View Documentation',
  };
  export const VIEW_SOURCE_ON_GITHUB = {
    id: 'fc.extension.view.sourceOnGithub',
    title: 'View Source on Github',
  };
  export const REPORT_ISSUE = {
    id: 'fc.extension.report.issue',
    title: 'Report an Issue',
  }
  export const SHOW_UPDATE_NOTIFICATION = {
    id: 'fc.extension.show.update.notification',
    titile: 'Show Update Notification',
  };
  export const SYNC_NAS = {
    id: 'fc.extension.nas.sync',
    title: 'Sync NAS',
  };
  export const OPEN_NAS_LOCAL_DIR = {
    id: 'fc.extension.nas.open.local.dir',
    title: 'Open NAS local dir',
  };
  export const REFERENCE_RUNTIME_LIB = {
    id: 'fc.extension.reference.runtime.lib',
    title: 'Reference libs that are provided by the runtime',
  };
  export const TRIGGER_SUGGEST = {
    id: 'editor.action.triggerSuggest',
    title: 'Trigger Suggest',
  };
}

export namespace serverlessConfigs {
  export const ALIYUN_FC_REFERERENCE_LIB_TIP = 'aliyun.fc.referenceLib.tip';
}

export const SERVERLESS_EXTENTION_DOCUMENTATION_URL =
  'https://github.com/alibaba/serverless-vscode/blob/master/README.md';
export const SERVERLESS_EXTENTION_SOURCE_URL =
  'https://github.com/alibaba/serverless-vscode';
export const SERVERLESS_EXTENTION_REPORT_ISSUE_URL =
  'https://github.com/alibaba/serverless-vscode/issues/new/choose';
export const SERVERLESS_EXTENTION_QUICKSTART_URL =
  'https://github.com/alibaba/serverless-vscode#%E5%BF%AB%E9%80%9F%E5%85%A5%E9%97%A8';
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


export const ALIYUN_SERVERLESS_VERSION = 'v1.6.0';
export const ALIYUN_SERVERLESS_CHANGELOG_URL = 'https://github.com/alibaba/serverless-vscode/blob/master/CHANGELOG.md';

export const ALIYUN_SERVERLESS_CUSTOMDOMAIN_TYPE = 'Aliyun::Serverless::CustomDomain';
export const ALIYUN_SERVERLESS_API_TYPE = 'Aliyun::Serverless::Api';
export const ALIYUN_SERVERLESS_TABLESTORE_TYPE = 'Aliyun::Serverless::TableStore';
export const ALIYUN_SERVERLESS_TABLESTORE_TABLE_TYPE = 'Aliyun::Serverless::TableStore::Table';
export const ALIYUN_SERVERLESS_LOG_TYPE = 'Aliyun::Serverless::Log';
export const ALIYUN_SERVERLESS_LOG_LOGSTORE_TYPE = 'Aliyun::Serverless::Log::Logstore';
export const ALIYUN_SERVERLESS_MNSTOPIC_TYPE = 'Aliyun::Serverless::MNSTopic';


export const ALIYUN_SERVERLESS_EVENT_TYPES = [
  'Timer',
  'HTTP',
  'Log',
  'RDS',
  'MNSTopic',
  'TableStore',
  'OSS',
  'CDN',
];
