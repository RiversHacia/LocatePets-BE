const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');
const Users = require('../../data/models/users.model');
const {deleteUploadedFiles} = require('../../utils/upload.functions');

module.exports = function userProfilePicHandler(req, res) {
    restful(req, res, {
        async get() {
            invalidUseLogger('userProfilePicHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async put() {
            invalidUseLogger('userProfilePicHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async delete() {
            invalidUseLogger('userProfilePicHandler', 'DELETE', req);
            res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
        },
        async post() {
            try {
                const { userId } = req.body;
                const uploadedFiles = [req.file.filename];

                if(!uploadedFiles || uploadedFiles.length === 0){
                    deleteUploadedFiles(uploadedFiles);
                    res.status(400).json({ data: [], error: 'PROFILE_PIC_UPDATE_FAILED_NO_FILES' });
                    return;
                }

                if (!userId || /^\d+$/.test(userId) === false) {
                    deleteUploadedFiles(uploadedFiles);
                    res.status(400).json({ data: [], error: 'PROFILE_PIC_UPDATE_FAILED_USERID' });
                    return;
                }

                const user = new Users();
                const result = await user.updateUserProfilePic(userId, uploadedFiles[0]);

                if (!result) {
                    deleteUploadedFiles(uploadedFiles);
                    user.closeConnection();
                    res.status(500).json({ data: [], error: 'PROFILE_PIC_UPDATE_FAILED' });
                    return;
                }

                const updatedInfo = await user.getUserInformationById(userId);

                user.closeConnection();
                res.status(200).json({ data: updatedInfo, error: '' });
            } catch (err) {
                logger.error(err);
                res.status(500).json({ data: [], error: 'PROFILE_PIC_UPDATE_FAILED_ERROR' });
            }
        }
    });
};
