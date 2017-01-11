// Static asset
module.exports = exports = {
};

const STATIC_PREFIX = '/static';
exports.STATIC_PREFIX = STATIC_PREFIX;
exports.STATIC_PREFIX_REGR = new RegExp(`^${STATIC_PREFIX}`);
exports.LOGINPAGE = STATIC_PREFIX+'/login.html';
exports.IMGVIEWER = STATIC_PREFIX+'/imgViewer.html';
exports.WELCOMEPAGE = `${STATIC_PREFIX}/docs/welcome.html`;

// VIEW TPL DIR
exports.VIEW_TPLS_DIR = 'views/tpls';

// VIEW TPL DIR
exports.ROLE_ADMIN = 'admin';
exports.ROLE_GUEST = 'guest';

// ADMIN IO GROUP
exports.IO_GROUP_ADMIN = 'PRESERVE_ADMIN_ABCDEFG'