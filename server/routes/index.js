const forgotpw = require('./api/forgot-pw-pt1');
const forgotverify = require('./api/forgot-pw-pt2');
const jwttokenrefresh = require('./api/jwt-token-refresh');
const login = require('./api/login');
const logout = require('./api/logout');
const lostpetprofile = require('./api/lost-pet-profile');
const lostpets = require('./api/lost-pets');
const missingpets = require('./api/missing-pets');
const mypets = require('./api/my-pets');
const register = require('./api/register');
const registerpet = require('./api/register-pet');
const userprofile = require('./api/user-profile');
const userprofilepic = require('./api/user-profile-pic');

module.exports = {
    forgotpw,
    forgotverify,
    jwttokenrefresh,
    login,
    logout,
    lostpetprofile,
    lostpets,
    missingpets,
    mypets,
    register,
    registerpet,
    userprofile,
    userprofilepic
};
