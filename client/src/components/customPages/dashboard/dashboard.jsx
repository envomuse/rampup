import React from 'react';
import './dashboard.less'
import {Link} from 'react-router'
import Grid from 'react-bootstrap/lib/Grid'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Button from 'react-bootstrap/lib/Button'
import Panel from 'react-bootstrap/lib/Panel'
import Glyphicon from 'react-bootstrap/lib/Glyphicon';


const BasicComponent = ({title, description, count, tolink, onEnterAction}) => (
  <Panel header={title} bsStyle="info">
     <h1>{description}  {count}  </h1>
     <Button bsStyle="link" bsSize="large">
        <Link to={tolink}><Glyphicon glyph="arrow-right" /> 查看详细 </Link>
     </Button>
  </Panel>
);

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  render () {
    console.log('[dashboard]: render:');

    const {data, pageAction, pageStore, ...props} = this.props;


    // Your Custom Logic
    let  {chatGroups, webapps} = data;
    chatGroups = chatGroups.toJS();
    const {sockets, adminSockets, groups} = chatGroups;
    const socketProp = {
      title : "所有的客户端",
      tolink : '/socketList',
      count : sockets.length,
      description : "已经连接的客户端数:"
    };
    const groupProp = {
      title : "分组的客户端",
      tolink : '/groupList',
      count : groups.length,
      description : "所有分组数:"
    };
    const adminProp = {
      title : "管理员",
      tolink : '/dashboard',
      count : adminSockets.length,
      description : "已经连接的管理员数:"
    };

    return (
        <Grid>
          <Row className="show-grid">
            <Col md={6}>
              <BasicComponent  {...socketProp} />
            </Col>
            <Col md={6}>
              <BasicComponent  {...groupProp} />
            </Col>
            <Col md={6}>
              <BasicComponent  {...adminProp} />
            </Col>
            <Col md={6}>
              <Panel header={"模式管理"} bsStyle="info">
                 <h1> 管理预设模式 </h1>
                 <Button bsStyle="link" bsSize="large">
                    <Link to='/modeManage'><Glyphicon glyph="arrow-right" /> 查看详细 </Link>
                 </Button>
              </Panel>
            </Col>
          </Row>
        </Grid>
      );
  }

  componentWillMount() {
    console.log('[dashboard]: componentWillMount')
  }

  componentDidMount() {
    console.log('[dashboard]: componentDidMount');
  }

  componentWillUnmount() {
    console.log('[dashboard]: componentWillUnmount');
  }

  handleKeyDown(event) {
    console.log('[dashboard]: handleKeyDown:', event.keyCode);
    event.stopPropagation();
    if(event.keyCode == 13){
        alert('dashboard handle Key Enter....');
     }
  }
}

Dashboard.propTypes = { intervalDuration: React.PropTypes.number };
Dashboard.defaultProps = { intervalDuration: 2000 };