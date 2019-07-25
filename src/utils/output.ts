import { getFunctionComputeOutputChannel } from './channel';

export function log(message: any) {
  const channel = getFunctionComputeOutputChannel();
  channel.appendLine(message);
}

export function error(message: any) {
  const channel = getFunctionComputeOutputChannel();
  channel.appendLine(message);
  channel.show();
}

export async function output(func: () => Promise<any>) {
  const oldLog = console.log;
  const oldErr = console.error;
  console.log = log;
  console.error = error;
  try {
    return await func();
  } finally {
    console.log = oldLog;
    console.error = oldErr;
  }
}
