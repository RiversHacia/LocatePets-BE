CREATE TABLE `swipies` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `lafId` BIGINT NOT NULL,
  `userId` BIGINT NOT NULL,
  `swipeDate` DATETIME NULL,
  `isMatch` TINYINT NOT NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `lost_and_found` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `petId` BIGINT NOT NULL,
  `isActive` TINYINT NOT NULL,
  `isDeleted` TINYINT NOT NULL,
  `isFound` TINYINT NOT NULL,
  `createdDate` DATETIME NULL,
  `deletedDate` DATETIME NULL,
  `foundDate` DATETIME NULL,
  `updatedDate` DATETIME NULL,
  `location` VARCHAR(256) NULL,
  `locationDescription` VARCHAR(1000) NULL,
  `radius` INT NOT NULL,
  PRIMARY KEY (`id`));
