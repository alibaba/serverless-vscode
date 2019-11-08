import React from 'react';
import {
  MemoryRouter,
  Switch,
  Route,
 } from 'react-router-dom';
import { FlowInfo } from './containers/FlowInfo';
import { ExecutionInfo } from './containers/ExecutionInfo';

import './App.css';

const App: React.FC = () => {
  return (
    <MemoryRouter>
      <div>
        <Switch>
          <Route path="/executions/item/:executionName">
            <ExecutionInfo />
          </Route>
          <Route path="/" render={(props) => {
            return <FlowInfo history={props.history}/>
          }} />
        </Switch>
      </div>
    </MemoryRouter>
  );
}

export default App;
