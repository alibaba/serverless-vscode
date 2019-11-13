import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { getInstance } from '../../services/service';
import IconButton from '../../components/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Tab from '@material-ui/core/Tab';
import Tabs from '../../components/Tabs';
import TabPanel from '../../components/TabPanel';
import Grid from '@material-ui/core/Grid';
import ReactJson from 'react-json-view';
import { ExecutionHistory } from '../ExecutionHistory';
import { FlowDefinitionGraph } from '../FlowDefinitionGraph';

export const ExecutionInfo = () => {
  const { executionName } = useParams();
  const history = useHistory();
  const service = getInstance();

  const [executionInfo, setExecutionInfo] = useState({
    flowName: '',
    input: '',
    name: '',
    output: '',
    startedTime: '',
    stoppedTime: '',
    status: '',
    flowDefinition: '',
  });

  const [tabValue, setTabValue] = useState<number>(0);

  useEffect(() => describeExecution(), []);

  const describeExecution = () => {
    service.request({
      command: 'describeExecution',
      executionName,
    }).then(data => {
      const {
        FlowName: flowName,
        Input: input,
        Name: name,
        Output: output,
        StartedTime: startedTime,
        Status: status,
        StoppedTime: stoppedTime,
        FlowDefinition: flowDefinition,
      } = data
      setExecutionInfo({
        flowName,
        input,
        name,
        output,
        startedTime,
        status,
        stoppedTime,
        flowDefinition,
      });
    });
  }

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  }

  const redirectToFlowInfo = () => {
    history.push('/');
  }

  return (
    <div className="root">
      <div className="app">
        <div className="info-title">
          <IconButton onClick={redirectToFlowInfo}>
            <ArrowBackIcon />
          </IconButton> 执行
        </div>
        <div className="container">
          <div className="bar left-bar">
            <ul className="item-ul">
              <li className="item-li">
                <span className="key">执行名称：</span>
                <span className="value">{executionName}</span>
              </li>
              <li className="item-li">
                <span className="key">执行状态：</span>
                <span className="value">{executionInfo.status}</span>
              </li>
            </ul>
          </div>
          <div className="bar right-bar">
            <ul className="item-ul">
              <li className="item-li">
                <span className="key">创建时间：</span>
                <span className="value">{new Date(executionInfo.startedTime).toLocaleString()}</span>
              </li>
              <li className="item-li">
                <span className="key">结束时间：</span>
                <span className="value">
                  {
                    !executionInfo.stoppedTime || executionInfo.stoppedTime === '1970-01-01T00:00:00Z' ?
                      null
                      :
                      new Date(executionInfo.stoppedTime).toLocaleString()
                  }
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
          >
            <Tab label="执行事件历史记录" />
            <Tab label="输入/输出" />
            <Tab label="执行的流程定义" />
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            {
              executionInfo.flowName ?
                <ExecutionHistory />
                :
                null
            }
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <Grid container>
              <Grid container item xs={12} spacing={0}>
                <Grid item xs={6}>
                  <ReactJson
                    src={executionInfo.input ? JSON.parse(executionInfo.input) : {}}
                    theme="solarized"
                    displayDataTypes={false}
                    style={{
                      padding: '18px 0px',
                      backgroundColor: 'inherit',
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ReactJson
                    src={executionInfo.output ? JSON.parse(executionInfo.output) : {}}
                    theme="solarized"
                    displayDataTypes={false}
                    style={{
                      padding: '18px 0px',
                      backgroundColor: 'inherit',
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <FlowDefinitionGraph definition={executionInfo.flowDefinition} />
          </TabPanel>
        </div>
      </div>
    </div>
  )
}
