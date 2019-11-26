import React, { useState, useEffect, Fragment } from 'react';
import { getInstance } from '../../../services/service';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '../../../components/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import IconButton from '../../../components/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Refresh from '@material-ui/icons/Refresh';
import Link from '@material-ui/core/Link';

function checkHasNext(data: any[], pageNumber: number, pageSize: number, nextToken: string): boolean {
  return data.length <= pageSize * pageNumber && !nextToken;
}

function sliceData(data: any[], pageNumber: number, pageSize: number): any[]{
  return data.slice(
    (pageNumber - 1) * pageSize, pageNumber * pageSize
  );
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_NUMBER = 1;

export const TriggerList = () => {
  const service = getInstance();

  const [dataSource, setDataSource] = useState<any[]>([]);
  const [triggers, setTriggers] = useState<any[]>([]);
  const [nextToken, setNextToken] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [pageNumber, setPageNumber] = useState<number>(DEFAULT_PAGE_NUMBER);
  const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);

  useEffect(() => { initTriggers(); }, []);

  const initTriggers = async () => {
    const data = await service.request({
      command: 'fc/listTriggers',
      nextToken,
    });
    const { triggers: newTriggers, nextToken: newNextToken } = data;
    if (newTriggers && newTriggers.length) {
      setTriggers(newTriggers);
      setDataSource(sliceData(newTriggers, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE));
      setNextToken(newNextToken || '');
      setPageSize(DEFAULT_PAGE_SIZE);
      setPageNumber(DEFAULT_PAGE_NUMBER);
      setNextBtnDisabled(checkHasNext(newTriggers, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, newNextToken));
    }
  }

  const handleBackBtnClick = () => {
    const newPageNumber = pageNumber - 1 < 0 ? 1 : pageNumber - 1;
    setDataSource(sliceData(triggers, newPageNumber, pageSize));
    setPageNumber(newPageNumber);
    setNextBtnDisabled(checkHasNext(triggers, newPageNumber, pageSize, nextToken));
  }

  const handleNextBtnClick = async () => {
    const newPageNumber = pageNumber + 1;
    if (triggers.length >= newPageNumber * pageSize
      || !nextToken
    ) {
      setDataSource(sliceData(triggers, newPageNumber, pageSize));
      setPageNumber(newPageNumber);
      setNextBtnDisabled(checkHasNext(triggers, newPageNumber, pageSize, nextToken));
    } else {
      const data = await service.request({
        command: 'fc/listTriggers',
        nextToken,
      });
      const { triggers: newTriggers, nextToken: newNextToken } = data;
      if (newTriggers && newTriggers.length) {
        const curTriggers = [...triggers, ...newTriggers];
        setTriggers(curTriggers);
        setDataSource(sliceData(curTriggers, newPageNumber, pageSize));
        setNextToken(newNextToken || '');
        setPageNumber(newPageNumber);
        setNextBtnDisabled(checkHasNext(curTriggers, newPageNumber, pageSize, newNextToken));
      }
    }
  }

  const handleTriggerNameClick = (triggerName: string, triggerType: string) => {
    service.request({
      command: 'fc/showRemoteTriggerInfo',
      triggerName,
      triggerType,
    });
  }

  return (
    <Fragment>
      <IconButton
        style={{ float: 'right' }}
        onClick={initTriggers}
      >
        <Refresh />
      </IconButton>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>触发器名称</TableCell>
            <TableCell>服务版本/别名</TableCell>
            <TableCell>状态</TableCell>
            <TableCell>事件类型</TableCell>
            <TableCell>创建时间</TableCell>
            <TableCell>修改时间</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataSource.map((row:any) => (
            <TableRow>
              <TableCell>
                <Link
                  underline="always"
                  style={{ cursor: "pointer" }}
                  onClick={() => { handleTriggerNameClick(row.triggerName, row.triggerType); }}
                >
                  {row.triggerName}
                </Link>
              </TableCell>
              <TableCell>{row.qualifier}</TableCell>
              <TableCell>
                {
                  row.triggerType !== 'timer' || (row.triggerConfig && row.triggerConfig.enable) ?
                    '已启用'
                    :
                    '未启用'
                }
              </TableCell>
              <TableCell>{row.triggerType}</TableCell>
              <TableCell>{new Date(row.createdTime).toLocaleString()}</TableCell>
              <TableCell>{new Date(row.lastModifiedTime).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell size="small" padding="none" style={{ border: '0' }}>
              <div>
                <IconButton
                  disabled={pageNumber === 1}
                  onClick={handleBackBtnClick}
                >
                  <KeyboardArrowLeft />
                </IconButton>
                {pageNumber}
                <IconButton
                  disabled={nextBtnDisabled}
                  onClick={handleNextBtnClick}
                >
                  <KeyboardArrowRight />
                </IconButton>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Fragment>
  )
}
