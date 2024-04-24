const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const JwtModel = require('../../data/models/jwt.model');
const { generateJwtToken, verifyJwtToken } = require('../../utils/jwt.functions');
const { getUtcDateTime } = require('../../../shared/utils/date.functions');

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
                const { refreshToken, userId } = req.body;

                if (!refreshToken) {
                    res.status(401).json({ data: [], error: 'INVALID_REFRESH_TOKEN', 'number': 1 });
                    return;
                }

                const jwtToken = verifyJwtToken(refreshToken);

                if (!jwtToken) {
                    res.status(403).json({ data: [], error: 'INVALID_REFRESH_TOKEN', 'number': 2 });
                    return;
                }

                const jwtModel = new JwtModel();
                const token = jwtModel.getRefreshToken(jwtToken.userId);

                if (token !== refreshToken) {
                    res.status(403).json({ data: [], error: 'INVALID_REFRESH_TOKEN', 'number': 3 });
                    jwtModel.closeConnection();
                    return;
                }

                const email = await jwtModel.getUserEmailById(userId);

                if (!email) {
                    res.status(403).json({ data: [], error: 'INVALID_REFRESH_TOKEN', 'number': 4 });
                    jwtModel.closeConnection();
                    return;
                }

                const session = {
                    id: userId,
                    email: email,
                    create_ts: getUtcDateTime(),
                };

                const accessToken = generateJwtToken(session, '1h');
                const newRefreshToken = generateJwtToken(session, '30d');

                await jwtModel.createRefreshToken(userId, refreshToken);
                jwtModel.updateRefreshToken(jwtToken.userId, newRefreshToken);
                jwtModel.closeConnection();

                res.status(200).json({ data: { userId, accessToken, refreshToken: newRefreshToken }, error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'JWT_REFRESH_FAILED' });
            }
        },
    });
};
