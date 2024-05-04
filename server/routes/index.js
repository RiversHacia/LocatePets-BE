const login = require('./api/login');
const logout = require('./api/logout');
const register = require('./api/register');
const forgotpw = require('./api/forgot-pw-pt1');
const forgotverify = require('./api/forgot-pw-pt2');
const jwttokenrefresh = require('./api/jwt-token-refresh');
const registerpet = require('./api/register-pet');
const mypets = require('./api/my-pets');
const lostpets = require('./api/lost-pets');
const missingpets = require('./api/missing-pets');
const lostpetprofile = require('./api/lost-pet-profile');

module.exports = {
    login,
    logout,
    register,
    forgotpw,
    forgotverify,
    jwttokenrefresh,
    mypets,
    registerpet,
    lostpets,
    missingpets,
    lostpetprofile,
};
