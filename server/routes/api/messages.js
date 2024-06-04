const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const messagesModel = require('../../data/models/messages.model');
const {isStrNumbersOnly, isUUID} = require('../../../shared/utils/string.functions');

module.exports = function messageHandler(req, res) {
    restful(req, res, {
        async get() {
            try {
                const { x: userId, t: mailboxType, s: sort } = req.query;
                if (!userId) {
                    res.status(400).json({ data: [], error: 'USER_ID_EMPTY' });
                    return;
                }

                const messages = new messagesModel();
                const result = await messages.getMessagesByUserId(userId, mailboxType, sort);
                if (result.length === 0) {
                    res.status(200).json({ data: [], error: 'NO_MESSAGES_FOUND' });
                    return;
                }

                messages.closeConnection();
                res.status(200).json({ data: result, error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'GET_MESSAGES_FAILED' });
            }
        },
        async put() {
            invalidUseLogger('exampleHandler', 'PUT', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async delete() {
            try {
                const { userId, messageId } = req.params;

                if (!userId || !messageId) {
                    res.status(400).json({ data: [], error: 'MISSING_REQUIRED_FIELDS' });
                    return;
                }

                if (!isStrNumbersOnly(userId) || !isUUID(messageId)) {
                    res.status(400).json({ data: [], error: 'INVALID_REQUIRED_FIELDS' });
                    return;
                }

                const messages = new messagesModel();
                const result = await messages.deleteMessageByUserId(userId, messageId);
                if (!result) {
                    res.status(500).json({ data: [], error: 'DELETE_MESSAGE_FAILED' });
                    return;
                }

                messages.closeConnection();
                res.status(204).send();
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'DELETE_MESSAGE_FAILED' });
            }

        },
        async post() {
            try {
                const {
                    x: userId,
                    y: recipientUserId,
                    s: subject,
                    m: message,
                    metadata,
                    chain: chainId,
                } = req.body;
                if (!userId || !recipientUserId || !message) {
                    res.status(400).json({ data: [], error: 'MISSING_REQUIRED_FIELDS' });
                    return;
                }

                const messages = new messagesModel();
                const result = await messages.createMessageEntry(userId, recipientUserId, subject, message, chainId, metadata);

                messages.closeConnection();
                if (!result) {
                    res.status(500).json({ data: [], error: 'ADD_MESSAGE_FAILED' });
                    return;
                }

                res.status(200).json({ data: [], error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'ADD_MESSAGE_FAILED' });
            }
        }
    });
};
