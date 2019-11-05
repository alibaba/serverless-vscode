import { getFakeResultSet } from '../mocks/mock';

let vscodeApi: VscodeApi;
let requests: { [s: string]: any } = {};
let instance: { request: (message: { [s: string]: any }) => Promise<any> };

if (typeof window !== 'undefined') {
  if (typeof acquireVsCodeApi !== 'undefined') {
    vscodeApi = acquireVsCodeApi();
  } else {
    let results = getFakeResultSet();
    vscodeApi = {
      postMessage: function(msg: any) {
        window.postMessage(
          { id: msg.id, data: results[msg.command] || {} },
          '*'
        );
      }
    }
  }
  window.addEventListener('message', event => {
    let message = event.data;
    let request = requests[message.id];
    if (request) {
      request.callback(message.data);
      delete requests[message.id];
    }
  });
}

export function getInstance() {
  if (!instance) {
    instance = {
      request: function (message): Promise<any> {
        if (vscodeApi) {
          message.id = randId();
          vscodeApi.postMessage(message);
          return new Promise((resolve) => {
            requests[message.id] = {
              message,
              callback: (data: any) => {
                resolve(data);
              }
            }
          });
        } else {
          return Promise.reject();
        }
      },
    };
  }
  return instance;
}

function randId(): string {
  return (Math.random()+1).toString(36).substr(2, 8);
}
