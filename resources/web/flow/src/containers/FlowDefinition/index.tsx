import React, { useEffect, useState, Fragment } from 'react';
import { getInstance } from '../../services/service';
import { DefinitionGraph } from '../DefinitionGraph';
import IconButton from '../../components/IconButton';
import Refresh from '@material-ui/icons/Refresh';

export const FlowDefinition = () => {
  const service = getInstance();
  const [definition, setDefinition] = useState<string>('');

  const describeFlowDefinition = async () => {
    const data = await service.request({
      command: 'describeFlowDefinition',
    });
    const { Definition: newDefinition = '' } = data;
    setDefinition(newDefinition);
  }

  useEffect(() => {
    describeFlowDefinition();
  }, []);

  return (
    <Fragment>
      <DefinitionGraph definition={definition}/>
      <IconButton
        style={{ color: '#000', position: 'absolute', top: '24px', right: '18px' }}
        onClick={describeFlowDefinition}
      >
        <Refresh />
      </IconButton>
    </Fragment>

  )
}
