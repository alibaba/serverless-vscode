import React from 'react';
import {
  MemoryRouter,
  Switch,
  Route,
 } from 'react-router-dom';
import { FlowInfo } from './containers/FlowInfo';

import './App.css';

const App: React.FC = () => {
  return (
    <MemoryRouter>
      <div>
        <Switch>
          <Route path="/" render={(props) => {
            return <FlowInfo history={props.history}/>
          }} />
        </Switch>
      </div>
    </MemoryRouter>
  );
}

export default App;
