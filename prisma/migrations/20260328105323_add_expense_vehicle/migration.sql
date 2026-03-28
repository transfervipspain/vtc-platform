-- AlterTable
ALTER TABLE "CompanyExpense" ADD COLUMN     "vehicleId" TEXT;

-- AddForeignKey
ALTER TABLE "CompanyExpense" ADD CONSTRAINT "CompanyExpense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
