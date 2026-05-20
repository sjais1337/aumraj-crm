/*
  Warnings:

  - You are about to drop the column `customerName` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `emailId` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNo` on the `customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `customer` DROP COLUMN `customerName`,
    DROP COLUMN `description`,
    DROP COLUMN `emailId`,
    DROP COLUMN `linkedin`,
    DROP COLUMN `phoneNo`,
    ADD COLUMN `L2AMCDueDate` DATE NULL,
    ADD COLUMN `L2SwitchModel` VARCHAR(191) NULL,
    ADD COLUMN `L3AMCDueDate` DATE NULL,
    ADD COLUMN `L3SwitchModel` VARCHAR(191) NULL,
    ADD COLUMN `VCAMCDueDate` DATE NULL,
    ADD COLUMN `VCOEM` VARCHAR(191) NULL,
    ADD COLUMN `antiVirusOem` VARCHAR(191) NULL,
    ADD COLUMN `epbxAMCDute` DATE NULL,
    ADD COLUMN `epbxModel` VARCHAR(191) NULL,
    ADD COLUMN `firewallAMCDueDate` DATE NULL,
    ADD COLUMN `firewallModelNo` VARCHAR(191) NULL,
    ADD COLUMN `numberOfBranch` INTEGER NULL,
    ADD COLUMN `renewalDueDate` DATE NULL,
    ADD COLUMN `state` VARCHAR(191) NULL,
    ADD COLUMN `totalITUsers` INTEGER NULL,
    ADD COLUMN `wifiAMCDueDate` DATE NULL,
    ADD COLUMN `wifiModel` VARCHAR(191) NULL;
