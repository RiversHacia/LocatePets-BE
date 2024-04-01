const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const JwtModel = require('../../data/models/jwt.model');
const verifyJwtToken = require('../../utils/jwt.functions').verifyJwtToken;

module.exports = function jwtTokenRefreshHandler(req, res) {
  restful(req, res, {
    async get() {
      invalidUseLogger('jwtTokenRefreshHandler', 'GET', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    async put() {
      invalidUseLogger('jwtTokenRefreshHandler', 'PUT', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    async delete() {
      invalidUseLogger('jwtTokenRefreshHandler', 'DELETE', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    async post() {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(401).json({ data: [], error: 'INVALID_REFRESH_TOKEN' });
                return;
            }

            const jwtToken = verifyJwtToken(refreshToken);

            if (!jwtToken) {
                res.status(403).json({ data: [], error: 'INVALID_REFRESH_TOKEN' });
                return;
            }

            const jwtModel = new JwtModel();
            const token = jwtModel.getRefreshToken(jwtToken.userId);

            if (token !== refreshToken) {
                res.status(403).json({ data: [], error: 'INVALID_REFRESH_TOKEN' });
                return;
            }

            const newToken = jwtModel.generateJwtToken({ userId: jwtToken.userId });

            jwtModel.updateRefreshToken(jwtToken.userId, newToken);

            res.status(200).json({ data: [newToken], error: '' });
        } catch (err) {
            logger.error(err);
            res.status(500).json({ data: [], error: 'JWT_REFRESH_FAILED' });
        }
    },
  });
};
