const forgotpw = require('./api/forgot-pw-pt1');
const forgotverify = require('./api/forgot-pw-pt2');
const jwttokenrefresh = require('./api/jwt-token-refresh');
const login = require('./api/login');
const logout = require('./api/logout');
const lostpetprofile = require('./api/lost-pet-profile');
const lostpets = require('./api/lost-pets');
const me = require('./api/me');
const message = require('./api/message');
const messages = require('./api/messages');
const missingpets = require('./api/missing-pets');
const mypets = require('./api/my-pets');
const petprofile = require('./api/pet-profile');
const register = require('./api/register');
const registerpet = require('./api/register-pet');
const userpass = require('./api/user-pass');
const userprofile = require('./api/user-profile');
const userprofilepic = require('./api/user-profile-pic');
const pettypes = require('./api/pet-types');

module.exports = {
    forgotpw,
    forgotverify,
    jwttokenrefresh,
    login,
    logout,
    lostpetprofile,
    lostpets,
    me,
    message,
    messages,
    missingpets,
    mypets,
    petprofile,
    pettypes,
    register,
    registerpet,
    userpass,
    userprofile,
    userprofilepic
};
