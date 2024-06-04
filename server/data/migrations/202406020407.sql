ALTER TABLE `messages`
ADD COLUMN `msgId` CHAR(36) NULL AFTER `metadata`;

ALTER TABLE `messages`
DROP INDEX `idx_msgChainId` ,
DROP INDEX `idx_recipientUserId` ;

ALTER TABLE `message_replies`
DROP INDEX `idx_replyMessageId` ,
DROP INDEX `idx_originalMessageId` ;

ALTER TABLE `messages`
DROP COLUMN `isRead`,
DROP COLUMN `isDeleted`,
ADD COLUMN `isReadSender` TINYINT NULL AFTER `msgId`,
ADD COLUMN `isReadRecipient` TINYINT NULL AFTER `isReadSender`,
ADD COLUMN `isDeletedSender` TINYINT NULL AFTER `isReadRecipient`,
ADD COLUMN `isDeletedRecipient` TINYINT NULL AFTER `isDeletedSender`,
ADD COLUMN `dateReadSender` DATETIME NULL AFTER `isDeletedRecipient`,
ADD COLUMN `dateReadRecipient` DATETIME NULL AFTER `dateReadSender`,
ADD COLUMN `dateDeletedSender` DATETIME NULL AFTER `dateReadRecipient`,
ADD COLUMN `dateDeletedRecipient` DATETIME NULL AFTER `dateDeletedSender`;
