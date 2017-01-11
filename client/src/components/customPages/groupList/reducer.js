import {fromJS} from 'immutable'
import * as AT from './const'

const initialState = fromJS({
});

export default function groupListReducer(state = initialState, action) {
  console.log('[groupListReducer]:', state, action)
  return state;
}