'use strict';

import React from 'react';
import './loginPage.less';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Button from 'react-bootstrap/lib/Button';

export default class loginPage extends React.Component {
  constructor(props) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUsernameChange =
      (e) => {this.setState({username: e.target.value})};
    this.handlePasswdChange =
      (e) => {this.setState({password: e.target.value})};

    this.state = {
      username: 'walton',
      password: ''
    };
  }
  render() {
    console.log('[loginPage]: render')
    const { ...props} = this.props;

    return (
      <Grid {...props} className="loginPage">
        <Form horizontal onSubmit={this.handleSubmit}>
          <FormGroup controlId="formHorizontalEmail">
            <Col componentClass={ControlLabel} sm={2}>
              用户名
            </Col>
            <Col sm={10}>
              <FormControl placeholder=""
              value={this.state.username} onChange={this.handleUsernameChange} />
            </Col>
          </FormGroup>

          <FormGroup controlId="formHorizontalPassword">
            <Col componentClass={ControlLabel} sm={2}>
              密码
            </Col>
            <Col sm={10}>
              <FormControl type="password" placeholder="Password"
              value={this.state.password} onChange={this.handlePasswdChange} />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col smOffset={2} sm={10}>
              <Button type="submit">
                登录
              </Button>
            </Col>
          </FormGroup>
        </Form>
      </Grid>
    )
  }

  componentWillMount() {
    console.log('[loginPage]: componentWillMount')
  }

  componentDidMount() {
    console.log('[loginPage]: componentDidMount');
    this.yourLogic();
  }

  componentWillUnmount() {
    console.log('[loginPage]: componentWillUnmount');
    // if (this.timer) {
    //   clearInterval(this.timer);
    // }
  }

  handleKeyDown(event) {
    console.log('[loginPage]: handleKeyDown:', event.keyCode);
    event.stopPropagation();
    if(event.keyCode == 13){
        alert('loginPage handle Key Enter....');
     }
  }

  handleSubmit (event) {
    console.log('[loginPage]: handleSubmit:', event.keyCode);
    event.preventDefault();

    var username = this.state.username.trim();
    var password = this.state.password.trim();
    if (!username || !password) {
      return;
    }

    $.post('/u/login', {
      username: username,
      password: password
    })
    .done(function (retInfo){
      console.log('[loginPage]: login success:', retInfo);
      if (retInfo.redirect) {
         window.location.href = retInfo.redirect;
      };
    })
    .fail(function (err) {
      console.log(err);
    });
  }


  yourLogic() {
    // const intervalDuration = this.props.intervalDuration;
    // this.asyncGetData();
    // this.timer = setInterval(this.asyncGetData.bind(this), 2000);
  }

}
