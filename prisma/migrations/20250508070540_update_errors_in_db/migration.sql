/*
  Warnings:

  - You are about to drop the column `productId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the `_ProductImage` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `receiverId` on table `ChatMessage` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `variantId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ChatMessage` DROP FOREIGN KEY `ChatMessage_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItem` DROP FOREIGN KEY `OrderItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `_ProductImage` DROP FOREIGN KEY `_ProductImage_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ProductImage` DROP FOREIGN KEY `_ProductImage_B_fkey`;

-- DropIndex
DROP INDEX `ChatMessage_receiverId_fkey` ON `ChatMessage`;

-- DropIndex
DROP INDEX `OrderItem_orderId_fkey` ON `OrderItem`;

-- DropIndex
DROP INDEX `OrderItem_productId_fkey` ON `OrderItem`;

-- AlterTable
ALTER TABLE `ChatMessage` MODIFY `receiverId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `OrderItem` DROP COLUMN `productId`,
    ADD COLUMN `variantId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ProductImage` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;

-- DropTable
DROP TABLE `_ProductImage`;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
