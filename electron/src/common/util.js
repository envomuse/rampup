const electron = require('electron')
const isUrl = require('is-url')

export function isURL(str) {
  // var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  // '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  // '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  // '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  // '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  // '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  // return pattern.test(str);
  return isUrl(str)
}

export function getPlatform () {
	return (process.platform.indexOf('darwin') < 0) ? 'win' : 'mac'
}

export function getScreenResolution () {
  const {width, height} = electron.screen.getPrimaryDisplay().bounds

  const resolution = {
    width,
    height,
  }

  return resolution
}
