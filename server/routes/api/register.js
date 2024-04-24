const validator = require('email-validator');
const bcrypt = require('bcryptjs');
const xssFilters = require('xss-filters');
const zxcvbn = require('zxcvbn');
const dotenv = require('dotenv');
const restful = require('../../helpers/restful');
const { getUtcDateTime } = require('../../../shared/utils/date.functions');
const { hashPassword } = require('../../utils/password.functions');
const Creds = require('../../data/models/creds.model');
const Users = require('../../data/models/users.model');
const Login = require('../../data/models/login.model');
const { logger, invalidUseLogger } = require('../../logger');

dotenv.config();

module.exports = function registrationHandler(req, res) {
    restful(req, res, {
        /*
        *
        * GET: /api/register
        * when registering, check if email exists
        *
        */
        async get() {
            // check if email exists
            const { email } = req.query;
            if (!email) {
                res.status(400).json({ data: [], error: 'EMAIL_EMPTY' });
                return;
            }

            if (!validator.validate(email)) {
                res.status(400).json({ data: [], error: 'EMAIL_INVALID' });
                return;
            }

            // user exists, get existing password to compare, create session
            const u = new Users();
            const safeEmail = xssFilters.inHTMLData(email);
            await u.getUserExistsByEmail(safeEmail).then((exists) => {
                if (exists) {
                    res.status(200).json({ data: true, error: '' });
                } else {
                    res.status(401).json({ data: false, error: 'USER_NOT_FOUND' });
                }
            }).catch((err) => {
                // error getting email
                logger.error(err);
                res.status(400).json({ data: [], error: 'INVALID_EMAIL' });
            });
            u.closeConnection();
        },

        /*
        *
        * POST: /api/register
        * creates the new user account login and sends verification email
        *
        */

        async post() {
            // register a new user
            if (!validateInputs(req, res)) { return; }

            const { email, password, name } = req.body;
            const safeEmail = xssFilters.inHTMLData(email);


            // user exists, get existing password to compare, create session
            try {
                const user = new Users();
                if (await user.getUserExistsByEmail(safeEmail)) {
                    user.closeConnection();
                    res.status(422).json({ data: [], error: 'USER_FOUND' });
                    return;
                }

                const hashedPassword = await hashPassword(password).catch((err) => {
                    logger.error(err);
                    user.closeConnection();
                    res.status(422).json({ data: [], error: 'CREATE_LOGIN_FAILED_HASH' });
                    return;
                });

                const login = new Login();
                await login.createLogin({
                    create_ts: getUtcDateTime(),
                    email: safeEmail,
                    pass: hashedPassword[1],
                    salt: hashedPassword[0],
                }).catch((err) => {
                    logger.error(err);
                    res.status(422).json({ data: [], error: 'CREATE_LOGIN_FAILED_CREATION' });
                    user.closeConnection();
                    login.closeConnection();
                    return;
                });

                const userId = await user.getUserIdByEmail(safeEmail).catch((err) => {
                    logger.error(err);
                    user.closeConnection();
                    login.closeConnection();
                    res.status(422).json({ data: [], error: 'CREATE_LOGIN_FAILED_GET_USER' });
                    return;
                });

                const timestamp = getUtcDateTime();
                const vType = 'reg';
                const hashy = bcrypt.hashSync(`${userId}${timestamp}${vType}${process.env.SERVER_SECRET_KEY}`, 10);

                const creds = new Creds();
                await creds.createUserVerification({
                    user_id: userId,
                    issuedAt: timestamp,
                    hashy,
                    vType,
                })
                    .then((verification) => {
                        // TODO: send email

                        login.closeConnection();
                        creds.closeConnection();
                        res.status(200).json({ data: verification, error: '' });
                        return;
                    })
                    .catch((err) => {
                        logger.error(err);
                        user.closeConnection();
                        login.closeConnection();
                        creds.closeConnection();
                        res.status(422).json({ data: [], error: 'CREATE_VERIFICATION_FAILED' });
                        return;
                    });


                await user.createUserInformation({
                    id: userId,
                    name: name,
                    profile_img: '',
                    dob: null
                }).catch((err) => {
                    user.closeConnection();
                    login.closeConnection();
                    creds.closeConnection();
                    logger.error(err);
                });

                user.closeConnection();
                login.closeConnection();
                creds.closeConnection();
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'CREATE_INFORMATION_FAILED' });
                return;
            }
        },
        put() {
            invalidUseLogger('registrationHandler', 'PUT', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        delete() {
            invalidUseLogger('registrationHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
    });
};

const validateInputs = (req, res) => {
    const { email, password, name } = req.body;
    if (!email) {
        res.status(400).json({ data: [], error: 'EMAIL_EMPTY' });
        return false;
    }

    if (!name) {
        res.status(400).json({ data: [], error: 'NAME_EMPTY' });
        return false;
    } else {
        if (name.length > 50) {
            res.status(400).json({ data: [], error: 'NAME_TOO_LONG' });
            return false;
        }
        if (name.length < 2) {
            res.status(400).json({ data: [], error: 'NAME_TOO_SHORT' });
            return false;
        }
        if (!/^[a-zA-Z]+$/.test(name)) {
            res.status(400).json({ data: [], error: 'NAME_INVALID' });
            return false;
        }
    }

    if (!validator.validate(email)) {
        res.status(400).json({ data: [], error: 'EMAIL_INVALID' });
        return false;
    }

    if (!password) {
        res.status(400).json({ data: [], error: 'PASSWORD_EMPTY' });
        return false;
    } else {
        if (password.length > 50) {
            res.status(400).json({ data: [], error: 'PASSWORD_TOO_LONG' });
            return false;
        }
        if (password.length < 8) {
            res.status(400).json({ data: [], error: 'PASSWORD_TOO_SHORT' });
            return false;
        }

        /**
         * Password Requirements:
         * At least one uppercase letter.
         * At least one lowercase letter.
         * At least one special character that is safe for the web.
         * A minimum length of 12 characters.
         * No character should repeat more than three times consecutively.
         */
        // eslint-disable-next-line no-useless-escape
        if (!/^(?!.*(.)\1{3})(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*()_+{}\[\]:;"'<>,.?\/~`|-]).{12,}$/.test(password)) {
            res.status(400).json({ data: [], error: 'PASSWORD_INVALID' });
            return false;
        }
    }

    const { score } = zxcvbn(password);
    const scoreVerb = ['Risky', 'Weak', 'Medium', 'Tough', 'Strongest'];
    if (score < 2) {
        res.status(400).json({ data: [], error: `PASSWORD_${scoreVerb[score].toUpperCase()}` });
        return false;
    }

    return true;
}