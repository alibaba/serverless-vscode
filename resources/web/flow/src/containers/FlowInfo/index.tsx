import React from 'react';
import { FlowInfoProps } from '../../props.d';
import { getInstance } from '../../services/service';
import Tab from '@material-ui/core/Tab';
import Tabs from '../../components/Tabs';
import TabPanel from '../../components/TabPanel';
import { ExecutionList } from '../ExecutionList';
import { FlowDefinitionGraph } from '../FlowDefinitionGraph';

export class FlowInfo extends React.Component<FlowInfoProps> {

  state = {
    flowName: '',
    description: '',
    roleArn: '',
    createdTime: '',
    definition: '',
    tabValue: 0,
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
    const { tabValue } = this.state;
    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
      this.setState({
        tabValue: newValue,
      });
    };
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
          <div>
            <Tabs
              value={tabValue}
              onChange={handleChange}
            >
              <Tab label="执行" />
              <Tab label="定义" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
              {
                this.state.flowName ?
                  <ExecutionList flowName={this.state.flowName} history={this.props.history} />
                  :
                  null
              }
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <FlowDefinitionGraph definition={this.state.definition} />
            </TabPanel>
          </div>
        </div>
      </div>
    )
  }
}
