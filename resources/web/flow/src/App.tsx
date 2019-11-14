import React, { useEffect, useState } from 'react';
import {
  MemoryRouter,
  Switch,
  Route,
 } from 'react-router-dom';
import { getInstance } from './services/service';
import { FlowInfo } from './containers/FlowInfo';
import { FlowDefinition } from './containers/FlowDefinition';
import { ExecutionInfo } from './containers/ExecutionInfo';
import { FCRouter } from './routes/fc';

import './App.css';

const App: React.FC = () => {
  const service = getInstance();
  const [initialEntry, setInitialEntry] = useState('');
  useEffect(() => {
    describeInitialEntry();
  }, []);
  const describeInitialEntry = async () => {
    const data = await service.request({
      command: 'describeInitialEntry',
    });
    const { entry = '/' } = data;
    setInitialEntry(entry);
  }
  return (
    initialEntry ?
      <MemoryRouter initialEntries={[initialEntry]}>
        <div>
          <Switch>
            <Route path="/fc">
              <FCRouter />
            </Route>
            <Route path="/executions/item/:executionName">
              <ExecutionInfo />
            </Route>
            <Route path="/definition">
              <div>
                <FlowDefinition />
              </div>
            </Route>
            <Route path="/" render={(props) => {
              return <FlowInfo history={props.history}/>
            }} />
          </Switch>
        </div>
      </MemoryRouter>
      :
      null
  );
}

export default App;
