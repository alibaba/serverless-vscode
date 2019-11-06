import React from 'react';
import { FlowInfo } from './containers/FlowInfo';
import {
  MemoryRouter,
  Switch,
  Route,
 } from 'react-router-dom';
import './App.css';

const App: React.FC = () => {
  return (
    <MemoryRouter>
      <div>
        <Switch>
          <Route path="/">
            <FlowInfo />
          </Route>
        </Switch>
      </div>
    </MemoryRouter>
  );
}

export default App;
