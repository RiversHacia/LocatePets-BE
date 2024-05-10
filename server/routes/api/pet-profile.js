const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const PetsModel = require('../../data/models/pets.model');

module.exports = function lostPetProfileHandler(req, res) {
    restful(req, res, {
        async get() {
            try {
                const { petId } = req.query;

                if (!petId) {
                    res.status(400).json({ data: [], error: 'PET_PROFILE_ID_EMPTY' });
                    return;
                }

                const pets = new PetsModel();
                const petDetails = await pets.getPetProfileImageAndPetInfoByPetId(petId);

                pets.closeConnection();
                res.status(200).json({ data: petDetails, error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'GET_PET_PROFILE_FAILED' });
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
