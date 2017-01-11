'use strict';
import React from 'react'
import {LinkContainer} from 'react-router-bootstrap'


import Navbar from 'react-bootstrap/lib/Navbar'
import Nav from 'react-bootstrap/lib/Nav'
import NavItem from 'react-bootstrap/lib/NavItem'
import NavDropdown from 'react-bootstrap/lib/NavDropdown'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import Badge from 'react-bootstrap/lib/Badge'

export default class NavComponent extends React.Component {
  constructor(props) {
    super(props);

    this.handleLogout = this.handleLogout.bind(this);

    this.handleGoBack = () => {
      window.history.back()
    }
    this.shouldRenderReturn = () => {
      const hash = window.location.hash
      return ((hash.indexOf('dashboard') > 0 || hash.split('?')[0] == '#/') ? false : true)
    }
  }
  render() {
    const {user, ...props} = this.props;

    console.log('[NavComponent] render:', user.toJS());

    return (
      <div className="">
        <Navbar inverse>
          <Navbar.Header>
            <Navbar.Brand>
              <LinkContainer to='/dashboard' disabled={false}>
                 <span>总览 </span>
              </LinkContainer>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>

          <Nav>
          {this.shouldRenderReturn() ? (<NavItem onClick={this.handleGoBack}>返回</NavItem>) : null}
          </Nav>

          <Navbar.Collapse>
            <Nav pullRight>
              <NavDropdown eventKey={3} title={user ? user.get('username') : 'walton'} id="nav-dropdown">
                <MenuItem eventKey={3.1} ><Glyphicon glyph="align-left" />个人档案</MenuItem>
                <MenuItem divider />
                <MenuItem eventKey={3.2} onSelect = {this.handleLogout} >退出</MenuItem>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }

  componentWillMount() {

  }

  componentDidMount() {

  }

  componentWillUnmount() {
  }

  handleLogout () {
    $.post('/u/logout')
    .done(function (retInfo){
      console.log('[HeadNav]: logout success:');
      if (retInfo.loginurl) {
         window.location.href = retInfo.loginurl;
      };
    })
    .fail(function (err) {
      console.log(err);
    });
  }

}