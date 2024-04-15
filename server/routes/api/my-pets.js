const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const PetsModel = require('../../data/models/pets.model');

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
        delete() {
            invalidUseLogger('myPetsHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        post() {
            // code here for get request
            logger.info('myPetsHandler', 'POST', null);
        },
    });
};
