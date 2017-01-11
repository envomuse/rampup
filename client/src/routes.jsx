import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'
import App from 'application'
// import SamplePage from 'samplePage'
import { createHashHistory, useBasename } from 'history'
import store from 'store'
import { Provider } from 'react-redux'
import { syncReduxAndRouter } from 'redux-simple-router'

const history = createHashHistory();

syncReduxAndRouter(history, store);

/* GEEKPACK PLACEHOLDER START [import module] */
import groupList from 'groupList'
import SocketDetail from 'socket_detail'
import socketList from 'socketList'
import dashboard from 'dashboard'
import modeManage from 'modeManage'
/* Don't Modify Below Code, as it's generated automatically by geekpack CLI */
/* GEEKPACK PLACEHOLDER END */

var Routes = (
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <IndexRoute component={dashboard}/>
        {/* GEEKPACK PLACEHOLDER START [import route] */}
          <Route path="groupList" component={groupList}/>
          <Route path="socketList" component={socketList}/>
          <Route path="dashboard" component={dashboard}/>
          <Route path="socket_detail/:mac" component={SocketDetail}/>
          <Route path="modeManage" component={modeManage}/>

        {/* Don't Modify Below Code, as it's generated automatically by geekpack CLI */}
        {/* GEEKPACK PLACEHOLDER END */}
      </Route>
    </Router>
  </Provider>
);

export default Routes