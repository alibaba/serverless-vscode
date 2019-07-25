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
