import { getConfig } from '../utils/config';

export class BaseService {
  getAccountId(): string | undefined {
    const config = getConfig();
    if (!config || !config.endpoint) {
      return;
    }
    let { endpoint } = config;
    endpoint = (<string>endpoint).replace('https://', '');
    return (<string>endpoint).substring(0, (<string>endpoint).indexOf('.'));
  }

  getRegion(): string | undefined {
    const config = getConfig();
    if (!config || !config.endpoint) {
      return;
    }
    let { endpoint } = config;
    endpoint = (<string>endpoint).substring((<string>endpoint).indexOf('.') + 1);
    return (<string>endpoint).substring(0, (<string>endpoint).indexOf('.'));
  }

  getAccessKeyId(): string | undefined {
    const config = getConfig();
    if (!config || !config.access_key_id) {
      return;
    }
    let { access_key_id } = config;
    return access_key_id;
  }

  getAccessKeySecret(): string | undefined {
    const config = getConfig();
    if (!config || !config.access_key_secret) {
      return;
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
}
