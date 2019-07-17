import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';

const configFilePath = path.join(os.homedir(), '.fcli', 'config.yaml');

export function getConfig() {
  if (!fs.existsSync(configFilePath)) {
    vscode.window.showErrorMessage('Please run fun config first');
    return null;
  }
  const configContent = fs.readFileSync(configFilePath, 'utf8');
  const config = yaml.safeLoad(configContent, { schema: yaml.JSON_SCHEMA });
  return config;
}

export function getRegionId() {
  const config = getConfig();
  let regionId = 'cn-shanghai';
  if (config) {
    let { endpoint } = config;
    endpoint = (<string>endpoint).substring((<string>endpoint).indexOf('.') + 1);
    regionId = (<string>endpoint).substring(0, (<string>endpoint).indexOf('.'));
  }
  return regionId;
}

export function convertAccountInfoToConfig(state: any) {
  const regionId = getRegionId();
  return {
    endpoint: `https://${state.accountId}.${regionId}.fc.aliyuncs.com`,
    api_version: '2016-08-15',
    access_key_id: state.accessKeyId,
    access_key_secret: state.accessKeySecret,
    security_token: '',
    debug: false,
    timeout: 60,
    sls_endpoint: `${regionId}.log.aliyuncs.com`,
    retries: 3,
    report: true,
    account_alias: state.accountAlias,
  };
}
