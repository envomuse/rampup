import {fromJS} from 'immutable'
import * as AT from './const'

const initialState = fromJS({
});

export default function socketDetailReducer(state = initialState, action) {
  console.log('[socketDetailReducer]:', state, action)
  return state;
}