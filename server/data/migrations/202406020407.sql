ALTER TABLE `messages`
ADD COLUMN `msgId` CHAR(36) NULL AFTER `metadata`;

ALTER TABLE `doggyfinder`.`messages`
DROP INDEX `idx_msgChainId` ,
DROP INDEX `idx_recipientUserId` ;


ALTER TABLE `doggyfinder`.`message_replies`
DROP INDEX `idx_replyMessageId` ,
DROP INDEX `idx_originalMessageId` ;
;

