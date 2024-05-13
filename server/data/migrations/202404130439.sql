ALTER TABLE `user_information`
DROP COLUMN `last_name`,
CHANGE COLUMN `first_name` `name` VARCHAR(255) NOT NULL ;

ALTER TABLE `user_information`
CHANGE COLUMN `dob` `dob` DATE NULL ;

CREATE TABLE `pets` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `isActive` INT NULL,
  `lastUpdated` DATETIME NULL,
  `createdDate` DATETIME NULL,
  `slugs` VARCHAR(500) NULL,
  `colors` VARCHAR(500) NULL,
  `desc` VARCHAR(2500) NULL,
  `name` VARCHAR(150) NULL,
  `isDeleted` INT NULL,
  `deleteDate` DATETIME NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `pets_ownership` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `petOwnerId` BIGINT NOT NULL,
  `petId` BIGINT NOT NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `pet_images` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `petId` BIGINT NOT NULL,
  `isDeleted` INT NOT NULL,
  `uploadDate` DATETIME NOT NULL,
  `deletedDate` DATETIME NULL,
  `imgFileName` VARCHAR(300) NOT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `pet_images`
ADD COLUMN `isPrimary` INT NOT NULL AFTER `imgFileName`;

ALTER TABLE `pets`
ADD COLUMN `petBreed` VARCHAR(100) NULL AFTER `deleteDate`,
ADD COLUMN `petType` VARCHAR(45) NULL AFTER `petBreed`,
CHANGE COLUMN `isActive` `isActive` INT NOT NULL ,
CHANGE COLUMN `lastUpdated` `lastUpdated` DATETIME NULL ,
CHANGE COLUMN `colors` `colors` VARCHAR(500) NOT NULL ;


ALTER TABLE `pets`
CHANGE COLUMN `colors` `colors` VARCHAR(500) NULL ,
CHANGE COLUMN `desc` `details` VARCHAR(500) NULL DEFAULT NULL ,
CHANGE COLUMN `isDeleted` `isDeleted` INT NOT NULL ;

ALTER TABLE `pet_images`
CHANGE COLUMN `isDeleted` `isDeleted` INT NOT NULL DEFAULT 0 ;
