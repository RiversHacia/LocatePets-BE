const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const fs = require('fs');
const path = require('path');

module.exports = function petTypesHandler(req, res) {
    restful(req, res, {
        async get() {
            try {
                const jsonPath = path.resolve(__dirname, '../json/breeds.json');
                const petTypes = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                res.status(200).json({ data: petTypes, error: null });

            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'INTERNAL_SERVER_ERROR' });
            }
        },
        async put() {
            invalidUseLogger('petTypesHandler', 'PUT', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async delete() {
            invalidUseLogger('petTypesHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async post() {
            invalidUseLogger('petTypesHandler', 'POST', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
    });
}
