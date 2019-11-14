import React, { useState, useEffect, Fragment } from 'react';
import { getInstance } from '../../../services/service';
import { useParams } from 'react-router';
import MonacoEditor from 'react-monaco-editor';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import Button from '@material-ui/core/Button';
import './index.css';

const DEFAULT_EVENT = `{
  "key": "value"
}`

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

  return (
    <div className="root">
      <div className="app">
        <div className="info-title">
          函数
        </div>
        <div className="container">
          <div className="bar left-bar">
            <ul className="item-ul">
              <li className="item-li">
                <span className="key">函数名称：</span>
                <span className="value">{functionName}</span>
              </li>
              <li className="item-li">
                <span className="key">所属服务：</span>
                <span className="value">{serviceName}</span>
              </li>
              <li className="item-li">
                <span className="key">所属地域：</span>
                <span className="value">{functionInfo.regionId}</span>
              </li>
              <li className="item-li">
                <span className="key">描述信息：</span>
                <span className="value">{functionInfo.description}</span>
              </li>
            </ul>
          </div>
          <div className="bar right-bar">
            <ul className="item-ul">
              <li className="item-li">
                <span className="key">函数入口：</span>
                <span className="value">{functionInfo.handler}</span>
              </li>
              <li className="item-li">
                <span className="key">运行环境：</span>
                <span className="value">{functionInfo.runtime}</span>
              </li>
              <li className="item-li">
                <span className="key">超时时间：</span>
                <span className="value">{functionInfo.timeout}</span>
              </li>
              <li className="item-li">
                <span className="key">配置内存：</span>
                <span className="value">{functionInfo.memorySize}</span>
              </li>
            </ul>
          </div>
        </div>
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
      </div>
    </div>
  )
}
