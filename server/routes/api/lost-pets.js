const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const LostPetsModel = require('../../data/models/lost-pets.model');
const PetsModel = require('../../data/models/pets.model');
const {deleteUploadedFiles} = require('../../utils/upload.functions');

module.exports = function registerPetHandler(req, res) {
    restful(req, res, {
        async get() {
            try {
                const { ownerId } = req.query;
                if (!ownerId) {
                    res.status(400).json({ data: [], error: 'OWNER_ID_EMPTY' });
                    return;
                }

                const lostPets = new LostPetsModel();
                const result = await lostPets.getLostPetsByOwnerId(ownerId);
                if(result.length === 0){
                    res.status(200).json({ data: [], error: 'NO_PETS_FOUND' });
                    return;
                }
                const petIds = await result.map((pet) => pet.petId);

                const pets = new PetsModel();
                const petDetails = await lostPets.getMultipleLostPetsInfoAndImagesByPetIds(petIds);

                pets.closeConnection();
                res.status(200).json({ data: petDetails, error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'GET_PETS_FAILED' });
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
            logger.log(req)
            try {
                const uploadedFiles = [req.file.filename];

                const lostPets = new LostPetsModel();
                const result = await lostPets.createLostPetEntry(req.body);

                if (!result) {
                    logger.log('result', result);
                    deleteUploadedFiles(uploadedFiles);
                    pets.closeConnection();
                    lostPets.closeConnection();
                    res.status(500).json({ data: [], error: 'REGISTER_PET_FAILED' });
                    throw new Error('REGISTER_PET_FAILED');
                }

                const pets = new PetsModel();
                pets.setPetProfileImage(result.petId, uploadedFiles[0]);
                pets.closeConnection();
                lostPets.closeConnection();
                res.status(200).json({ data: result, error: '' });
                logger.log('done');
            } catch (err) {
                logger.error(err);
                deleteUploadedFiles([req.file.filename]);
                res.status(500).json({ data: [], error: 'REGISTER_PET_FAILED' });
            }
        },
    });
};
