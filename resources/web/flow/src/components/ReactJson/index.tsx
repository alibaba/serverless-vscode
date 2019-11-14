import React from 'react';
import ReactJson from 'react-json-view';

const NewReactJSON: React.FunctionComponent<{ jsonStr: string }> = ({ jsonStr }) => {
  return (
    <ReactJson
      src={jsonStr ? JSON.parse(jsonStr) : {}}
      theme="solarized"
      displayDataTypes={false}
      style={{
        padding: '18px 0px',
        backgroundColor: '#1e1e1e',
      }}
    />
  )
}

export default NewReactJSON;
