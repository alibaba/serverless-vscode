
import {
  ALIYUN_SERVERLESS_SERVICE_TYPE,
  ALIYUN_SERVERLESS_FUNCTION_TYPE,
  ALIYUN_SERVERLESS_CUSTOMDOMAIN_TYPE,
  ALIYUN_SERVERLESS_API_TYPE,
  ALIYUN_SERVERLESS_TABLESTORE_TYPE,
  ALIYUN_SERVERLESS_TABLESTORE_TABLE_TYPE,
  ALIYUN_SERVERLESS_LOG_TYPE,
  ALIYUN_SERVERLESS_LOG_LOGSTORE_TYPE,
  ALIYUN_SERVERLESS_MNSTOPIC_TYPE,
  ALIYUN_SERVERLESS_TRIGGERS_HTTP_TYPE,
  ALIYUN_SERVERLESS_TRIGGES_TIMERR_TYPE,
  ALIYUN_SERVERLESS_TRIGGERS_LOG_TYPE,
  ALIYUN_SERVERLESS_TRIGGERS_OSS_TYPE,
  ALIYUN_SERVERLESS_TRIGGERS_RDS_TYPE,
  ALIYUN_SERVERLESS_TRIGGERS_MNSTOPIC_TYPE,
  ALIYUN_SERVERLESS_TRIGGERS_TABLESTORE_TYPE,
  ALIYUN_SERVERLESS_TRIGGERS_CDN_TYPE,
} from '../utils/constants';

import {
  SERVICE_INSERT_TEXT,
  FUNCTION_INSERT_TEXT,
  CUSTOMDOMAIN_INSERT_TEXT,
  API_INSERT_TEXT, TABLESTORE_INSERT_TEXT,
  TABLE_INSERT_TEXT,
  LOG_INSERT_TEXT,
  LOGSTORE_INSERT_TEXT,
  MNSTOPIC_INSERT_TEXT,
  SERVICE_DOCUMENTATION_URL,
  FUNCTION_DOCUMENTATION_URL,
  CUSTOMDOMAIN_DOCUMENTATION_URL,
  API_DOCUMENTATION_URL,
  TABLE_DOCUMENTATION_URL,
  TABLESTORE_DOCUMENTATION_URL,
  LOG_DOCUMENTATION_URL,
  MNSTOPIC_DOCUMENTATION_URL,
  VPCCONFIG_INSERT_TEXT,
  LOGCONFIG_INSERT_TEXT,
  NASCONFIG_INSERT_TEXT,
  RESOURCES_INSERT_TEXT,
  EVENTS_INSERT_TEXT,
  TIMER_TRIGGER_INSERT_TEXT,
  HTTP_TRIGGER_INSERT_TEXT,
  LOG_TRIGGER_INSERT_TEXT,
  OSS_TRIGGER_INSERT_TEXT,
  RDS_TRIGGER_INSERT_TEXT,
  MNSTOPIC_TRIGGER_INSERT_TEXT,
  TABLESTORE_TRIGGER_INSERT_TEXT,
  CDN_TRIGGER_INSERT_TEXT,
  MEMORYSIZE_INSERT_TEXT,
} from './constants';

// TODO: schema 的进一步定义

const timerTriggerSchema = {
  properties: {
    Properties: {
      properties: {
        'CronExpression': {},
        'Payload': {},
        'Enable': {},
        'Qualifier': {},
      },
    },
  },
  insertText: TIMER_TRIGGER_INSERT_TEXT,
};

const httpTriggerSchema = {
  properties: {
    Properties: {
      properties: {
        'AuthType': {},
        'Methods': {},
        'InvocationRole': {},
        'Qualifier': {},
      },
    },
  },
  insertText: HTTP_TRIGGER_INSERT_TEXT,
};

const logTriggerSchema = {
  properties: {
    Properties: {
      properties: {
        'SourceConfig': {},
        'JobConfig': {},
        'LogConfig': {},
        'Enable': {},
        'InvocationRole': {},
        'Qualifier': {},
      },
    },
  },
  insertText: LOG_TRIGGER_INSERT_TEXT,
};

