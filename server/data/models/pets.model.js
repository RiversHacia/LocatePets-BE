const Database = require('../database');
const {logger} = require('../../logger');
const { getUtcDateTime } = require('../../../shared/utils/date.functions');

module.exports = class PetsModel {
    #db;

    #petsTable = 'pets';
    #petsImagesTable = 'pet_images';
    #ownerTable = 'pets_ownership';

    constructor() {
        this.#db = new Database();
    }

   async registerPet(pet) {
        try {
            const { ownerId, petType, petBreed, name, petDescription, petColor } = pet;
            const today = getUtcDateTime();

            const query = `insert into ${this.#petsTable}
                            (isActive, lastUpdated, createdDate, colors, details, name, isDeleted, petBreed, petType)
                        values
                            (${ownerId}, '${today}', '${today}', '${petColor}', '${petDescription}', '${name}', 0, '${petBreed}', '${petType}')`;

            const result = await this.#db.query(query);

            if (result.affectedRows === 0) {
                throw new Error('PET_REGISTRATION_FAILED');
            }

            const petId = result.insertId;
            const ownerQuery = `insert into ${this.#ownerTable} (petOwnerId, petId) values (?, ?)`;
            const ownerValues = [ownerId, petId];
            const ownerResult = await this.#db.query(ownerQuery, ownerValues);

            if (ownerResult.affectedRows === 0) {
                throw new Error('PET_REGISTRATION_FAILED');
            }

            return { petId };
        } catch (err) {
            logger.error(err);
            throw new Error('PET_REGISTRATION_FAILED');
        }
    }

    async getPetsByOwnerId(ownerId) {
        try {
            const query = `SELECT petId FROM ${this.#ownerTable} WHERE petOwnerId = ?`;
            const values = [ownerId];
            const result = await this.#db.query(query, values);

            if (result.length === 0) {
                return [];
            }

            return result;
        } catch (err) {
            logger.error(err);
            throw new Error('NO_PETS_FOUND');
        }
    }

    async getPetInfoById(petId) {
        try {
            const query = `SELECT * FROM ${this.#petsTable} WHERE id = ?`;
            const values = [petId];
            const result = await this.#db.query(query, values);

            if (result.length === 0) {
                throw new Error('NO_PET_FOUND');
            }

            return result[0];
        } catch (err) {
            logger.error(err);
            throw new Error('NO_PET_FOUND');
        }
    }

    async getMultiplePetsInfoAndImagesByPetIds(petIds) {
        try {
            const query = `SELECT
                    p.id,
                    p.lastUpdated,
                    p.createdDate,
                    p.colors,
                    p.details,
                    p.name,
                    p.petBreed,
                    p.petType,
                    p.slugs,
                    i.imgFileName,
                    i.uploadDate
                FROM ${this.#petsTable} p
                JOIN ${this.#petsImagesTable} i ON p.id = i.petId
                WHERE
                    p.isDeleted = 0
                    AND p.isActive = 1
                    AND p.id IN (?) AND i.isPrimary = 1 AND i.isDeleted = 0
                    ORDER BY p.createdDate DESC`;
            const values = [petIds];
            const result = await this.#db.query(query, values);

            if (result.length === 0) {
                throw new Error('NO_PETS_FOUND');
            }

            return result;
        } catch (err) {
            logger.error(err);
            throw new Error('NO_PETS_FOUND');
        }
    }

    async updatePetInfo(pet) {
        try {
            const { id, isActive, lastUpdated, slugs, colors, details, name, isDeleted, deletedDate, petBreed, petType } = pet;
            const query = `UPDATE ${this.#petsTable} SET isActive = ?, lastUpdated = ?, slugs = ?, colors = ?, details = ?, name = ?, isDeleted = ?, deletedDate = ?, petBreed = ?, petType = ? WHERE id = ?`;
            const values = [isActive, lastUpdated, slugs, colors, details, name, isDeleted, deletedDate, petBreed, petType, id];
            const result = await this.#db.query(query, values);

            if (result.affectedRows === 0) {
                throw new Error('PET_UPDATE_FAILED');
            }

            return { id };
        } catch (err) {
            logger.error(err);
            throw new Error('PET_UPDATE_FAILED');
        }
    }

    async deletePet(petId) {
        try {
            const query = `DELETE FROM ${this.#petsTable} WHERE id = ?`;
            const values = [petId];
            const result = await this.#db.query(query, values);

            if (result.affectedRows === 0) {
                throw new Error('PET_DELETE_FAILED');
            }

            const ownerQuery = `DELETE FROM ${this.#ownerTable} WHERE petId = ?`;
            const ownerValues = [petId];
            const ownerResult = await this.#db.query(ownerQuery, ownerValues);

            if (ownerResult.affectedRows === 0) {
                throw new Error('PET_DELETE_FAILED');
            }

            return { petId };
        } catch (err) {
            logger.error(err);
            throw new Error('PET_DELETE_FAILED');
        }
    }

    async getPetOwner(petId) {
        try {
            const query = `SELECT * FROM ${this.#ownerTable} WHERE petId = ?`;
            const values = [petId];
            const result = await this.#db.query(query, values);

            if (result.length === 0) {
                throw new Error('NO_OWNER_FOUND');
            }

            return result[0];
        } catch (err) {
            logger.error(err);
            throw new Error('NO_OWNER_FOUND');
        }
    }

    async setPetProfileImage(petId, image) {
        try {
            const today = getUtcDateTime();

            const query = `INSERT INTO ${this.#petsImagesTable} (petId, uploadDate, imgFileName, isPrimary) VALUES (?, ?, ?, ?)`;
            const values = [petId, today, image, 1];
            const result = await this.#db.query(query, values);

            if (result.affectedRows === 0) {
                throw new Error('PET_IMAGE_ADD_FAILED');
            }

            return { petId };
        } catch (err) {
            logger.error(err);
            throw new Error('PET_IMAGE_ADD_FAILED');
        }
    }

    async updatePetProfileImage(petId, petImageId) {
        try {
            const today = getUtcDateTime();

            // first set all images to not primary
            const setPrimaryQuery = `UPDATE ${this.#petsImagesTable} SET isPrimary = 0 WHERE petId = ?`;
            const setPrimaryValues = [petId];
            const setPrimaryResult = await this.#db.query(setPrimaryQuery, setPrimaryValues);
            if (setPrimaryResult.affectedRows === 0) {
                throw new Error('PET_IMAGE_UPDATE_FAILED');
            }

            // then update the image
            const query = `UPDATE ${this.#petsImagesTable} SET uploadDate = ?, isPrimary = ? WHERE id = ?`;
            const values = [today, 1, petImageId];
            const result = await this.#db.query(query, values);

            if (result.affectedRows === 0) {
                throw new Error('PET_IMAGE_UPDATE_FAILED');
            }

            return true;
        } catch (err) {
            logger.error(err);
            throw new Error('PET_IMAGE_UPDATE_FAILED');
        }
    }

    async getPetProfileImage(petId) {
        try {
            const query = `SELECT petId, imgFileName, uploadDate FROM ${this.#petsImagesTable} WHERE petId = ? AND isPrimary = 1 AND isDeleted = 0`;
            const values = [petId];
            const result = await this.#db.query(query, values);

            if (result.length === 0) {
                throw new Error('NO_IMAGE_FOUND');
            }

            return result[0];
        } catch (err) {
            logger.error(err);
            throw new Error('NO_IMAGE_FOUND');
        }
    }

    async getAllPetImagesByPetId(petId) {
        try {
            const query = `SELECT petId, imgFileName, uploadDate FROM ${this.#petsImagesTable} WHERE petId = ? AND isDeleted = 0`;
            const values = [petId];
            const result = await this.#db.query(query, values);

            if (result.length === 0) {
                throw new Error('NO_IMAGES_FOUND');
            }

            return result;
        } catch (err) {
            logger.error(err);
            throw new Error('NO_IMAGES_FOUND');
        }
    }

    async getPetProfileImageAndPetInfoByPetId(petId) {
        try {
            const petQuery = `SELECT * FROM ${this.#petsTable} WHERE id = ? AND isDeleted = 0 AND isActive = 1`;
            const petValues = [petId];
            const petResult = await this.#db.query(petQuery, petValues);

            if (petResult.length === 0) {
                throw new Error('NO_PET_FOUND');
            }

            const imageQuery = `SELECT petId, imgFileName, uploadDate FROM ${this.#petsImagesTable} WHERE petId = ? AND isPrimary = 1 AND isDeleted = 0`;
            const imageValues = [petId];
            const imageResult = await this.#db.query(imageQuery, imageValues);

            if (imageResult.length === 0) {
                throw new Error('NO_IMAGE_FOUND');
            }

            return { ...petResult[0], imgFileName: imageResult[0].imgFileName };
        } catch (err) {
            logger.error(err);
            throw new Error('NO_PET_FOUND');
        }
    }

    async getAllPetsAndPrimaryImagesAndInfoByOwnerId(ownerId) {
        try {
            const query = `SELECT p.id,
                    p.isActive,
                    p.lastUpdated,
                    p.createdDate,
                    p.colors,
                    p.details,
                    p.name,
                    p.isDeleted,
                    p.deletedDate,
                    p.petBreed,
                    p.petType,
                    i.imgFileName,
                    i.uploadDate
                FROM ${this.#petsTable} p
                JOIN ${this.#petsImagesTable} i ON p.id = i.petId
                WHERE
                    p.isDeleted = 0
                    AND p.isActive = 1
                    AND p.id IN (
                        SELECT petId
                        FROM ${this.#ownerTable}
                        WHERE petOwnerId = ?) AND i.isPrimary = 1 AND i.isDeleted = 0
                    ORDER BY p.createdDate DESC`;
            const values = [ownerId];
            const result = await this.#db.query(query, values);

            if (result.length === 0) {
                throw new Error('NO_PETS_FOUND');
            }

            return result;
        } catch (err) {
            logger.error(err);
            throw new Error('NO_PETS_FOUND');
        }
    }

};
