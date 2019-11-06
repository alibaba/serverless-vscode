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
  }
}
