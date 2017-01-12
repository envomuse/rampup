import {GROUP_TYPE_CHATANY, GROUP_TYPE_ONEBOSS, DEVICE_IPAD, DEVICE_BROWSER} from 'constants/const'

import {REMOTE_STATE_CHANGE} from 'constants/actionTypes'

import {fromJS} from 'immutable'

const _ = require('lodash')
import {calcIPSumVal} from 'util'

const initialState = {
  groups : [{
      id: 0,
      type: GROUP_TYPE_CHATANY,
      name: 'Dec1',
      boss: 1,
      sockets: [1, 2]
    }
    ,{
      id: 1,
      type: GROUP_TYPE_ONEBOSS,
      name: 'OneBossGroup',
      boss: 4,
      sockets: [3, 4, 5]
    }],

  sockets: [{
    id: 1,
    name: 'tom',

    app: {
      windowId: null,
      url: '',
      windowSize: 'maxmize' // ['maxmize', 'minimum', 'normal']
    },
    device: {
      ip: '10.12.3.15',
      code: 11,
      resolution: {
        width: 1400,
        height: 1050
      }
    }
  }, {
    id: 2,
    name: 'jerry',

    app: {
      windowId: null,
      url: '',
      windowSize: 'maxmize' // ['maxmize', 'minimum', 'normal']
    },
    device: {
      ip: '10.12.3.15',
      code: 11,
      resolution: {
        width: 1400,
        height: 1050
      }
    }
  }, {
    id: 3,
    name: 'jim',
    app: {
      windowId: null,
      url: '',
      windowSize: 'maxmize' // ['maxmize', 'minimum', 'normal']
    },
    device: {
      ip: '10.12.3.15',
      code: 11,
      resolution: {
        width: 1400,
        height: 1050
      }
    }
  }, {
    id: 4,
    name: 'walton',

    app: {
      windowId: null,
      url: '',
      windowSize: 'maxmize' // ['maxmize', 'minimum', 'normal']
    },
    device: {
      ip: '10.12.3.15',
      code: 11,
      resolution: {
        width: 1400,
        height: 1050
      }
    }
  }, {
    id: 5,
    name: 'amy',
    app: {
      windowId: null,
      url: '',
      windowSize: 'maxmize' // ['maxmize', 'minimum', 'normal']
    },
    device: {
      ip: '10.12.3.15',
      code: 11,
      resolution: {
        width: 1400,
        height: 1050
      }
    }
  }]
}

const immutableState = fromJS(initialState);

export default function chatGroups(state = immutableState, action) {
  switch (action.type) {
    case REMOTE_STATE_CHANGE: {
      let {newState} = action;

      if (newState) {
        const adminSockets = _.filter(newState.sockets, (_socket) => {
          return _socket.role === 'admin'
        })

        const validClientSockets = _.filter(newState.sockets, (_socket) => {
          return !!_socket.groupId
        })

        newState.sockets = _.sortBy (validClientSockets, function (socket) {
          console.log('scoket devi:', socket)
          if (socket.role === 'admin') {
            return -1
          }
          return socket.device.ip ? calcIPSumVal(socket.device.ip) : 0
        })

        newState.adminSockets = adminSockets
      }

      return fromJS(newState);
    }
    default:
      return state
  }
}