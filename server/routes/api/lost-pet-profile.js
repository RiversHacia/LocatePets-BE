const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const LostPetsModel = require('../../data/models/lost-pets.model');

module.exports = function lostPetProfileHandler(req, res) {
    restful(req, res, {
        async get() {
            try {
                const { lafId } = req.query;

                if (!lafId) {
                    res.status(400).json({ data: [], error: 'LOST_PET_PROFILE_ID_EMPTY' });
                    return;
                }

                const pets = new LostPetsModel();
                const petDetails = await pets.getLostPetInfoAndImagesByProfileByLafId(lafId);

                pets.closeConnection();
                res.status(200).json({ data: petDetails, error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'GET_LOST_PET_PROFILE_FAILED' });
            }
        },
        async put() {
            invalidUseLogger('registerPetHandler', 'PUT', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async delete() {
            invalidUseLogger('registerPetHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async post() {
            invalidUseLogger('registerPetHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
    });
};
