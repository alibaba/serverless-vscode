import React, { useState, useEffect } from 'react';
import { getInstance } from '../../../services/service';
import { FunctionList } from '../FunctionList';
import Grid from '@material-ui/core/Grid';
import Tab from '@material-ui/core/Tab';
import Tabs from '../../../components/Tabs';
import TabPanel from '../../../components/TabPanel';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '../../../components/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { useParams } from 'react-router';

const titleStyle = {
  fontSize: '26px',
  fontWeight: 700,
}

const contentStyle = {
  fontSize: '13px',
}

const subTitleStyle = {
  fontSize: '15px',
  fontWeight: 700,
}

export const ServiceInfo = () => {
  const service = getInstance();
  const { serviceName } = useParams();

  const defaultServiceInfo = {
    serviceName: '',
    createdTime: '',
    regionId: '',
    lastModifiedTime: '',
    role: '',
    description: '',
    logConfig: {
      logstore: '',
      project: '',
    },
    internetAccess: false,
    vpcConfig: {
      securityGroupId: '',
      vpcId: '',
      vSwitchIds: [],
    },
    nasConfig: {
      groupId: -1,
      userId: -1,
      mountPoints: [],
    },
  }

  const [serviceInfo, setServiceInfo] = useState(defaultServiceInfo);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    getService();
  }, []);

  const getService = async () => {
    const data = await service.request({ command: 'fc/getService' });
    setServiceInfo({
      ...defaultServiceInfo,
      ...data,
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
                服务
              </Grid>
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={6}>
                服务名称：{serviceName}
              </Grid>
              <Grid item xs={6}>
                创建时间：{new Date(serviceInfo.createdTime).toLocaleString()}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={6}>
                所属区域：{serviceInfo.regionId}
              </Grid>
              <Grid item xs={6}>
                修改时间：{new Date(serviceInfo.lastModifiedTime).toLocaleString()}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={6}>
                描述信息：{serviceInfo.description}
              </Grid>
              <Grid item xs={6}>
                角色：{serviceInfo.role}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
            >
              <Tab label="服务配置" />
              <Tab label="函数列表" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3} style={{ marginTop: '12px' }}>
                <Grid container item style={contentStyle} spacing={1}>
                  <Grid container item style={subTitleStyle}>
                    <Grid item xs={12}>
                      日志配置
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={6}>
                      日志项目：{serviceInfo.logConfig.project}
                    </Grid>
                    <Grid item xs={6}>
                      日志仓库：{serviceInfo.logConfig.logstore}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container item style={contentStyle} spacing={1}>
                  <Grid container item style={subTitleStyle}>
                    <Grid item xs={12}>
                      网络配置
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={6}>
                      公网访问：{serviceInfo.internetAccess ? '允许' : '不允许'}
                    </Grid>
                    <Grid item xs={6}>
                      专有网络：{serviceInfo.vpcConfig.vpcId}
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={6}>
                      交换机：{serviceInfo.vpcConfig.vSwitchIds && serviceInfo.vpcConfig.vSwitchIds.length ?
                        serviceInfo.vpcConfig.vSwitchIds[0] : ''}
                    </Grid>
                    <Grid item xs={6}>
                      安全组：{serviceInfo.vpcConfig.securityGroupId}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container item style={contentStyle} spacing={1}>
                  <Grid container item style={subTitleStyle}>
                    <Grid item xs={12}>
                      NAS 配置
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={6}>
                      用户：{serviceInfo.nasConfig.userId}
                    </Grid>
                    <Grid item xs={6}>
                      用户组：{serviceInfo.nasConfig.groupId}
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>NAS 挂载源目录</TableCell>
                          <TableCell>目标目录</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {
                          serviceInfo.nasConfig.mountPoints.map((row: any) => (
                            <TableRow>
                              <TableCell>{row.serverAddr}</TableCell>
                              <TableCell>{row.mountDir}</TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <FunctionList />
            </TabPanel>
          </Grid>
        </Grid>
      </div>
    </div>
  )
}