const ossTriggerSchema = {
  properties: {
    Properties: {
      properties: {
        'Events': {},
        'BucketName': {},
        'Filter': {},
        'Key': {},
        'InvocationRole': {},
        'Qualifier': {},
      },
    },
  },
  insertText: OSS_TRIGGER_INSERT_TEXT,
};

const rdsTriggerSchema = {
  properties: {
    Properties: {
      properties: {
        'InstanceId': {},
        'SubscriptionObjects': {},
        'Retry': {},
        'Concurrency': {},
        'EventFormat': {},
        'InvocationRole': {},
        'Qualifier': {},
      },
    },
  },
  insertText: RDS_TRIGGER_INSERT_TEXT,
};

const mnsTopicTriggerSchema = {
  properties: {
    Properties: {
      properties: {
        'TopicName': {},
        'Region': {},
        'NotifyContentFormat': {},
        'NotifyStrategy': {},
        'FilterTag': {},
        'InvocationRole': {},
        'Qualifier': {},
      },
    },
  },
  insertText: MNSTOPIC_TRIGGER_INSERT_TEXT,
};

const tableStoreTopicTriggerSchema = {
  properties: {
    Properties: {
      properties: {
        'InstanceName': {},
        'TableName': {},
        'InvocationRole': {},
        'Qualifier': {},
      },
    },
  },
  insertText: TABLESTORE_TRIGGER_INSERT_TEXT,
};

const cdnTopicTriggerSchema = {
  properties: {
    Properties: {
      properties: {
        'EventName': {},
        'EventVersion': {},
        'Notes': {},
        'Filter': {},
        'InvocationRole': {},
        'Qualifier': {},
      },
    },
  },
  insertText: CDN_TRIGGER_INSERT_TEXT,
};

const eventsSchema = {
  label: 'Events',
  properties: {
    [ALIYUN_SERVERLESS_TRIGGES_TIMERR_TYPE]: timerTriggerSchema,
    [ALIYUN_SERVERLESS_TRIGGERS_HTTP_TYPE]: httpTriggerSchema,
    [ALIYUN_SERVERLESS_TRIGGERS_LOG_TYPE]: logTriggerSchema,
    [ALIYUN_SERVERLESS_TRIGGERS_OSS_TYPE]: ossTriggerSchema,
    [ALIYUN_SERVERLESS_TRIGGERS_RDS_TYPE]: rdsTriggerSchema,
    [ALIYUN_SERVERLESS_TRIGGERS_MNSTOPIC_TYPE]: mnsTopicTriggerSchema,
    [ALIYUN_SERVERLESS_TRIGGERS_TABLESTORE_TYPE]: tableStoreTopicTriggerSchema,
    [ALIYUN_SERVERLESS_TRIGGERS_CDN_TYPE]: cdnTopicTriggerSchema,
  },
  insertText: EVENTS_INSERT_TEXT,
  triggerSuggest: true,
};

const functionSchema = {
  label: 'Function',
  properties: {
    Events: eventsSchema,
    Properties: {
      properties: {
        'Handler': {},
        'Runtime': {},
        'CodeUri': {},
        'Initializer': {},
        'Description': {},
        'MemorySize': {
          insertText: MEMORYSIZE_INSERT_TEXT,
        },
        'Timeout': {},
        'InitializationTimeout': {},
        'EnvironmentVariables': {},
      }
    },
  },
  insertText: FUNCTION_INSERT_TEXT,
  documentation: FUNCTION_DOCUMENTATION_URL,
};

const vpcConfigSchema = {
  properties: {
    'VpcId': {},
    'VSwitchIds': {},
    'SecurityGroupId': {},
  },
  insertText: VPCCONFIG_INSERT_TEXT,
};

const logConfigSchema = {
  properties: {
    'Project': {},
    'Logstore': {},
  },
  insertText: LOGCONFIG_INSERT_TEXT,
};

const nasConfigSchema = {
  properties: {
    'UserId': {},
    'GroupId': {},
    'MountPoints': {
      properties: {
        'ServerAddr': {},
        'MountDir': {},
      },
    },
  },
  insertText: NASCONFIG_INSERT_TEXT,
};

