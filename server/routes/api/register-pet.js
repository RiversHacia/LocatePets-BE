const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const PetsModel = require('../../data/models/pets.model');
// const {deleteUploadedFiles} = require('../../utils/upload.functions');
const {copyAndRenamePng} = require('../../utils/copyAndRename');

module.exports = function registerPetHandler(req, res) {
    restful(req, res, {
        async get() {
            invalidUseLogger('registerPetHandler', 'GET', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
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
            try {
                // const uploadedFiles = [req.file.filename];

                const pets = new PetsModel();
                const result = await pets.registerPet(req.body);

                if (!result) {
                    // deleteUploadedFiles(uploadedFiles);
                    res.status(500).json({ data: [], error: 'REGISTER_PET_FAILED' });
                    throw new Error('REGISTER_PET_FAILED');
                }

                // pets.setPetProfileImage(result.petId, uploadedFiles[0]);
                pets.setPetProfileImage(result.petId, copyAndRenamePng('../../../public/silhouette_' + req.body.petType + '.png'));
                pets.closeConnection();
                res.status(200).json({ data: result, error: '' });

            } catch (err) {
                logger.error(err);
                // deleteUploadedFiles([req.file.filename]);
                res.status(500).json({ data: [], error: 'REGISTER_PET_FAILED' });
            }
        },
    });
};
