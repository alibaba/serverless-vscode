import React from 'react';
import {
  Switch,
  Route,
 } from 'react-router-dom';
import { ServiceInfo } from '../../containers/fc/ServiceInfo';
import { FunctionInfo } from '../../containers/fc/FunctionInfo';

 export const FCRouter = () => {
   return (
     <Switch>
       <Route path="/fc/services/item/:serviceName/functions/item/:functionName">
         <FunctionInfo />
       </Route>
       <Route path = "/fc/services/item/:serviceName">
         <ServiceInfo />
       </Route>
     </Switch>
   )
 }
