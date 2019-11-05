import React from 'react';
import { getInstance } from '../../services/service';
import MonacoEditor from 'react-monaco-editor';
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution';

export class FlowInfo extends React.Component {

  state = {
    flowName: '',
    description: '',
    roleArn: '',
    createdTime: '',
    definition: '',
  }

  componentDidMount() {
    const service = getInstance();
    service.request({ command: 'describeFlow' }).then((data) => {
      const {
        Name: flowName,
        Description: description,
        RoleArn: roleArn,
        CreatedTime: createdTime,
        Definition: definition,
      } = data;
      this.setState({
        flowName,
        description,
        roleArn,
        createdTime,
        definition,
      });
    });
  }

  render() {
    return (
      <div className="root">
        <div className="app">
          <div className="info-title">流程</div>
          <div className="container">
            <div className="bar left-bar">
              <ul className="item-ul">
                <li className="item-li">
                  <span className="key">流程名称：</span>
                  <span className="value">{this.state.flowName}</span>
                </li>
                <li className="item-li">
                  <span className="key">流程角色：</span>
                  <span className="value">{this.state.roleArn}</span>
                </li>
              </ul>
            </div>
            <div className="bar right-bar">
              <ul className="item-ul">
                <li className="item-li">
                  <span className="key">流程备注：</span>
                  <span className="value">{this.state.description}</span>
                </li>
                <li className="item-li">
                  <span className="key">创建时间：</span>
                  <span className="value">{new Date(this.state.createdTime).toLocaleString()}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="container" style={{ height: '70vh' }}>
            {
              this.state.definition ?
                <MonacoEditor
                  theme="vs-dark"
                  language="yaml"
                  options={{
                    readOnly: true,
                    value: this.state.definition,
                  }}
                />
                :
                null
            }
          </div>
        </div>
      </div>
    )
  }
}
