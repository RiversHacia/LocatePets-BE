const validator = require('email-validator');
const xssFilters = require('xss-filters');
const Login = require('../../data/models/login.model');
const Users = require('../../data/models/users.model');
const JwtModel = require('../../data/models/jwt.model');
const { verifyPassword } = require('../../utils/password.functions');
const { getUtcDateTime } = require('../../../shared/utils/date.functions');
const { logger, invalidUseLogger } = require('../../logger');
const dotenv = require('dotenv');
const restful = require('../../helpers/restful');
const { generateJwtToken } = require('../../utils/jwt.functions');

dotenv.config();
/**
 * TODO: Add Failed Login Attempts check, lock account after 5 failed attempts
 * TODO: Add Unknow User check, block IP after 5 failed attempts
 */

module.exports = function loginHandler(req, res) {
  restful(req, res, {
    async post() {
      if(!validateInputs(req, res)) { return; }

      try {
        const login = new Login();
        const { email, password } = req.body;
        const safeEmail = xssFilters.inHTMLData(email);
        const safePassword = xssFilters.inHTMLData(password);

        const user = new Users();
        if(!await user.getUserExistsByEmail(safeEmail)) {
          res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED', code: 1 });
          return;
        }

        const userId = await user.getUserIdByEmail(safeEmail);
        const creds = await login.getPassDetailsForComparison(safeEmail);

        if (creds.length === 0) {
          res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED', code: 2 });
          login.closeConnection();
          user.closeConnection();
          return;
        }

        if(!await verifyPassword(safePassword, creds[0].salt, creds[0].pass)) {
          res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED', code: 3 });
          login.closeConnection();
          user.closeConnection();
          return;
        }

        const session = {
          id: userId,
          email: email,
          create_ts: getUtcDateTime(),
        };

        const accessToken = generateJwtToken(session, '1h');
        const refreshToken = generateJwtToken(session, '30d');

        const jwtModel = new JwtModel();
        await jwtModel.createRefreshToken(userId, refreshToken);

        login.closeConnection();
        user.closeConnection();
        jwtModel.closeConnection();
        res.status(200).json({ data: { userId, accessToken, refreshToken }, error: '' });

      } catch (err) {
        logger.error(err);
        res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED', code: 4 });
      }
    },
    get() {
      invalidUseLogger('loginHandler', 'PUT', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    put() {
      invalidUseLogger('loginHandler', 'PUT', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    delete() {
      invalidUseLogger('loginHandler', 'DELETE', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
  });
};

const validateInputs = (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400).json({ data: [], error: 'EMAIL_EMPTY' });
    return false;
  }

  if (!validator.validate(email)) {
    res.status(400).json({ data: [], error: 'EMAIL_INVALID' });
    return false;
  }

  if (!password) {
    res.status(400).json({ data: [], error: 'PASSWORD_EMPTY' });
    return false;
  }

  return true;
}

//
