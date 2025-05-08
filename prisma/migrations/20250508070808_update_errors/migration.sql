-- DropForeignKey
ALTER TABLE `ChatMessage` DROP FOREIGN KEY `ChatMessage_receiverId_fkey`;

-- DropIndex
DROP INDEX `ChatMessage_receiverId_fkey` ON `ChatMessage`;

-- AlterTable
ALTER TABLE `ChatMessage` MODIFY `receiverId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
