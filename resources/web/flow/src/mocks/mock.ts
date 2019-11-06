export function getFakeResultSet(): { [s: string]: any } {
  return {
    'describeFlow': {
      Name: 'fakeFlow',
      Description: 'This is a fake result',
      RoleArn: 'acs:ram::123456789:role/fakeRoleSample',
      CreatedTime: '2019-11-01T09:16:10.173Z',
      Definition: `
version: v1beta1
type: flow
steps:
  - type: pass
    name: helloworld
`,
    },
    'listExecutions': {
      Executions: [
        {
          FlowName: 'flow1',
          Name: 'exec',
          StartedTime: '2019-01-01T01:01:01.001Z',
          StoppedTime: '2019-01-01T01:01:01.001Z',
          Status: 'Succeeded',
        },
        {
          FlowName: 'flow2',
          Name: 'exec',
          StartedTime: '2019-01-01T01:01:01.001Z',
          StoppedTime: '2019-01-01T01:01:01.001Z',
          Status: 'Succeeded',
        },
        {
          FlowName: 'flow3',
          Name: 'exec',
          StartedTime: '2019-01-01T01:01:01.001Z',
          StoppedTime: '2019-01-01T01:01:01.001Z',
          Status: 'Succeeded',
        },
        {
          FlowName: 'flow4',
          Name: 'exec',
          StartedTime: '2019-01-01T01:01:01.001Z',
          StoppedTime: '2019-01-01T01:01:01.001Z',
          Status: 'Succeeded',
        },
        {
          FlowName: 'flow5',
          Name: 'exec',
          StartedTime: '2019-01-01T01:01:01.001Z',
          StoppedTime: '2019-01-01T01:01:01.001Z',
          Status: 'Succeeded',
        },
        {
          FlowName: 'flow6',
          Name: 'exec',
          StartedTime: '2019-01-01T01:01:01.001Z',
          StoppedTime: '2019-01-01T01:01:01.001Z',
          Status: 'Succeeded',
        },
        {
          FlowName: 'flow7',
          Name: 'exec',
          StartedTime: '2019-01-01T01:01:01.001Z',
          StoppedTime: '2019-01-01T01:01:01.001Z',
          Status: 'Succeeded',
        },
        {
          FlowName: 'flow8',
          Name: 'exec',
          StartedTime: '2019-01-01T01:01:01.001Z',
          StoppedTime: '2019-01-01T01:01:01.001Z',
          Status: 'Succeeded',
        },
        {
          FlowName: 'flow9',
          Name: 'exec',
          StartedTime: '2019-01-01T01:01:01.001Z',
          StoppedTime: '2019-01-01T01:01:01.001Z',
          Status: 'Succeeded',
        },
        {
          FlowName: 'flow10',
          Name: 'exec',
          StartedTime: '2019-01-01T01:01:01.001Z',
          StoppedTime: '2019-01-01T01:01:01.001Z',
          Status: 'Succeeded',
        },
        {
          FlowName: 'flow11',
          Name: 'exec',
          StartedTime: '2019-01-01T01:01:01.001Z',
          StoppedTime: '2019-01-01T01:01:01.001Z',
          Status: 'Succeeded',
        },
      ],
      NextToken: 'exec2',
    }
  }
}
