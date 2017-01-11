import AdminSockio from './sockio/adminsockio';
import GuestSockIO from './sockio/guestsockio';

let gSockIO = null;

function init(cmd, nickName = 'SomeGuy', groupInfoCB) {
  if (gSockIO) {
    console.warn(`ioPackage already initialized`);
    return false;
  }

  gSockIO = new GuestSockIO(cmd, nickName, groupInfoCB);
  return gSockIO;
}

function login(stateListener) {
  if (gSockIO) {
    console.warn(`ioPackage already initialized`);
    return false;
  }

  gSockIO = new AdminSockio(stateListener);
  return gSockIO;
}


const ioPackage =  {
  init: init,
  getInstance: () => {return gSockIO},

  GuestSockIO: GuestSockIO,

  login: login
};

module.exports = ioPackage;
// export default ioPackage