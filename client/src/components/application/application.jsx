'use strict';

import React from 'react'

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import HeadNav from './headnav';
import {is} from 'immutable'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import './application.less'

class App extends React.Component {
  constructor(props) {
    super(props);

    this.handleShortcuts = this.handleShortcuts.bind(this);
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return !is(nextProps.data, this.props.data)
  //   || !is(nextProps.pageStores, this.props.pageStores)
  //   || nextProps.location.pathname !== this.props.location.pathname;
  // }

  render() {
    const {children, user, location, pageStores, pageActions, ...props} = this.props;
    console.log('user', user.toJS())
    // page name
    var key = location.pathname[0] === '/' ? location.pathname.substr(1): location.pathname;
    if (key) {
      key = key.split('/')[0]  // to handle case of socket_detail/{id}
    }
    var pageStore = pageStores[key];
    var pageAction = pageActions[key];

    if (!pageStore || !pageAction) {
      console.warn('NULL key:', key);
    };

    console.log('pageStores pageActions', location.pathname, pageStores, pageActions )

    console.log('[In App render]', location.pathname, key, pageStore, pageAction);
    return (
      <div className="app">
       <HeadNav user = {user} />
        <Grid>
          <Row className="">
            <Col>
              <ReactCSSTransitionGroup
                component="div" transitionName="appPage"
                transitionEnterTimeout={50} transitionLeaveTimeout={50}
              >
                {React.cloneElement(children, {...props, pageStore, pageAction, user})}
              </ReactCSSTransitionGroup>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
  componentDidMount() {
    console.log('[App]: componentDidMount')
    // React.addEventListener(document, "keyup", this.handleShortcuts)
    $(document.body).on('keydown', this.handleShortcuts);
  }
  componentWillUnmount() {
    console.log('[App]: componentWillUnmount')
    // React.removeEventListener(document, "keyup", this.handleShortcuts)
    $(document.body).off('keydown', this.handleShortcuts);
  }

  handleShortcuts(eventObject) {
    if(event.keyCode == 27 /*Esc*/){
        // alert('Esc alert....');
     }
  }

}

App.propTypes = {
  actions: React.PropTypes.object.isRequired
}

// Connect react and redux
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as actions from 'actions'

const mapStateToProps = (state) => { return state; };
const mapDispatchToProps = (dispatch) => {
  //Start here
  if (actions.pageActions) {
    let bindPageActionsObj = {};
     $.each(actions.pageActions,
      (key, pageAction) => bindPageActionsObj[key] = bindActionCreators(pageAction, dispatch));

    delete actions.pageActions;

    return {
      pageActions: bindPageActionsObj,
      actions: bindActionCreators(actions, dispatch)
    };
  } else {
    return {actions: bindActionCreators(actions, dispatch) }
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

