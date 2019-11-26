import React, { useState, useEffect, Fragment } from 'react';
import { getInstance } from '../../../services/service';
import { TriggerList } from '../TriggerList';
import { useParams } from 'react-router';
import MonacoEditor from 'react-monaco-editor';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tab from '@material-ui/core/Tab';
import Tabs from '../../../components/Tabs';
import TabPanel from '../../../components/TabPanel';
import './index.css';

const DEFAULT_EVENT = `{
  "key": "value"
}`

const titleStyle = {
  fontSize: '26px',
  fontWeight: 700,
}

const contentStyle = {
  fontSize: '13px',
}

export const FunctionInfo = () => {
  const { serviceName, functionName } = useParams();
  const service = getInstance();
  const [functionInfo, setFunctionInfo] = useState({
    serviceName: '',
    functionName: '',
    regionId: '',
    description: '',
    handler: '',
    runtime: '',
    timeout: '',
    memorySize: '',
  });
  const [workspaceOpened, setWorkspaceOpened] = useState<boolean>(false);
  const [eventFileList, setEventFileList] = useState<string[]>([]);
  const [selectedEventFile, setSelectedEventFile] = useState<string>('');
  const [eventContent, setEventContent] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    getWorkspaceState();
    getFunction();
    getEventFileList();
  }, []);

  useEffect(() => {
    getEventContent();
  }, [selectedEventFile]);

  const getWorkspaceState = async () => {
    const data = await service.request({ command: 'vs/getWorkspaceState' });
    const { opened = false } = data;
    setWorkspaceOpened(opened);
  }

  const getEventFileList = async () => {
    const data = await service.request({ command: 'fc/getEventFileList' });
    const { fileList = [], defaultFile = '' } = data;
    setEventFileList(fileList);
    setSelectedEventFile(defaultFile);
  }

  const getEventContent = async () => {
    if (!selectedEventFile) {
      return;
    }
    const data = await service.request({
      command: 'fc/getEventContent',
      eventFile: selectedEventFile,
    });
    const { content = '' } = data;
    setEventContent(content);
  }

  const handleSelectedFileChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedEventFile(event.target.value as string);
  }

  const getFunction = async () => {
    const data = await service.request({ command: 'fc/getFunction' });
    const {
      serviceName = '',
      functionName = '',
      regionId = '',
      description = '',
      handler = '',
      runtime = '',
      timeout = '',
      memorySize = '',
    } = data;
    setFunctionInfo({
      serviceName,
      functionName,
      regionId,
      description,
      handler,
      runtime,
      timeout,
      memorySize,
    });
  }

  const remoteInvoke = () => {
    service.request({ command: 'fc/remoteInvoke', eventFile: selectedEventFile });
  }

  const handleEventContentChange = (newContent: string) => {
    service.request({
      command: 'fc/updateEventContent',
      eventFile: selectedEventFile,
      content: newContent,
    });
  }

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  }

  return (
    <div className="root">
      <div className="app">
        <Grid container spacing={3}>
          <Grid container item style={contentStyle} spacing={1}>
            <Grid container item style={titleStyle}>
              <Grid item xs={12}>
                函数
              </Grid>
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={6}>
                函数名称：{functionName}
              </Grid>
              <Grid item xs={6}>
                函数入口：{functionInfo.handler}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={6}>
                所属服务：{serviceName}
              </Grid>
              <Grid item xs={6}>
                运行环境：{functionInfo.runtime}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={6}>
                所属地域：{functionInfo.regionId}
              </Grid>
              <Grid item xs={6}>
                超时时间：{functionInfo.timeout}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={6}>
                描述信息：{functionInfo.description}
              </Grid>
              <Grid item xs={6}>
                配置内存：{functionInfo.memorySize}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              style={{ marginBottom: '16px' }}
            >
              <Tab label="远端执行" />
              <Tab label="触发器列表" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
              <Button
                variant="contained"
                color="primary"
                style={{
                  float: 'left',
                  backgroundColor: '#007acc',
                  outline: '1px solid #007acc',
                  color: '#fff',
                  borderRadius: '0',
                }}
                size="small"
                onClick={remoteInvoke}
              >
                远端调用
              </Button>
              {
                workspaceOpened ?
                <Fragment>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row-reverse',
                      alignItems: 'center',
                    }}
                  >
                    <select id="eventSelect" value={selectedEventFile} onChange={handleSelectedFileChange}>
                      {
                        eventFileList.map(name => (
                          <option value={name}>{name} &nbsp;</option>
                        ))
                      }
                    </select>
                    <span id="eventLabel">事件：</span>
                  </div>
                  <div style={{ height: '40vh', width: '100%', marginTop: '18px' }}>
                    <MonacoEditor
                      theme="vs-dark"
                      language="javascript"
                      options={{
                        automaticLayout: true,
                      }}
                      value={workspaceOpened ? eventContent : DEFAULT_EVENT}
                      onChange={handleEventContentChange}
                    />
                  </div>
                </Fragment>
                :
                null
              }
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <TriggerList />
            </TabPanel>
          </Grid>
        </Grid>
      </div>
    </div>
  )
}
