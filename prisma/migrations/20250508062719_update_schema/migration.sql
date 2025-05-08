/*
  Warnings:

  - You are about to alter the column `type` on the `ChatMessage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to alter the column `status` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Image` DROP FOREIGN KEY `Image_productId_fkey`;

-- AlterTable
ALTER TABLE `ChatMessage` MODIFY `type` ENUM('TEXT', 'IMAGE', 'VIDEO') NOT NULL DEFAULT 'TEXT';

-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `Review` MODIFY `rating` INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE `Image`;
