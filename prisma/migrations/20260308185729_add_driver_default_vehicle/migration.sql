-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "defaultVehicleId" TEXT;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_defaultVehicleId_fkey" FOREIGN KEY ("defaultVehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
