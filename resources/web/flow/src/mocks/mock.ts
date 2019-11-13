const flowDefinition = `
version: v1beta1
type: flow
steps:
- type: pass    # pass step 用于传递或转换数据，也可以作为 task step 调试的占位步骤
  name: PreProcess
- type: parallel
  name: ParallelProcess
  branches:    # parallel step 并行执行 branches 里面的步骤
    - steps:    # 第一个 branch
        - type: pass
          name: WorkerStep1
    - steps:    # 第二个 branch
        - type: pass
          name: WorkerStep2-1
        - type: pass
          name: WorkerStep2-2
  outputMappings:    # 该 mapping 产生 {"key1":"value1", "key2":"value2"} 作为 step 输出 (output)
    - target: key1
      source: value1
    - target: key2
      source: value2
- type: wait    # wait step 等待指定的时间，duration 单位为秒
  name: Wait10s
  duration: 10
- type: choice    # choice step 根据 step input 和指定条件决定下一步骤
  name: CheckStatus
  choices:    # 假设该 execution 的输入为 {"key":"process_failed"}, 则该 step 输入为 {"key1":"value1", "key2":"value2", "key":"process_failed"}
    - condition: $.key1==$.key2    # key1 和 key2 值如果相等，执行 OnSuccess 步骤，结束后进入 ProcessSucceeded 步骤
      steps:
        - type: pass
          name: OnSucceess
      goto: ProcessSucceeded
    - condition: $.key=="process_failed"    # 如果输入中的 key 字段值为字符串 "process_failed", 跳转到 ProcessFailed 步骤
      goto: ProcessFailed
  default:
      goto: ProcessSucceeded
- type: succeed    # succeed step 是一种结束步骤，产生 ExecutionSucceeded 事件
  name: ProcessSucceeded
- type: fail    # fail step 是一种结束步骤，产生 ExecutionFailed 事件
  name: ProcessFailed
`;

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
    },
    'startExecution': {
    },
    'describeExecution': {
      FlowName: 'flow',
      FlowDefinition: flowDefinition,
      Input: '{"key":"value"}',
      Name: 'exec',
      Output: '{}',
      StartedTime: '2019-01-01T01:01:01.001Z',
      Status: 'Succeeded',
      StoppedTime: '2019-01-01T01:01:01.001Z',
    },
    'getExecutionHistory': {
      Events: [
        {
          EventId: 1,
          Type: 'ExecutionStarted',
          StepName: 'passStep',
          Time: '2019-01-01T01:01:01.001Z',
          EventDetail: '{}',
        }
      ],
    },
    'describeFlowDefinition': {
      Definition: flowDefinition,
    },
    'describeInitialEntry': {
      entry: '/'
    }
  }
}
