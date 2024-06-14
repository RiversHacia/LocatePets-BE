const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const PetsModel = require('../../data/models/pets.model');
const LostPetsModel = require('../../data/models/lost-pets.model');

module.exports = function myPetsHandler(req, res) {
    restful(req, res, {
        async get() {
            try {
                const { ownerId } = req.query;
                if (!ownerId) {
                    res.status(400).json({ data: [], error: 'OWNER_ID_EMPTY' });
                    return;
                }

                const pets = new PetsModel();
                const result = await pets.getPetsByOwnerId(ownerId);
                if(result.length === 0){
                    res.status(200).json({ data: [], error: 'NO_PETS_FOUND' });
                    return;
                }
                const petIds = await result.map((pet) => pet.petId);

                const petDetails = await pets.getMultiplePetsInfoAndImagesByPetIds(petIds);

                pets.closeConnection();
                res.status(200).json({ data: petDetails, error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'GET_PETS_FAILED' });
            }
        },
        put() {
            invalidUseLogger('myPetsHandler', 'PUT', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async delete() {

            try {
                const { ownerId, petId } = req.params;
                if (!ownerId || !petId) {
                    res.status(400).json({ data: [], error: 'OWNER_ID_OR_PET_ID_EMPTY' });
                    return;
                }

                const pets = new PetsModel();

                if(!await pets.isPetsOwner(ownerId, petId)){
                    res.status(403).json({ data: [], error: 'UNAUTHORIZED' });
                    return;
                }

                const lostPets = new LostPetsModel();
                if(await lostPets.isPetActiveInLostAndFound(petId)){
                    await lostPets.deleteLostPetEntry(petId);
                }

                const result = await pets.deletePet(petId);

                pets.closeConnection();
                lostPets.closeConnection();

                if (result) {
                    res.status(200).json({ data: [], error: '' });
                    return;
                }

                res.status(500).json({ data: [], error: 'DELETE_PET_FAILED' });

            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'DELETE_PET_FAILED' });
            }


        },
        post() {
            // code here for get request
            logger.info('myPetsHandler', 'POST', null);
        },
    });
};
