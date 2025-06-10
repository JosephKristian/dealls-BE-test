/*
  Warnings:

  - Added the required column `overtimePay` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPay` to the `Payroll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payroll" ADD COLUMN     "overtimePay" INTEGER NOT NULL,
ADD COLUMN     "totalPay" INTEGER NOT NULL;
