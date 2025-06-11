/*
  Warnings:

  - You are about to drop the column `periodEnd` on the `Payroll` table. All the data in the column will be lost.
  - You are about to drop the column `periodStart` on the `Payroll` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,payrollPeriodId]` on the table `Payroll` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payrollPeriodId` to the `Payroll` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Payroll_userId_periodStart_periodEnd_key";

-- AlterTable
ALTER TABLE "Payroll" DROP COLUMN "periodEnd",
DROP COLUMN "periodStart",
ADD COLUMN     "payrollPeriodId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PayrollPeriod" (
    "id" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayrollPeriod_periodStart_periodEnd_key" ON "PayrollPeriod"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_userId_payrollPeriodId_key" ON "Payroll"("userId", "payrollPeriodId");

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
