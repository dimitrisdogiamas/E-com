-- AlterTable
ALTER TABLE `ChatMessage` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `editedAt` DATETIME(3) NULL;
