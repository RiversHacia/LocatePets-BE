const restful = require("../../helpers/restful");
const { logger, invalidUseLogger } = require("../../logger");
const messagesModel = require("../../data/models/messages.model");

module.exports = function messageHandler(req, res) {
  restful(req, res, {
    async put() {
      try {
        const { messageId } = req.params;
        const { x } = req.query;

        if (!x) {
          res.status(400).json({ data: [], error: "MISSING_REQUIRED_FIELDS" });
          return;
        }

        const isToggleRead = x === "read";
        if (!isToggleRead) {
          invalidUseLogger("messageHandler", "PUT", req);
          res.status(405).json({ data: [], error: "METHOD_NOT_SUPPORTED" });
          return;
        }

        if (!messageId) {
          res.status(400).json({ data: [], error: "MISSING_REQUIRED_FIELDS" });
          return;
        }

        const messages = new messagesModel();
        const result = await messages.toggleReadStatus(messageId);
        messages.closeConnection();
        if (!result) {
          res.status(500).json({ data: [], error: "TOGGLE_READ_FAILED" });
          return;
        }

        res.status(200).json({ data: [], error: "" });
      } catch (err) {
        logger.error(err);
        res.status(500).json({ data: [], error: "TOGGLE_READ_FAILED" });
      }
    },
    async get() {
      invalidUseLogger("messageHandler", "GET", req);
      res.status(405).json({ data: [], error: "METHOD_NOT_SUPPORTED" });
    },
    async delete() {
      invalidUseLogger("messageHandler", "DELETE", req);
      res.status(405).json({ data: [], error: "METHOD_NOT_SUPPORTED" });
    },
    async post() {
      invalidUseLogger("messageHandler", "POST", req);
      res.status(405).json({ data: [], error: "METHOD_NOT_SUPPORTED" });
    },
  });
};
