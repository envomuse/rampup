const SCRIPTPATH = document.currentScript.src;
const HOST = SCRIPTPATH.substr(0, SCRIPTPATH.indexOf('/', 'http://'.length));
console.log('wssockethost:', HOST);

export default HOST;