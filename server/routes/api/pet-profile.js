const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const PetsModel = require('../../data/models/pets.model');
const LostPetsModel = require('../../data/models/lost-pets.model');

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
                const lostPets = new LostPetsModel();
                const petDetails = await pets.getPetProfileImageAndPetInfoByPetId(petId);
                const petOwnerId = await pets.getPetsOwnerIdByPetId(petId);
                const isActivelyLost = await lostPets.isPetActiveInLostAndFound(petId);

                pets.closeConnection();
                lostPets.closeConnection();
                res.status(200).json({ data: {...petDetails, petOwnerId, isActivelyLost}, error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'GET_PET_PROFILE_FAILED' });
            }
        },
        async put() {
            invalidUseLogger('lostPetProfileHandler', 'PUT', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async delete() {
            invalidUseLogger('lostPetProfileHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async post() {
            invalidUseLogger('lostPetProfileHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
    });
};
