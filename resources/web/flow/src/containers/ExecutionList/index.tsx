import React, { Fragment } from 'react';
import { ExecutionListProps } from '../../props.d';
import { getInstance } from '../../services/service';
import { Route } from 'react-router-dom';
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
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import { ExecutionStart } from '../ExecutionStart';

function sliceExecution(executions: any[], pageNumber: number, pageSize: number): any[]{
  return executions.slice(
    (pageNumber - 1) * pageSize, pageNumber * pageSize
  );
}

function checkHasNext(executions: any[], pageNumber: number, pageSize: number, nextToken: string): boolean {
  return executions.length <= pageSize * pageNumber && !nextToken;
}

export class ExecutionList extends React.Component<ExecutionListProps> {
  defaultState = {
    executions: [],
    dataSource: [],
    pageSize: 10,
    pageNumber: 1,
    nextToken: '',
    nextBtnDisabled: true,
  }

  state = {
    ...this.defaultState,
  }

  service = getInstance();

  constructor(props: any) {
    super(props);
    this.handleBackBtnClick = this.handleBackBtnClick.bind(this);
    this.handleNextBtnClick = this.handleNextBtnClick.bind(this);
  }

  componentDidMount() {
    this.initExecutions();
  }

  initExecutions() {
    this.service.request({ command: 'listExecutions' }).then((data) => {
      const { Executions: executions, NextToken: nextToken } = data;
      if (executions && executions.length) {
        this.setState({
          executions,
          dataSource: sliceExecution(executions, this.defaultState.pageNumber, this.defaultState.pageSize),
          pageSize: this.defaultState.pageSize,
          pageNumber: this.defaultState.pageNumber,
          nextToken,
          nextBtnDisabled: checkHasNext(executions, this.defaultState.pageNumber, this.defaultState.pageSize, nextToken),
        });
      }
    });
  }

  handleBackBtnClick() {
    let { executions, pageSize, pageNumber, nextToken } = this.state;
    pageNumber = pageNumber - 1 < 0 ? 1 : pageNumber - 1;
    this.setState({
      dataSource: sliceExecution(executions, pageNumber, pageSize),
      pageNumber,
      nextBtnDisabled: checkHasNext(executions, pageNumber, pageSize, nextToken),
    });
  }

  handleNextBtnClick() {
    let { executions, pageSize, pageNumber, nextToken } = this.state;
    pageNumber = pageNumber + 1;
    if (executions.length >= pageNumber * pageSize
      || !nextToken
    ) {
      this.setState({
        dataSource: sliceExecution(executions, pageNumber, pageSize),
        pageNumber,
        nextBtnDisabled: checkHasNext(executions, pageNumber, pageSize, nextToken),
      });
    } else {
      this.service.request({ command: 'listExecutions', nextToken })
        .then((data) => {
          const { Executions: executions, NextToken: nextToken } = data;
          let { executions: curExecutions } = this.state;
          curExecutions = curExecutions.concat(executions);
          if (executions && executions.length) {
            this.setState({
              executions: curExecutions,
              dataSource: sliceExecution(curExecutions, pageNumber, pageSize),
              pageNumber,
              nextToken: nextToken || '',
              nextBtnDisabled: checkHasNext(curExecutions, pageNumber, pageSize, nextToken),
            })
          }
        });
    }
  }

  redirectToExecutionInfo = (executionName: string) => {
    this.props.history.push(`/executions/item/${executionName}`);
  }

  onRefresh(url: string, isReload: boolean) {
    this.props.history.push(url);
    if (isReload) {
      this.setState({
        ...this.defaultState,
      });
      this.initExecutions();
    }
  }

  render () {
    return (
      <Fragment>
         <Button
          variant="contained"
          color="primary"
          style={{
            marginTop: '12px',
            backgroundColor: '#007acc',
            outline: '1px solid #007acc',
            color: '#fff',
            borderRadius: '0',
          }}
          size="small"
          onClick={() => { this.props.history.push('/executions/start') }}
        >
          开始执行
        </Button>
        <IconButton
          style={{ float: "right" }}
          onClick={() => { this.initExecutions(); }}
        >
          <Refresh />
        </IconButton>
        <Route path="/executions/start">
            <ExecutionStart
              flowName={this.props.flowName}
              onClose={
                () => this.onRefresh('/', false)
              }
              onSuccess={
                (executionName: string) => {
                  if (executionName) {
                    this.onRefresh(`/executions/item/${executionName}`, false);
                  } else {
                    this.onRefresh('/', true);
                  }
                }
              }
            />
        </Route>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>执行名称</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>结束时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.dataSource.map((row: any) => (
              <TableRow>
                <TableCell>
                  <Link
                    underline="always"
                    style={{ cursor: "pointer" }}
                    onClick={() => this.redirectToExecutionInfo(row.Name)}>
                    {row.Name}
                  </Link>
                </TableCell>
                <TableCell>{row.Status}</TableCell>
                <TableCell>{new Date(row.StartedTime).toLocaleString()}</TableCell>
                <TableCell>{new Date(row.StoppedTime).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell size="small" padding="none" style={{ border: '0' }}>
                <div>
                  <IconButton
                    aria-label="previous page"
                    disabled={this.state.pageNumber === 1}
                    onClick={this.handleBackBtnClick}
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                  {this.state.pageNumber}
                  <IconButton
                    aria-label="next page"
                    disabled={this.state.nextBtnDisabled}
                    onClick={this.handleNextBtnClick}
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
}
