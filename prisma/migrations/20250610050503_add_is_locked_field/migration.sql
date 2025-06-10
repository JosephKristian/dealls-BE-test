-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Overtime" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Reimbursement" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;
