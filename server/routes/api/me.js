const Messages = require('../../data/models/messages.model');
const Users = require('../../data/models/users.model');
const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');

module.exports = function meHandler(req, res) {
    restful(req, res, {
        async get() {
            try {
                const { userId } = req.params; // Extract userId from req.params
                const isMsgCount = req.path.endsWith('/msg-count'); // Check if the URL ends with /msg-count

                if (!userId) {
                    res.status(400).json({ data: [], error: 'USER_ID_EMPTY' });
                    return;
                }

                const user = new Users();
                const msgs = new Messages();

                if (isMsgCount) {
                    // Only return message counts
                    const counts = await msgs.getCounts(userId);
                    msgs.closeConnection();
                    res.status(200).json({ data: counts, error: '' });
                } else {
                    // Return user details and message counts
                    const userDetails = await user.getUserInformationById(userId);
                    const counts = await msgs.getCounts(userId);

                    if (!userDetails) {
                        user.closeConnection();
                        msgs.closeConnection();
                        res.status(200).json({ data: [], error: 'NO_USER_FOUND' });
                        return;
                    }

                    user.closeConnection();
                    msgs.closeConnection();
                    res.status(200).json({ data: {...userDetails, ...counts }, error: '' });
                }
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'GET_PROFILE_FAILED' });
            }
        },
        async put() {
            invalidUseLogger('meHandler', 'PUT', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async delete() {
            invalidUseLogger('meHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async post() {
            invalidUseLogger('meHandler', 'POST', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
    });
}
