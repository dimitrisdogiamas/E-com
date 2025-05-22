/*
  Warnings:

  - Added the required column `shippingAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingFullName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingPhone` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` ADD COLUMN `shippingAddress` VARCHAR(191) NOT NULL,
    ADD COLUMN `shippingFullName` VARCHAR(191) NOT NULL,
    ADD COLUMN `shippingPhone` VARCHAR(191) NOT NULL;
