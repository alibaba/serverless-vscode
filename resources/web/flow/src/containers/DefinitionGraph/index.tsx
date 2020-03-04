import React, { createRef, useEffect, useState, Fragment } from 'react';
import * as yaml from 'js-yaml';
import {
  initGraph,
  analysisInputData,
  renderGraph,
} from '../../utils/graph/graph';
import {
  CellMap,
  Edge,
} from '../../utils/graph/description';
import { DefinitionGraphProps } from '../../props';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '../../components/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { schema } from '../../utils/schema';

export const DefinitionGraph: React.FunctionComponent<DefinitionGraphProps> = ({ definition }) => {
  const graphContainerRef = createRef<HTMLDivElement>();
  const [errorInfo, setErrorInfo] = useState<{ visible: boolean, message: string }>({
    visible: false,
    message: '',
  });

  const drawDefGraph = () => {
    if (!graphContainerRef.current) {
      return;
    }
    const cellMap: CellMap = {};
    const edgeList: Edge[] = [];
    graphContainerRef.current.innerHTML = '';

    const graph = initGraph(graphContainerRef.current);
    const input = yaml.safeLoad(definition, { schema });
    try {
      analysisInputData(undefined, (input && input.steps) || [], cellMap, edgeList, 0);
      renderGraph(graph, cellMap, edgeList);
      handleErrorMessageClose();
    } catch (ex) {
      setErrorInfo({
        visible: true,
        message: ex.message,
      })
    }
  }

  const handleErrorMessageClose = () => {
    setErrorInfo({
      visible: false,
      message: '',
    });
  }

  useEffect(() => {
    drawDefGraph();
  }, [definition]);

  return (
    <Fragment>
      <div
        id="flowDefGraph"
        ref={graphContainerRef}
        style={{ backgroundColor: '#fff', minHeight: '100vh', paddingTop: '24px' }}
      />
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={errorInfo.visible}
        onClose={handleErrorMessageClose}
      >
        <SnackbarContent
          style={{
            backgroundColor: '#c33f38'
          }}
          message={
            <div style={{ fontSize: '20' }}>
              {errorInfo.message}
            </div>
          }
          action={[
            <IconButton
              key="close"
              style={{ color: '#000' }}
              onClick={handleErrorMessageClose}
            >
              <CloseIcon style={{ fontSize: '20' }} />
            </IconButton>
          ]}
        />
      </Snackbar>
    </Fragment>
  )
}
