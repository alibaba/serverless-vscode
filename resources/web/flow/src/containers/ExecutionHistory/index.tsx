import React, { useState, useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { getInstance } from '../../services/service';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '../../components/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import IconButton from '../../components/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Refresh from '@material-ui/icons/Refresh';

function checkHasNext(events: any[], pageNumber: number, pageSize: number, nextToken: string): boolean {
  return events.length <= pageSize * pageNumber && !nextToken;
}

function sliceEvents(events: any[], pageNumber: number, pageSize: number): any[]{
  return events.slice(
    (pageNumber - 1) * pageSize, pageNumber * pageSize
  );
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_NUMBER = 1;

export const ExecutionHistory = () => {
  const { executionName } = useParams();
  const service = getInstance();

  const [dataSource, setDataSource] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [nextToken, setNextToken] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [pageNumber, setPageNumber] = useState<number>(DEFAULT_PAGE_NUMBER);
  const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);

  useEffect(() => { initExecutions() }, []);

  const initExecutions = async () => {
    const data = await service.request({
      command: 'getExecutionHistory',
      executionName,
      nextToken,
    });
    const { Events: newEvents, NextToken: newNextToken } = data;
    if (newEvents && newEvents.length) {
      setEvents(newEvents);
      setDataSource(sliceEvents(newEvents, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE));
      setNextToken(newNextToken);
      setPageSize(DEFAULT_PAGE_SIZE);
      setPageNumber(DEFAULT_PAGE_NUMBER);
      setNextBtnDisabled(checkHasNext(newEvents, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, newNextToken));
    }
  }

  const handleBackBtnClick = () => {
    const newPageNumber = pageNumber - 1 < 0 ? 1 : pageNumber - 1;
    setDataSource(sliceEvents(events, newPageNumber, pageSize));
    setPageNumber(newPageNumber);
    setNextBtnDisabled(checkHasNext(events, newPageNumber, pageSize, nextToken));
  }

  const handleNextBtnClick = async () => {
    const newPageNumber = pageNumber + 1;
    if (events.length >= pageNumber * pageSize
      || !nextToken
    ) {
      setDataSource(sliceEvents(events, newPageNumber, pageSize));
      setPageNumber(newPageNumber);
      setNextBtnDisabled(checkHasNext(events, newPageNumber, pageSize, nextToken));
    } else {
      const data = await service.request({
        command: 'getExecutionHistory',
        executionName,
        nextToken,
      });
      const { Events: newEvents, NextToken: newNextToken } = data;
      if (newEvents && newEvents.length) {
        const curEvents = [...events, ...newEvents];
        setEvents(curEvents);
        setDataSource(sliceEvents(curEvents, newPageNumber, pageSize));
        setNextToken(newNextToken || '');
        setPageNumber(newPageNumber);
        setNextBtnDisabled(checkHasNext(curEvents, newPageNumber, pageSize, newNextToken));
      }
    }
  }

  return (
    <Fragment>
      <IconButton
        style={{ float: "right" }}
        onClick={initExecutions}
      >
        <Refresh />
      </IconButton>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>执行步骤 ID</TableCell>
            <TableCell>类型</TableCell>
            <TableCell>步骤</TableCell>
            <TableCell>时间</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataSource.map((row: any) => (
            <TableRow>
              <TableCell>{row.EventId}</TableCell>
              <TableCell>{row.Type}</TableCell>
              <TableCell>{row.StepName}</TableCell>
              <TableCell>{new Date(row.Time).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell size="small" padding="none" style={{ border: '0' }}>
              <div>
                <IconButton
                  aria-label="previous page"
                  disabled={pageNumber === 1}
                  onClick={handleBackBtnClick}
                >
                  <KeyboardArrowLeft />
                </IconButton>
                {pageNumber}
                <IconButton
                  aria-label="next page"
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
