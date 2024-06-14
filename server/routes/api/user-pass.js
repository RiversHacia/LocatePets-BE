const zxcvbn = require("zxcvbn");
const dotenv = require("dotenv");
const restful = require("../../helpers/restful");
const {
  hashPassword,
  verifyPassword,
  validatePasswordRequirements
} = require("../../utils/password.functions");
const Creds = require("../../data/models/creds.model");
const Users = require("../../data/models/users.model");
const { logger, invalidUseLogger } = require("../../logger");

dotenv.config();

const isNumeric = (str) => /^[0-9]+$/.test(str);

const isPasswordValid = (res, password) => {
  if (password.length > 50) {
    res.status(400).json({ data: [], error: "PASSWORD_TOO_LONG" });
    return false;
  }

  if (password.length < 8) {
    res.status(400).json({ data: [], error: "PASSWORD_TOO_SHORT" });
    return false;
  }

  if (!validatePasswordRequirements(password)) {
    res.status(400).json({ data: [], error: "PASSWORD_INVALID" });
    return false;
  }

  const { score } = zxcvbn(password);
  if (score < 2) {
    const scoreVerb = ["Risky", "Weak", "Medium", "Tough", "Strongest"];
    res
      .status(400)
      .json({ data: [], error: `PASSWORD_${scoreVerb[score].toUpperCase()}` });
    return false;
  }

  return true;
};

const validateInputs = (req, res) => {
  const { userId, currentPassword, newPassword, confirmPassword } = req.body;

  if (!userId || !isNumeric(userId)) {
    res.status(400).json({ data: [], error: "USER_INFO_MISSING" });
    return false;
  }

  if (!currentPassword) {
    res.status(400).json({ data: [], error: "CURRENT_PASSWORD_EMPTY" });
    return false;
  }

  if (!newPassword) {
    res.status(400).json({ data: [], error: "NEW_PASSWORD_EMPTY" });
    return false;
  }

  if (!isPasswordValid(res, newPassword)) {
    return false;
  }

  if (!confirmPassword) {
    res.status(400).json({ data: [], error: "CONFIRM_NEW_PASSWORD_EMPTY" });
    return false;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ data: [], error: "PASSWORD_MISMATCH" });
    return false;
  }

  return true;
};

module.exports = function userPassHandler(req, res) {
  restful(req, res, {
    async get() {
      invalidUseLogger("userPassHandler", "GET", req);
      res.status(405).json({ data: [], error: "METHOD_NOT_SUPPORTED" });
    },
    async post() {
      if (!validateInputs(req, res)) {
        return;
      }

      const { userId, currentPassword, newPassword } = req.body;

      const users = new Users();
      const creds = new Creds();

      try {
        const user = await users.isUserById(userId);

        if (!user) {
          res.status(404).json({ data: [], error: "USER_NOT_FOUND" });
          return;
        }

        const cred = await creds.getUserCredentialsById(userId);

        if (verifyPassword(currentPassword, cred.salt, cred.pass) === false) {
          res.status(401).json({ data: [], error: "PASSWORD_MISMATCH" });
          return;
        }

        let hashedPassword;
        try {
          hashedPassword = await hashPassword(newPassword);
        } catch (err) {
          logger.error(err);
          res.status(422).json({ data: [], error: "UPDATE_NEW_PASSWORD_FAILED" });
          return;
        }

        await creds.updateUserCredentialsById({
          pass: hashedPassword[1],
          salt: hashedPassword[0],
          id: userId,
        });

        res.status(200).json({ data: [], error: null });
      } catch (err) {
        logger.error(err);
        res.status(500).json({ data: [], error: "UPDATE_NEW_PASSWORD_FAILED" });
      } finally {
        creds.closeConnection();
        users.closeConnection();
      }
    },
    put() {
      invalidUseLogger("userPassHandler", "PUT", req);
      res.status(405).json({ data: [], error: "METHOD_NOT_SUPPORTED" });
    },
    delete() {
      invalidUseLogger("userPassHandler", "DELETE", req);
      res.status(405).json({ data: [], error: "METHOD_NOT_SUPPORTED" });
    },
  });
};
