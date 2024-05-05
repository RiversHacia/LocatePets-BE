const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const Users = require('../../data/models/users.model');

module.exports = function userProfileHandler(req, res) {
    restful(req, res, {
        async get() {
            try {
                const { x: userId } = req.query;

                if (!userId) {
                    res.status(400).json({ data: [], error: 'PROFILE_ID_EMPTY' });
                    return;
                }

                const user = new Users();
                const userDetails = await user.getUserInformationById(userId);

                if (!userDetails) {
                    user.closeConnection();
                    res.status(200).json({ data: [], error: 'NO_USER_FOUND' });
                    return;
                }

                user.closeConnection();
                res.status(200).json({ data: userDetails, error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'GET_PROFILE_FAILED' });
            }
        },
        async put() {
            invalidUseLogger('userProfileHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async delete() {
            invalidUseLogger('userProfileHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async post() {
            try {
                const { userId, name, dob, postalCode } = req.body;

                if (!userId || !name || !postalCode || !dob) {
                    res.status(400).json({ data: [], error: 'PROFILE_UPDATE_FAILED' });
                    return;
                }

                const user = new Users();
                const result = await user.updateUserInformation(req.body);

                if (result.affectedRows === 0) {
                    user.closeConnection();
                    res.status(500).json({ data: [], error: 'PROFILE_UPDATE_FAILED' });
                    return;
                }

                const userDetails = await user.getUserInformationById(userId);

                user.closeConnection();
                res.status(200).json({ data: userDetails, error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'PROFILE_UPDATE_FAILED' });
            }
        },
    });
};
