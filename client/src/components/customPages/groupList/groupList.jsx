import React from 'react';

import PanelGroup from 'react-bootstrap/lib/PanelGroup'
import Panel from 'react-bootstrap/lib/Panel'
import ClientGroup from './client_group'


export default class GroupList extends React.Component {
  constructor(props) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  render() {
    console.log('[groupList]: render')

    const {data, actions, user, pageAction, pageStore, ...props} = this.props;

    // Your Custom Logic
    const {groups, sockets} = data.chatGroups.toJS();
    if (groups.length === 0) {
      return this.renderEmpty()
    }

    console.log('groups, sockets:', groups, sockets);

    return (
      <PanelGroup defaultActiveKey={0} accordion>
        {groups.map((group, i) =>
          <Panel header={'组名:'+group.name} eventKey={i} key={group.id} bsStyle='info'>
            <ClientGroup group={group} user={user} sockets={sockets} pageAction = {pageAction} actions={actions} />
          </Panel>
        )}
      </PanelGroup>
    );
  }

  renderEmpty () {
    console.log('[groupList]: renderEmpty');
    return (<h1>组信息为空</h1>);
  }

  componentWillMount() {
    console.log('[groupList]: componentWillMount')
  }

  componentDidMount() {
    console.log('[groupList]: componentDidMount');
  }

  componentWillUnmount() {
    console.log('[groupList]: componentWillUnmount');
  }

  handleKeyDown(event) {
    console.log('[groupList]: handleKeyDown:', event.keyCode);
    event.stopPropagation();
    if(event.keyCode == 13){
        // alert('groupList handle Key Enter....');
     }
  }
}