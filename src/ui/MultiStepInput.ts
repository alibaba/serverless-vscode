import * as vscode from 'vscode';

class InputFlowAction {
  private constructor() { }
  static back = new InputFlowAction();
  static cancel = new InputFlowAction();
}

type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

interface QuickPickParameters<T extends vscode.QuickPickItem> {
  title: string;
	step: number;
	totalSteps: number;
	items: T[];
	activeItem?: T;
	placeholder: string;
}

interface InputBoxParameters {
  title: string;
	step: number;
	totalSteps: number;
  value: string,
  prompt: string;
  validate: (value: string) => Promise<string | undefined>;
}

export class MultiStepInput {
  static async run(start: InputStep) {
    const input = new MultiStepInput();
    return input.stepThrough(start);
  }

  private current?: vscode.QuickInput;
  private steps: InputStep[] = [];

  private async stepThrough(start: InputStep) {
    let step: InputStep | void = start;
    while (step) {
      this.steps.push(step);
      if (this.current) {
        this.current.enabled = false;
        this.current.busy = true;
      }
      try {
        step = await step(this);
      } catch(err) {
        if (err === InputFlowAction.back) {
          this.steps.pop();
          step = this.steps.pop();
        } else if (err === InputFlowAction.cancel) {
          step = undefined;
        } else {
          throw err;
        }
      }
    }
    if (this.current) {
      this.current.dispose();
    }
  }

  async showQuickPick<T extends vscode.QuickPickItem, P extends QuickPickParameters<T>>({ title, step, totalSteps, items, activeItem, placeholder }: P) {
    const disposables: vscode.Disposable[] = [];
    try {
      return await new Promise((resolve, reject) => {
        const input = vscode.window.createQuickPick();
        input.ignoreFocusOut = true;
        input.title = title;
        input.step = step;
        input.totalSteps = totalSteps;
        input.items = items;
        input.buttons = [
					...(this.steps.length > 1 ? [vscode.QuickInputButtons.Back] : []),
				];
        if (activeItem) {
          input.activeItems = [activeItem];
        }
        disposables.push(
          input.onDidTriggerButton(item => {
						if (item === vscode.QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							reject();
						}
					}),
          input.onDidChangeSelection(items => {
            resolve(items[0]);
          }),
          input.onDidHide(() => {
            (async () => {
              reject(InputFlowAction.cancel);
            })()
              .catch(reject);
          })
        );
        if (this.current) {
          this.current.dispose();
        }
        this.current = input;
        this.current.show();
      })
    } finally {
      disposables.forEach(d => d.dispose());
    }
  }

  async showInputBox<P extends InputBoxParameters>({ title, step, totalSteps, value, validate, prompt }: P) {
    const disposables: vscode.Disposable[] = [];
    try {
      return await new Promise((resolve, reject) => {
        const input = vscode.window.createInputBox();
        input.ignoreFocusOut = true;
        input.title = title;
        input.step = step;
        input.totalSteps = totalSteps;
        input.value = value || "";
        input.prompt = prompt;
        input.buttons = [
					...(this.steps.length > 1 ? [vscode.QuickInputButtons.Back] : []),
				];
        disposables.push(
          input.onDidTriggerButton(item => {
						if (item === vscode.QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							reject();
						}
					}),
          input.onDidAccept(async () => {
            const value = input.value;
            input.enabled = false;
            input.busy = true;
            const validationMessage = await validate(input.value);
            if (validationMessage) {
              input.validationMessage = validationMessage;
            } else {
              resolve(input.value);
            }
            input.enabled = true;
            input.busy = false;
          }),
          input.onDidHide(() => {
            reject(InputFlowAction.cancel);
          })
        );
        if (this.current) {
          this.current.dispose();
        }
        this.current = input;
        this.current.show();
      });
    } finally {
      disposables.forEach(d => d.dispose());
    }
  }
}