const serviceSchema = {
  label: 'Service',
  properties: {
    Properties: {
      properties: {
        'Role': {},
        'Policies': {},
        'InternetAccess': {},
        'VpcConfig': vpcConfigSchema,
        'LogConfig': logConfigSchema,
        'NasConfig': nasConfigSchema,
        'Description': {},
      },
    },
    [ALIYUN_SERVERLESS_FUNCTION_TYPE]: functionSchema,
  },
  insertText: SERVICE_INSERT_TEXT,
  documentation: SERVICE_DOCUMENTATION_URL,
};

const customDomainSchema = {
  label: 'CustomDomain',
  properties: {
    Properties: {
      properties: {
        'Protocal': {},
        'RouteConfig': {
          properties: {
            'routes': {},
          },
        },
        'CertConfig': {
          properties: {
            'CertName': {},
            'PrivateKey': {},
            'Certificate': {},
          },
        },
      },
    },
  },
  insertText: CUSTOMDOMAIN_INSERT_TEXT,
  documentation: CUSTOMDOMAIN_DOCUMENTATION_URL,
};

const apiSchema = {
  label: 'API',
  properties: {
    Properties: {
      properties: {
        'Name': {},
        'StageName': {},
        'DefinitionUri': {},
        'DefinitionBody': {},
      },
    },
  },
  insertText: API_INSERT_TEXT,
  documentation: API_DOCUMENTATION_URL,
};

const tableSchema = {
  label: 'Table',
  properties: {
    Properties: {
      properties: {
        'PrimaryKeyList': {
          properties: {
            'Name': {},
            'Type': {},
          },
        },
      },
    },
  },
  insertText: TABLE_INSERT_TEXT,
  documentation: TABLE_DOCUMENTATION_URL,
};

const tablestoreSchema = {
  label: 'TableStore',
  properties: {
    Properties: {
      properties: {
        'ClusterType': {},
        'Description': {},
      },
    },
    [ALIYUN_SERVERLESS_TABLESTORE_TABLE_TYPE]: tableSchema,
  },
  insertText: TABLESTORE_INSERT_TEXT,
  documentation: TABLESTORE_DOCUMENTATION_URL,
};

const logStoreSchema = {
  label: 'LogStore',
  properties: {
    Properties: {
      properties: {
        'TTL': {},
        'shardCount': {},
      },
    },
  },
  insertText: LOGSTORE_INSERT_TEXT,
  documentation: LOG_DOCUMENTATION_URL,
};

const logSchema = {
  label: 'Log',
  properties: {
    Properties: {
      properties: {
        'Description': {},
      },
    },
    [ALIYUN_SERVERLESS_LOG_LOGSTORE_TYPE]: logStoreSchema,
  },
  insertText: LOG_INSERT_TEXT,
  documentation: LOG_DOCUMENTATION_URL,
};

const mnstopicSchema = {
  label: 'MNSTopic',
  properties: {
    Properties: {
      properties: {
        'Region': {},
        'MaximumMessageSize': {},
        'LoggingEnabled': {},
      },
    },
  },
  insertText: MNSTOPIC_INSERT_TEXT,
  documentation: MNSTOPIC_DOCUMENTATION_URL,
};

const resourceSchema = {
  properties: {
    [ALIYUN_SERVERLESS_SERVICE_TYPE]: serviceSchema,
    [ALIYUN_SERVERLESS_CUSTOMDOMAIN_TYPE]: customDomainSchema,
    [ALIYUN_SERVERLESS_API_TYPE]: apiSchema,
    [ALIYUN_SERVERLESS_TABLESTORE_TYPE]: tablestoreSchema,
    [ALIYUN_SERVERLESS_LOG_TYPE]: logSchema,
    [ALIYUN_SERVERLESS_MNSTOPIC_TYPE]: mnstopicSchema,
  },
  insertText: RESOURCES_INSERT_TEXT,
  triggerSuggest: true,
};

export const schema = {
  properties: {
    Resources: resourceSchema,
  },
};
