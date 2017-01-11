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

export function calcIPSumVal(ip) {
  var addrArray = ip.split('.')
  var i = 0
  var sumAddr = _.reduce(addrArray, (sum, n) => {
    var power = 3-i;
    i++;
    return sum+ (parseInt(n)%256 * Math.pow(256, power))
  }, 0)

  return sumAddr
}