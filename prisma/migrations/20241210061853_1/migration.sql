-- CreateTable
CREATE TABLE `tasks` (
    `id` VARCHAR(191) NOT NULL,
    `staffsId` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `markTime` DATE NULL,
    `remark` TEXT NOT NULL,
    `taskChecked` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staffs` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `emailId` VARCHAR(191) NOT NULL,
    `phoneNo` VARCHAR(191) NOT NULL,
    `joinDate` DATE NOT NULL,
    `leaveDate` DATE NULL,
    `birthDate` DATE NOT NULL,
    `anniversaryDate` DATE NULL,
    `hash` VARCHAR(191) NOT NULL,
    `salary` DOUBLE NOT NULL,
    `panNo` VARCHAR(191) NOT NULL,
    `aadharNo` VARCHAR(191) NULL,
    `department` VARCHAR(191) NOT NULL,
    `post` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `permissionId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NULL,
    `conveyanceCost` INTEGER NULL DEFAULT 6,

    UNIQUE INDEX `staffs_permissionId_key`(`permissionId`),
    UNIQUE INDEX `staffs_groupId_key`(`groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `oem` JSON NOT NULL,
    `slaSupportType` JSON NOT NULL,
    `slaType` JSON NOT NULL,
    `supportType` JSON NOT NULL,
    `opportunity` JSON NOT NULL,
    `funnelType` JSON NOT NULL,
    `funnelStatus` JSON NOT NULL,
    `supportStatus` JSON NOT NULL,
    `target` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `billingdata` (
    `billingId` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `amount` INTEGER NOT NULL,

    PRIMARY KEY (`billingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity` (
    `activityId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `location` VARCHAR(191) NULL,
    `activity` TEXT NOT NULL,
    `email` VARCHAR(191) NULL,
    `phoneNo` VARCHAR(191) NULL,
    `companyId` VARCHAR(191) NULL,
    `personId` VARCHAR(191) NULL,
    `fromLocation` VARCHAR(191) NULL,
    `toLocation` VARCHAR(191) NULL,
    `distance` DOUBLE NULL,
    `parkingCost` INTEGER NULL,
    `staffsId` VARCHAR(191) NOT NULL,
    `score` INTEGER NULL,
    `checked` BOOLEAN NOT NULL DEFAULT false,
    `notification` VARCHAR(191) NULL,
    `notificationChecked` BOOLEAN NULL DEFAULT false,
    `checkedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`activityId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `funnel` (
    `funnelId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `companyId` VARCHAR(191) NOT NULL,
    `personId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `opportunity` VARCHAR(191) NOT NULL,
    `oem` VARCHAR(191) NOT NULL,
    `topLine` DOUBLE NOT NULL,
    `bottomLine` DOUBLE NOT NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `closureDate` DATE NOT NULL,
    `staffsId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`funnelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `head` VARCHAR(191) NOT NULL,
    `headId` VARCHAR(191) NOT NULL,
    `members` JSON NOT NULL,
    `scores` BOOLEAN NOT NULL,
    `funnel` BOOLEAN NOT NULL,
    `support` BOOLEAN NOT NULL,
    `reports` BOOLEAN NOT NULL,
    `hierarchy` BOOLEAN NOT NULL,
    `sla` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salaryslip` (
    `slipId` VARCHAR(191) NOT NULL,
    `month` DATE NOT NULL,
    `salary` DOUBLE NOT NULL,
    `leavesTaken` DOUBLE NOT NULL,
    `leavesAvailable` DOUBLE NOT NULL,
    `carryLeaves` DOUBLE NOT NULL,
    `compoffTaken` DOUBLE NOT NULL,
    `compoffBalance` DOUBLE NOT NULL,
    `compoffAdded` DOUBLE NOT NULL,
    `tds` DOUBLE NOT NULL,
    `ec` DOUBLE NOT NULL,
    `loan` DOUBLE NOT NULL,
    `others` DOUBLE NOT NULL,
    `paidDays` DOUBLE NOT NULL,
    `staffsId` VARCHAR(191) NOT NULL,
    `post` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,

    PRIMARY KEY (`slipId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support` (
    `supportId` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `personId` VARCHAR(191) NOT NULL,
    `oem` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `addDate` DATE NOT NULL,
    `closeDate` DATE NOT NULL,
    `staffsId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`supportId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sla` (
    `slaId` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `personId` VARCHAR(191) NOT NULL,
    `oem` VARCHAR(191) NOT NULL,
    `productDescription` TEXT NOT NULL,
    `sla` VARCHAR(191) NOT NULL,
    `supportType` VARCHAR(191) NOT NULL,
    `slaStartDate` DATE NOT NULL,
    `slaEndDate` DATE NOT NULL,
    `staffsId` VARCHAR(191) NOT NULL,
    `contractId` VARCHAR(191) NOT NULL,
    `pdfLocation` VARCHAR(191) NULL,
    `serialNo` TEXT NOT NULL,
    `archived` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`slaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` VARCHAR(191) NOT NULL,
    `slaReport` BOOLEAN NULL DEFAULT false,
    `slaEntry` BOOLEAN NULL DEFAULT false,
    `funnel` BOOLEAN NULL,
    `admin` BOOLEAN NULL,
    `support` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer` (
    `customerId` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `phoneNo` VARCHAR(191) NULL,
    `emailId` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`customerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `person` (
    `personId` VARCHAR(191) NOT NULL,
    `personName` VARCHAR(191) NOT NULL,
    `emailId` VARCHAR(191) NOT NULL,
    `phoneNo` VARCHAR(191) NULL,
    `companyId` VARCHAR(191) NULL,
    `entryCount` INTEGER NOT NULL,

    PRIMARY KEY (`personId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personstaff` (
    `personId` VARCHAR(191) NOT NULL,
    `staffId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`personId`, `staffId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_staffsId_fkey` FOREIGN KEY (`staffsId`) REFERENCES `staffs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staffs` ADD CONSTRAINT `staffs_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staffs` ADD CONSTRAINT `staffs_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity` ADD CONSTRAINT `activity_staffsId_fkey` FOREIGN KEY (`staffsId`) REFERENCES `staffs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity` ADD CONSTRAINT `activity_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `customer`(`customerId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity` ADD CONSTRAINT `activity_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `person`(`personId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `funnel` ADD CONSTRAINT `funnel_staffsId_fkey` FOREIGN KEY (`staffsId`) REFERENCES `staffs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `funnel` ADD CONSTRAINT `funnel_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `customer`(`customerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `funnel` ADD CONSTRAINT `funnel_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `person`(`personId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salaryslip` ADD CONSTRAINT `salaryslip_staffsId_fkey` FOREIGN KEY (`staffsId`) REFERENCES `staffs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support` ADD CONSTRAINT `support_staffsId_fkey` FOREIGN KEY (`staffsId`) REFERENCES `staffs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support` ADD CONSTRAINT `support_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `customer`(`customerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support` ADD CONSTRAINT `support_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `person`(`personId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sla` ADD CONSTRAINT `sla_staffsId_fkey` FOREIGN KEY (`staffsId`) REFERENCES `staffs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sla` ADD CONSTRAINT `sla_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `customer`(`customerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sla` ADD CONSTRAINT `sla_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `person`(`personId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `person` ADD CONSTRAINT `person_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `customer`(`customerId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personstaff` ADD CONSTRAINT `personstaff_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `person`(`personId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personstaff` ADD CONSTRAINT `personstaff_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `staffs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
