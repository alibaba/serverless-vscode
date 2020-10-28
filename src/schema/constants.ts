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
  "      CodeUri: ${3:./}\n" +
  "      MemorySize: 1024\n" +
  "      Timeout: 15\n";

export const FUNCTION_INSERT_TEXT =
  "${1:function}: # function name\n" +
  "  Type: 'Aliyun::Serverless::Function'\n" +
  "  Properties:\n" +
  "    Handler: index.handler\n" +
  "    Runtime: nodejs8\n" +
  "    CodeUri: ${2:./}\n" +
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

export const FLOW_INSERT_TEXT = `\${1:flow}:
  Type: 'Aliyun::Serverless::Flow'
  Properties:
    Description: 'function flow'
    DefinitionUri: \${2:./index.flow.yml}
    Policies:
      - AliyunFCInvocationAccess`

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
export const EVENTS_INSERT_TEXT =
  "Events:\n" +
  "  "
export const SUPPORTED_MEMORYSIZES = [
  128, 192, 256, 320, 384, 448, 512, 576, 640, 704,
  768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280,
  1344, 1408, 1472, 1536, 1600, 1664, 1728, 1792,
  1856, 1920, 1984, 2048, 2112, 2176, 2240, 2304,
  2368, 2432, 2496, 2560, 2624, 2688, 2752, 2816,
  2880, 2944, 3008, 3072,
  4096, 8192, 16384, 32768,
];
export const MEMORYSIZE_INSERT_TEXT =
  "MemorySize: ${1|" +
  SUPPORTED_MEMORYSIZES.join(",") +
  "|}"
export const TIMER_TRIGGER_INSERT_TEXT =
  "${1:timeTrigger}:\n" +
  "  Type: Timer\n" +
  "  Properties:\n" +
  "    CronExpression: '${2:0 0 8 * * *}'\n" +
  "    Enable: true"

export const HTTP_TRIGGER_INSERT_TEXT =
  "${1:httpTrigger}:\n" +
  "  Type: HTTP\n" +
  "  Properties:\n" +
  "    AuthType: ${2|ANONYMOUS,FUNCTION|}\n" +
  "    Methods: ['GET', 'POST', 'PUT']"

export const LOG_TRIGGER_INSERT_TEXT =
  "${1:logTrigger}:\n" +
  "  Type: Log\n" +
  "  Properties:\n" +
  "    SourceConfig:\n" +
  "      Logstore: ${2:logstore1}\n" +
  "    JobConfig:\n" +
  "      MaxRetryTime: 1\n" +
  "      TriggerInterval: 30\n" +
  "    LogConfig:\n" +
  "      Project: ${3:testlog}\n" +
  "      Logstore: ${4:logstore2}\n" +
  "    Enable: true"

export const OSS_TRIGGER_INSERT_TEXT =
  "${1:ossTrigger}:\n" +
  "  Type: OSS\n" +
  "  Properties:\n" +
  "    BucketName: ${2:ossBucketName}\n" +
  "    Events:\n" +
  "      - oss:ObjectCreated:*\n" +
  "      - oss:ObjectRemoved:DeleteObject\n" +
  "    Filter:\n" +
  "      Key:\n" +
  "        Prefix: ${3:source/}\n" +
  "        Suffix: ${4:.png}"

export const RDS_TRIGGER_INSERT_TEXT =
  "${1:rdsTrigger}:\n" +
  "  Type: RDS\n" +
  "  Properties:\n" +
  "    InstanceId: ${2:instanceId}\n" +
  "    SubscriptionObjects:\n" +
  "      - db1.table1\n" +
  "    Retry: 3\n" +
  "    Concurrency: 1\n" +
  "    EventFormat: ${3|json,protobuf|}"

export const MNSTOPIC_TRIGGER_INSERT_TEXT =
  "${1:mnsTrigger}:\n" +
  "  Type: MNSTopic\n" +
  "  Properties:\n" +
  "    TopicName: ${2:test-topic}\n" +
  "    NotifyContentFormat: ${3|STREAM,JSON|}\n" +
  "    NotifyStrategy: ${4|BACKOFF_RETRY,EXPONENTIAL_DECAY_RETRY|}"

export const TABLESTORE_TRIGGER_INSERT_TEXT =
  "${1:tableStoreTrigger}:\n" +
  "  Type: TableStore\n" +
  "  Properties:\n" +
  "    InstanceName: ${2:test-inst}\n" +
  "    TableName: ${3:test-tbl}"

export const CDN_TRIGGER_INSERT_TEXT =
  "${1:cdnTrigger}:\n" +
  "  Type: CDN\n" +
  "  Properties:\n" +
  "    EventName: ${2:test-event}\n" +
  "    EventVersion: '1.0.0'\n" +
  "    Notes: cdn events trigger test\n" +
  "    Filter:\n" +
  "      Domain: ['fc.console.aliyun.com']"
