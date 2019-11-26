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

export const FunctionList = () => {
  const service = getInstance();

  const [dataSource, setDataSource] = useState<any[]>([]);
  const [functions, setFunctions] = useState<any[]>([]);
  const [nextToken, setNextToken] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [pageNumber, setPageNumber] = useState<number>(DEFAULT_PAGE_NUMBER);
  const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);

  useEffect(() => { initFunctions(); }, []);

  const initFunctions = async () => {
    const data = await service.request({
      command: 'fc/listFunctions',
      nextToken,
    });
    const { functions: newFunctions, nextToken: newNextToken } = data;
    if (newFunctions && newFunctions.length) {
      setFunctions(newFunctions);
      setDataSource(sliceData(newFunctions, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE));
      setNextToken(newNextToken || '');
      setPageSize(DEFAULT_PAGE_SIZE);
      setPageNumber(DEFAULT_PAGE_NUMBER);
      setNextBtnDisabled(checkHasNext(newFunctions, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, newNextToken));
    }
  }

  const handleBackBtnClick = () => {
    const newPageNumber = pageNumber - 1 < 0 ? 1 : pageNumber - 1;
    setDataSource(sliceData(functions, newPageNumber, pageSize));
    setPageNumber(newPageNumber);
    setNextBtnDisabled(checkHasNext(functions, newPageNumber, pageSize, nextToken));
  }

  const handleNextBtnClick = async () => {
    const newPageNumber = pageNumber + 1;
    if (functions.length >= newPageNumber * pageSize
      || !nextToken
    ) {
      setDataSource(sliceData(functions, newPageNumber, pageSize));
      setPageNumber(newPageNumber);
      setNextBtnDisabled(checkHasNext(functions, newPageNumber, pageSize, nextToken));
    } else {
      const data = await service.request({
        command: 'fc/listFunctions',
        nextToken,
      });
      const { functions: newFunctions, nextToken: newNextToken } = data;
      if (newFunctions && newFunctions.length) {
        const curFunctions = [...functions, ...newFunctions];
        setFunctions(curFunctions);
        setDataSource(sliceData(curFunctions, newPageNumber, pageSize));
        setNextToken(newNextToken || '');
        setPageNumber(newPageNumber);
        setNextBtnDisabled(checkHasNext(curFunctions, newPageNumber, pageSize, newNextToken));
      }
    }
  }

  const handleFunctionNameClick = (functionName: string) => {
    service.request({
      command: 'fc/showRemoteFunctionInfo',
      functionName,
    });
  }

  return (
    <Fragment>
      <IconButton
        style={{ float: 'right' }}
        onClick={initFunctions}
      >
        <Refresh />
      </IconButton>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>函数名称</TableCell>
            <TableCell>运行环境</TableCell>
            <TableCell>内存规格</TableCell>
            <TableCell>超时时间</TableCell>
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
                  onClick={() => { handleFunctionNameClick(row.functionName); }}
                >
                  {row.functionName}
                </Link>
              </TableCell>
              <TableCell>{row.runtime}</TableCell>
              <TableCell>{row.memorySize} MB</TableCell>
              <TableCell>{row.timeout} 秒</TableCell>
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
