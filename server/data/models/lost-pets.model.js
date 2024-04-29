const Database = require('../database');
const { logger } = require('../../logger');
const { getUtcDateTime } = require('../../../shared/utils/date.functions');

module.exports = class LostPetsModel {
    #db;

    #petsTable = 'pets';
    #petsImagesTable = 'pet_images';
    #ownerTable = 'pets_ownership';
    #lostPetsTable = 'lost_and_found';
    #userInfoTable = 'user_information';
    #geoTable = 'geolocation';

    constructor() {
        this.#db = new Database();
    }

    async closeConnection() {
        await this.#db.close();
    }

    getCountOfLostPets() {
        try {
            const sql = `SELECT COUNT(id) as count FROM ${this.#lostPetsTable} where isActive = 1 and isDeleted = 0 and isFound = 0`;
            return this.#db.query(sql);
        }
        catch (err) {
            logger.error(err);
            throw new Error('GET_LOST_PETS_COUNT_FAILED');
        }
    }

    getCountOfFoundPets() {
        try {
            const sql = `SELECT COUNT(id) as count FROM ${this.#lostPetsTable} where isActive = 1 and isDeleted = 0 and isFound = 1`;
            return this.#db.query(sql);
        }
        catch (err) {
            logger.error(err);
            throw new Error('GET_FOUND_PETS_COUNT_FAILED');
        }
    }

    async getCountOfActivePets() {
        try {
            const sql = `SELECT COUNT(id) as count FROM ${this.#petsTable} where isActive = 1 and isDeleted = 0`;
            return this.#db.query(sql);
        }
        catch (err) {
            logger.error(err);
            throw new Error('GET_ACTIVE_PETS_COUNT_FAILED');
        }
    }

    async getCountOfInactivePets() {
        try {
            const sql = `SELECT COUNT(id) as count FROM ${this.#petsTable} where isActive = 0 and isDeleted = 0`;
            return this.#db.query(sql);
        }
        catch (err) {
            logger.error(err);
            throw new Error('GET_INACTIVE_PETS_COUNT_FAILED');
        }
    }

    async getLostPetsWithPrimaryImage() {
        try {
            const sql = `SELECT petId FROM ${this.#lostPetsTable} where isActive = 1 and isDeleted = 0 and isFound = 0`;
            const lostPets = await this.#db.query(sql);

            if (lostPets.length === 0) {
                return [];
            }

            const petIds = await lostPets.map((pet) => pet.petId);
            const petImagesSql = `SELECT
                                    petId,
                                    imgFileName,
                                    pets.*
                                FROM ${this.#petsImagesTable} as petsImages
                                JOIN ${this.#petsTable} as pets ON petsImages.petId = pets.id
                                WHERE
                                    petsImages.isPrimary = 1
                                    AND petsImages.isDeleted = 0
                                    AND petsImages.petId IN (?)`;

            return await this.#db.query(petImagesSql, [petIds]);

        } catch (err) {
            logger.error(err);
            throw new Error('GET_LOST_PETS_FAILED');
        }
    }

    async getFoundPetsWithPrimaryImage() {
        try {
            const sql = `SELECT petId FROM ${this.#lostPetsTable} where isActive = 1 and isDeleted = 0 and isFound = 1`;
            const foundPets = await this.#db.query(sql);

            if (foundPets.length === 0) {
                return [];
            }

            const petIds = await foundPets.map((pet) => pet.petId);
            const petImagesSql = `SELECT
                                    petId,
                                    imgFileName,
                                    pets.*
                                FROM ${this.#petsImagesTable} as petsImages
                                JOIN ${this.#petsTable} as pets ON petsImages.petId = pets.id
                                WHERE
                                    petsImages.isPrimary = 1
                                    AND petsImages.isDeleted = 0
                                    AND petsImages.petId IN (?)`;

            return await this.#db.query(petImagesSql, [petIds]);

        } catch (err) {
            logger.error(err);
            throw new Error('GET_FOUND_PETS_FAILED');
        }
    }

    async getLostPetById(petId) {
        try {
            const sql = `SELECT * FROM ${this.#lostPetsTable} where petId = ? and isActive = 1 and isDeleted = 0 and isFound = 0`;
            return await this.#db.query(sql, [petId]);
        } catch (err) {
            logger.error(err);
            throw new Error('GET_LOST_PET_BY_ID_FAILED');
        }
    }

    async getPetProfileAndImages(petId) {
        try {
            const lostPetSql = `SELECT * FROM ${this.#lostPetsTable} where petId = ? and isActive = 1 and isDeleted = 0 and isFound = 0`;
            const lostPetResult = await this.#db.query(lostPetSql, [petId]);

            if (lostPetResult.length === 0) {
                return [];
            }

            const lostPetImagesSql = `SELECT petId, imgFileName, uploadDate FROM ${this.#petsImagesTable} WHERE petId = ? AND isDeleted = 0`;
            const lostPetImagesResult = await this.#db.query(lostPetImagesSql, [petId]);

            const lostPetDetailsSQL = `SELECT * FROM ${this.#petsTable} WHERE id = ? AND isDeleted = 0`;
            const lostPetDetailsResult = await this.#db.query(lostPetDetailsSQL, [petId]);

            return {
                petDetails: lostPetDetailsResult[0],
                petImages: lostPetImagesResult,
                lostPet: lostPetResult[0],
            };

        } catch (err) {
            logger.error(err);
            throw new Error('GET_PET_PROFILE_AND_IMAGE_FAILED');
        }
    }

    async getLostPetOwner(petId) {
        try {
            const sql = `
                select
                    u.id,
                    u.name,
                    u.dob,
                    u.profile_img,
                from ${this.#userInfoTable} ui
                where (ui.id = (select petOwnerId from ${this.#ownerTable} where petId = ?))
            `;
            return await this.#db.query(sql, [petId]);
        } catch (err) {
            logger.error(err);
            throw new Error('GET_LOST_PET_OWNER_FAILED');
        }
    }

    async getLostPetImages() {
        try {
            const sql = `SELECT id, petId, imgFileName FROM ${this.#petsImagesTable} WHERE isPrimary = 1 AND isDeleted = 0`;
            return await this.#db.query(sql);
        } catch (err) {
            logger.error(err);
            throw new Error('GET_LOST_PET_IMAGES_FAILED');
        }
    }

    async createLostPetEntry(petData) {
        try {
            // create pets entry, then pet primary image, then pet ownership, then lost and found entry
            const today = getUtcDateTime();
            const {
                ownerId,
                petColor,
                petDescription,
                name,
                petBreed,
                petType,
                isFound,
                location,
                locationDetails,
                radius
            } = petData;

            const ifIsFound = Number.isInteger(isFound) ? isFound : 0;

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

            const lostAndFoundQuery = `insert into ${this.#lostPetsTable} (createdDate, foundDate, updatedDate, isActive, isFound, petId, location, locationDetails, radius) values (?, ?, ?, 1, ?, ?, ?, ?, ?)`;
            const lostAndFoundValues = [today, today, today, ifIsFound, petId, location, locationDetails, radius];
            const lostAndFoundResult = await this.#db.query(lostAndFoundQuery, lostAndFoundValues);

            if (lostAndFoundResult.affectedRows === 0) {
                logger.error(this.#db.debugQuery(lostAndFoundQuery, lostAndFoundValues));
                throw new Error('PET_REGISTRATION_FAILED');
            }
            console.log('lostAndFoundResult', lostAndFoundResult);
            return { lafId: lostAndFoundResult.insertId, petId };

        } catch (err) {
            logger.error(err);
            throw new Error('CREATE_LOST_PET_ENTRY_FAILED');
        }
    }

    async updateLostPetEntry(petData) {
        try {
            const today = getUtcDateTime();
            const {
                lafId,
                petId,
                isFound,
                colors,
                details,
                name,
                petBreed,
                petType,
                location,
                locationDetails,
                radius
            } = petData;

            const petQuery = `update ${this.#petsTable} set lastUpdated = ?, colors = ?, details = ?, name = ?, petBreed = ?, petType = ? where id = ? and isActive = 1`;
            const petValues = [today, colors, details, name, petBreed, petType, petId];
            const petResult = await this.#db.query(petQuery, petValues);

            if (petResult.affectedRows === 0) {
                throw new Error('UPDATE_LOST_PET_ENTRY_FAILED');
            }

            const lostAndFoundQuery = `update ${this.#lostPetsTable} set updatedDate = ?, isFound = ?, location = ?, locationDetails = ?, radius = ? where id = ? and isActive = 1`;
            const lostAndFoundValues = [today, isFound, location, locationDetails, radius, lafId];
            const lostAndFoundResult = await this.#db.query(lostAndFoundQuery, lostAndFoundValues);

            if (lostAndFoundResult.affectedRows === 0) {
                throw new Error('UPDATE_LOST_PET_ENTRY_FAILED');
            }

            return { lafId, petId };

        } catch (err) {
            logger.error(err);
            throw new Error('UPDATE_LOST_PET_ENTRY_FAILED');
        }
    }

    async deleteLostPetEntry(lafId) {
        try {
            const today = getUtcDateTime();
            const query = `update ${this.#lostPetsTable} set isActive = 0, isDeleted = 1, updatedDate = ?, deletedDate = ? where id = ? and isActive = 1`;
            const result = await this.#db.query(query, [today, today, lafId]);

            if (result.affectedRows === 0) {
                throw new Error('DELETE_LOST_PET_ENTRY_FAILED');
            }

            return { lafId };

        } catch (err) {
            logger.error(err);
            throw new Error('DELETE_LOST_PET_ENTRY_FAILED');
        }
    }

    async getLostPetsByOwnerId(ownerId) {
        let output = [];
        try {
            const query = `
                SELECT
                    po.petId
                FROM pets_ownership as po
                JOIN lost_and_found as laf ON po.petId = laf.petId
                WHERE po.petOwnerId = ?
                    AND laf.isActive = 1
                    AND laf.isDeleted = 0
            `;

            const values = [ownerId];
            const result = await this.#db.query(query, values);

            if (result.length > 0) {
                output = result;
            }

            return output;
        } catch (err) {
            logger.error(err);
            throw new Error('NO_PETS_FOUND');
        }
    }

    async getMultipleLostPetsInfoAndImagesByPetIds(petIds) {
        try {
            const query = `SELECT
                    p.id,
                    laf.updatedDate,
                    laf.createdDate,
                    laf.foundDate,
                    laf.isFound,
                    laf.location,
                    laf.locationDetails,
                    laf.radius,
                    p.colors,
                    p.details,
                    p.name,
                    p.petBreed,
                    p.petType,
                    p.slugs,
                    i.imgFileName,
                    g.city,
                    g.state_abbr,
                    g.postal_code,
                    g.latitude,
                    g.longitude
                FROM ${this.#petsTable} p
                JOIN ${this.#petsImagesTable} i ON p.id = i.petId
                JOIN ${this.#lostPetsTable} laf ON p.id = laf.petId
                JOIN ${this.#geoTable} g ON laf.location = g.postal_code
                WHERE
                    p.isDeleted = 0
                    AND p.isActive = 1
                    AND laf.isDeleted = 0
                    AND laf.isActive = 1
                    AND p.id IN (?) AND i.isPrimary = 1 AND i.isDeleted = 0
                    ORDER BY laf.createdDate DESC`;
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
}
