import {fromJS} from 'immutable'
import * as GAT from 'constants/actionTypes'

const initialState = fromJS({
});

export default function userReducer(state = initialState, action) {
  console.log('[userReducer]:', state, action)
  switch (action.type) {
    case GAT.GLOBAL_USER_SET_PREFERENCE: {
      const field = action.field
      const value = action.value
      if (action.merge) {
        const fieldSetter = {}
        fieldSetter[field] = value
        return state.merge({preference:fieldSetter})
      } else {
        return state.update('preference', (v) => {
          return v.update(field, (v2) => value)
        })
      }
    }
    default:
      return state
  }
}
