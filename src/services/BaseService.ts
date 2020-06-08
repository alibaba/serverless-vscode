import { getConfig, extractAccountId, extractRegion } from '../utils/config';

export class BaseService {
  getAccountId(): string | undefined {
    const config = getConfig();
    if (!config || !config.endpoint) {
      return;
    }
    const accountId = extractAccountId(config.endpoint);
    return accountId ? accountId : 'accountId';
  }

  getRegion(): string | undefined {
    const config = getConfig();
    if (!config || !config.endpoint) {
      return;
    }
    const region = extractRegion(config.endpoint);
    return region ? region : 'cn-hangzhou';
  }

  getAccessKeyId(): string | undefined {
    const config = getConfig();
    if (!config || !config.access_key_id) {
      return 'accessKeyID';
    }
    let { access_key_id } = config;
    return access_key_id;
  }

  getAccessKeySecret(): string | undefined {
    const config = getConfig();
    if (!config || !config.access_key_secret) {
      return 'accessKeySecret';
    }
    let { access_key_secret } = config;
    return access_key_secret;
  }

  getTimeout(): number | undefined {
    const config = getConfig();
    if (!config || !config.timeout) {
      return;
    }
    let { timeout } = config;
    if (!timeout || !Number(timeout)) {
      return 60000; // default is 60s
    }
    return Number(timeout) * 1000;
  }

  getEndPoint(): string | undefined {
    const config = getConfig();
    const { endpoint, enable_custom_endpoint } = config;
    const enable = (enable_custom_endpoint === true || enable_custom_endpoint === 'true');
    return enable ? endpoint : undefined;
  }
}
