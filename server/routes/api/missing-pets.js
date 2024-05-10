const restful = require('../../helpers/restful');
const { invalidUseLogger, logger } = require('../../logger');
const LostPetsModel = require('../../data/models/lost-pets.model');
const geoLocationModel = require('../../data/models/geolocation.model');

module.exports = function missingPetsHandler(req, res) {
    restful(req, res, {
        async get() {

            try {
                const {
                    x: userId = 0,
                    o: offset = 0,
                    l: limit = 10,
                    ob: orderBy = 'createdDate',
                    d: AscOrDesc = 'DESC',
                    loc: postalCode = 95125,
                    r: radius = 10
                } = req.query;

                const lostPets = new LostPetsModel();
                const geoLocation = new geoLocationModel();
                const postalCodes = await geoLocation.getPostalCodesWithinRadiusOfPostCode(postalCode, radius);

                if (postalCodes.length === 0) {
                    res.status(200).json({ data: [], error: 'NO_GEOLOCATION_MATCHES' });
                    return;
                }

                const postalCodesArray = postalCodes.map((postalCode) => postalCode.postal_code);
                const lostPetsResult = await lostPets.getLostPetsInfoAndImagesByPostalCode(postalCodesArray, offset, limit, orderBy, AscOrDesc);
                geoLocation.closeConnection();
                lostPets.closeConnection();

                if (lostPetsResult.length === 0) {
                    res.status(200).json({ data: [], error: 'NO_LOST_PETS_FOUND' });
                    return;
                }

                res.status(200).json({ data: lostPetsResult, error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'NO_LOST_PETS_FOUND' });
            }

        },
        async put() {
            invalidUseLogger('missingPetsHandler', 'PUT', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async delete() {
            invalidUseLogger('missingPetsHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async post() {
            invalidUseLogger('missingPetsHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
    });
};
