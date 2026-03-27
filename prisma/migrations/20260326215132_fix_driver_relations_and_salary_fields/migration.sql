-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "commissionEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "commissionMode" TEXT NOT NULL DEFAULT 'weekly',
ADD COLUMN     "commissionThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fixedSalaryMonthly" DOUBLE PRECISION NOT NULL DEFAULT 0;
