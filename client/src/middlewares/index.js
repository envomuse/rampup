import adminMsgMdl from '../middlewares/adminMsgMdl'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'

const loggerMiddleware = createLogger()

const middlewares = [thunkMiddleware, loggerMiddleware, adminMsgMdl];

export default middlewares;