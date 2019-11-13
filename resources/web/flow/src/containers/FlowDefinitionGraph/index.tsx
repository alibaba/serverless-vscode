import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution';
import { DefinitionGraphProps } from '../../props';
import { DefinitionGraph } from '../DefinitionGraph';
import Grid from '@material-ui/core/Grid';
import IconButton from '../../components/IconButton';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowForward from '@material-ui/icons/ArrowForward';

export const FlowDefinitionGraph: React.FunctionComponent<DefinitionGraphProps> = ({ definition }) => {
  const [graphVisible, setGraphVisible] = useState<boolean>(true);

  const handleShowGraph = () => {
    setGraphVisible(true);
  }

  const handleHideGraph = () => {
    setGraphVisible(false);
  }

  return (
    <Grid container>
      <Grid container item xs={12} spacing={0} style={{ position: 'relative' }}>
        <Grid item xs={graphVisible ? 7 : 12} style={{ height: '60vh', width: '100%', marginTop: '18px' }}>
        {
          definition ?
            <MonacoEditor
              theme="vs-dark"
              language="yaml"
              options={{
                readOnly: true,
                value: definition,
                automaticLayout: true,
              }}
            />
            :
            null
        }
        </Grid>
        {
          graphVisible ?
            <Grid item xs={5} style={{ height: '60vh', width: '100%', marginTop: '18px', overflow: 'auto' }}>
              <DefinitionGraph definition={definition} />
              <IconButton
                style={{ position:'absolute', bottom: '0px', right: '18px', color: '#000' }}
                onClick={handleHideGraph}
              >
                <ArrowForward />
              </IconButton>
            </Grid>
            :
            <IconButton
              style={{ position:'absolute', bottom: '0px', right: '18px', color: '#fff' }}
              onClick={handleShowGraph}
            >
              <ArrowBack />
            </IconButton>
        }
      </Grid>
    </Grid>
  )
}
