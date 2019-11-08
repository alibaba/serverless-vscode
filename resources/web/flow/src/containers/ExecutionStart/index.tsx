import React from 'react';
import { ExecutionStartProps } from '../../props.d';
import { getInstance } from '../../services/service';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import CloseIcon from '@material-ui/icons/Close';
import MonacoEditor from 'react-monaco-editor';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import { IconButton } from '@material-ui/core';

const DEFAULT_INPUT = `{
  "key": "hello world"
}
`;

let input = DEFAULT_INPUT;

export class ExecutionStart extends React.Component<ExecutionStartProps> {
  state = {
    visible: true,
    executionName: '',
    executionInput: input,
    errorMessage: '',
    errorVisible: false,
  }

  service = getInstance();

  async handleSubmit() {
    const { executionName, executionInput } = this.state;
    input = executionInput;
    const data = await this.service.request({
      command: 'startExecution',
      input: executionInput,
      executionName,
    })
    const { code, message, Name: name } = data;
    if (code || message) {
      this.handleErrorMessageOpen(`${code || 'Error'}: ${message}`);
    } else {
      this.setState({
        visible: false,
      });
      this.props.onSuccess(name);
    }
  }

  handleClose() {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  }

  handleErrorMessageOpen(message: string) {
    this.setState({
      errorVisible: true,
      errorMessage: message,
    });
  }

  handleErrorMessageClose() {
    this.setState({
      errorVisible: false,
      errorMessage: '',
    });
  }

  render() {
    return (
      <div>
        <Dialog fullWidth open={this.state.visible} onClose={() => this.handleClose()} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">新执行</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              autoFocus
              margin="dense"
              id="name"
              label="执行名称 (可选)"
              type="text"
              onChange={(event) => { this.setState({ executionName: event.target.value }); }}
            />
            <div style={{ height: '300px', width: '100%', marginTop: '18px' }}>
              <MonacoEditor
                theme="vs"
                language="javascript"
                options={{
                  value: this.state.executionInput,
                }}
                onChange={(value) => { this.setState({ executionInput: value }); }}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleSubmit()} color="primary">
              启动执行
            </Button>
            <Button onClick={() => this.handleClose()} color="primary">
              取消
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.errorVisible}
          onClose={() => { this.handleErrorMessageClose(); }}
        >
          <SnackbarContent
            style={{
              backgroundColor: '#c33f38'
            }}
            message={
              <div style={{ fontSize: '20' }}>
                {this.state.errorMessage}
              </div>
            }
            action={[
              <IconButton
                key="close"
                color="inherit"
                onClick={() => { this.handleErrorMessageClose(); }}
              >
                <CloseIcon style={{ fontSize: '20' }} />
              </IconButton>
            ]}
          />
        </Snackbar>
      </div>
    );
  }

}
