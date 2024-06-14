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
                const petId = await pets.getLostPetIdByLafId(lafId);
                const petOwnerId = await pets.getLostPetOwnerIdByLafId(lafId);
                const isActivelyLost = await pets.isPetActiveInLostAndFound(petId);

                pets.closeConnection();
                res.status(200).json({ data: {...petDetails, petOwnerId, isActivelyLost}, error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'GET_LOST_PET_PROFILE_FAILED' });
            }
        },
        async put() {
            invalidUseLogger('lostPetProfileHandler', 'PUT', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async delete() {
            try {
                const { lafId, userId } = req.params;

                if (!lafId || !userId) {
                    res.status(400).json({ data: [], error: 'LOST_PET_PROFILE_ID_OR_USER_ID_EMPTY' });
                    return;
                }

                if (isNaN(lafId)) {
                    res.status(400).json({ data: [], error: 'LOST_PET_PROFILE_ID_INVALID' });
                    return;
                }

                const pets = new LostPetsModel();
                const isPetActive = await pets.isPetActiveInLostAndFound(lafId);
                const petOwnerId = await pets.getLostPetOwnerIdByLafId(lafId, userId);

                if (!isPetActive) {
                    res.status(403).json({ data: [], error: 'LOST_PET_NOT_ACTIVE' });
                    return;
                }

                if (!petOwnerId || petOwnerId !== userId) {
                    res.status(403).json({ data: [], error: 'UNAUTHORIZED' });
                    return;
                }

                const result = await pets.deleteLostPetEntry(lafId);
                pets.closeConnection();
                if (!result) {
                    res.status(500).json({ data: [], error: 'DELETE_LOST_PET_FAILED' });
                    return;
                }

                res.status(204).send();
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'DELETE_LOST_PET_FAILED' });
            }

        },
        async post() {
            invalidUseLogger('lostPetProfileHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
    });
};
