/* eslint-disable quotes */
export const SERVICE_DOCUMENTATION_URL =
  'https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md#aliyunserverlessservice';
export const FUNCTION_DOCUMENTATION_URL =
  'https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md#aliyunserverlessfunction';
export const CUSTOMDOMAIN_DOCUMENTATION_URL =
  'https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md#aliyunserverlesscustomdomain';
export const API_DOCUMENTATION_URL =
  'https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md#aliyunserverlessapi';
export const TABLESTORE_DOCUMENTATION_URL =
  'https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md#aliyunserverlesstablestore';
export const TABLE_DOCUMENTATION_URL =
  'https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md#aliyunserverlesstablestoretable';
export const LOG_DOCUMENTATION_URL =
  'https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md#aliyunserverlesslog';
export const LOGSTORE_DOCUMENTATION_URL =
  'https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md#aliyunserverlessloglogstore';
export const MNSTOPIC_DOCUMENTATION_URL =
  'https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md#aliyunserverlessmnstopic';
export const SERVICE_INSERT_TEXT =
  "${1:service}: # service name\n" +
  "  Type: 'Aliyun::Serverless::Service'\n" +
  "  Properties:\n" +
  "    Description: This is FC service\n" +
  "  ${2:function}: # function name\n" +
  "    Type: 'Aliyun::Serverless::Function'\n" +
  "    Properties:\n" +
  "      Handler: index.handler\n" +
  "      Runtime: nodejs8\n" +
  "      CodeUri: '${3:./}' # code uri\n" +
  "      MemorySize: 1024\n" +
  "      Timeout: 15\n";

export const FUNCTION_INSERT_TEXT =
  "${1:function}: # function name\n" +
  "  Type: 'Aliyun::Serverless::Function'\n" +
  "  Properties:\n" +
  "    Handler: index.handler\n" +
  "    Runtime: nodejs8\n" +
  "    CodeUri: '${2:./}' # code uri\n" +
  "    MemorySize: 1024\n" +
  "    Timeout: 15";

export const CUSTOMDOMAIN_INSERT_TEXT =
  "${1:domain}: # domain name\n" +
  "  Type: 'Aliyun::Serverless::CustomDomain'\n" +
  "  Properties:\n" +
  "    Protocol: HTTP\n" +
  "    RouteConfig:\n" +
  "      routes:\n" +
  "        '/':\n" +
  "          ServiceName: ${2:service} # service name\n" +
  "          FunctionName: ${3:function} # function name"

export const API_INSERT_TEXT =
  "${1:api}: # api name\n" +
  "  Type: 'Aliyun::Serverless::Api'\n" +
  "  Properties:\n" +
  "    StageName: ${2:prod}\n" +
  "    DefinitionUri: ${3:swagger.yml}"

export const TABLESTORE_INSERT_TEXT =
  "${1:tablestore}: # tablestore name\n" +
  "  Type: 'Aliyun::Serverless::TableStore'\n" +
  "  Properties:\n" +
  "    ClusterType: HYBRID\n" +
  "  ${2:table}: # table name\n" +
  "    Type: 'Aliyun::Serverless::TableStore::Table'\n" +
  "    Properties:\n" +
  "      PrimaryKeyList:\n" +
  "        - Name: uid\n" +
  "          Type: STRING"

export const TABLE_INSERT_TEXT =
  "${1:table}: # table name\n" +
  "  Type: 'Aliyun::Serverless::TableStore::Table'\n" +
  "  Properties:\n" +
  "    PrimaryKeyList:\n" +
  "      - Name: uid\n" +
  "        Type: STRING"

export const LOG_INSERT_TEXT =
  "${1:project}: # log project name\n" +
  "  Type: 'Aliyun::Serverless::Log'\n" +
  "  ${2:store}: # log store name\n" +
  "    Type: 'Aliyun::Serverless::Log::Logstore'\n" +
  "    Properties:\n" +
  "      TTL: 10\n" +
  "      ShardCount: 1"

export const LOGSTORE_INSERT_TEXT =
  "${1:store}: # log store name\n" +
  "  Type: 'Aliyun::Serverless::Log::Logstore'\n" +
  "  Properties:\n" +
  "    TTL: 10\n" +
  "    ShardCount: 1"

export const MNSTOPIC_INSERT_TEXT =
"${1:topic}: # mns topic name\n" +
"  Type: 'Aliyun::Serverless::MNSTopic'\n" +
"  Properties:\n" +
"    Region: cn-shanghai\n" +
"    MaximumMessageSize: 2048\n" +
"    LoggingEnabled: false"

export const VPCCONFIG_INSERT_TEXT =
  "VpcConfig:\n" +
  "  VpcId: ${1:vpcId}\n" +
  "  VSwitchIds: [\"${2:switchId}\"]\n" +
  "  SecurityGroupId: ${3:securityGroupId}"

export const LOGCONFIG_INSERT_TEXT =
  "LogConfig:\n" +
  "  Project: ${1:project}\n" +
  "  Logstore: ${2:logStore}"

export const NASCONFIG_INSERT_TEXT =
  "NasConfig: Auto"

export const ROS_TEMPLATE_INSERT_TEXT =
  "ROSTemplateFormatVersion: '2015-09-01'\n"

export const TRANSFORM_INSERT_TEXT =
  "Transform: 'Aliyun::Serverless-2018-04-03'\n"

export const RESOURCES_INSERT_TEXT =
  "Resources:\n" +
  "  "
