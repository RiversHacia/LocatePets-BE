const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const messagesModel = require('../../data/models/messages.model');

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
            if(result.length === 0){
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
      invalidUseLogger('exampleHandler', 'DELETE', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    async post() {
        try {
            const {
                x: userId,
                y: recipientUserId,
                s: subject,
                m: message,
                metadata,
                chain
            } = req.body;
            if (!userId || !recipientUserId || !message) {
                res.status(400).json({ data: [], error: 'MISSING_REQUIRED_FIELDS' });
                return;
            }

            const messages = new messagesModel();
            // createMessageEntry(senderUserId = 0, recipientUserId = 0, subject= '', message = '', msgUUID = '', metadata = {})
            const result = await messages.createMessageEntry(userId, recipientUserId, subject, message, chain, metadata);
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
    },
  });
};
