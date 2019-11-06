interface VscodeApi { postMessage: (data: any) => void; }
declare function acquireVsCodeApi(): VscodeApi;
