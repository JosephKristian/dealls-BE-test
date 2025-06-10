/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Payroll` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `Payroll` table. All the data in the column will be lost.
  - You are about to drop the column `overtimePay` on the `Payroll` table. All the data in the column will be lost.
  - You are about to drop the column `reimbursementTotal` on the `Payroll` table. All the data in the column will be lost.
  - You are about to drop the column `totalPay` on the `Payroll` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Payroll` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Payroll` table. All the data in the column will be lost.
  - You are about to alter the column `baseSalary` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - Added the required column `proratedSalary` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `takeHomePay` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalOvertime` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalReimbursement` to the `Payroll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payroll" DROP COLUMN "deletedAt",
DROP COLUMN "deletedBy",
DROP COLUMN "overtimePay",
DROP COLUMN "reimbursementTotal",
DROP COLUMN "totalPay",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy",
ADD COLUMN     "proratedSalary" INTEGER NOT NULL,
ADD COLUMN     "takeHomePay" INTEGER NOT NULL,
ADD COLUMN     "totalOvertime" INTEGER NOT NULL,
ADD COLUMN     "totalReimbursement" INTEGER NOT NULL,
ALTER COLUMN "baseSalary" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "salary" INTEGER;
