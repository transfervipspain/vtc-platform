-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "nationalId" TEXT,
    "drivingLicenseNumber" TEXT,
    "licensePoints" INTEGER,
    "hireDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "defaultVehicleId" TEXT,
    "commissionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "fixedSalaryMonthly" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commissionMode" TEXT NOT NULL DEFAULT 'weekly',
    "commissionThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commissionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "energyType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyOperation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "operationDate" TIMESTAMP(3) NOT NULL,
    "weekdayLabel" TEXT,
    "shiftType" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPlatformIncome" (
    "id" TEXT NOT NULL,
    "dailyOperationId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "tipsAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cashAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyPlatformIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPrivateIncomeSummary" (
    "id" TEXT NOT NULL,
    "dailyOperationId" TEXT NOT NULL,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "tipsAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cashAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyPrivateIncomeSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleEnergyLog" (
    "id" TEXT NOT NULL,
    "dailyOperationId" TEXT NOT NULL,
    "energyType" TEXT NOT NULL,
    "fuelCost" DOUBLE PRECISION,
    "fuelLiters" DOUBLE PRECISION,
    "electricCost" DOUBLE PRECISION,
    "electricKwh" DOUBLE PRECISION,
    "kilometers" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleEnergyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateTrip" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "driverId" TEXT,
    "vehicleId" TEXT,
    "weekLabel" TEXT,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "serviceTime" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "sourcePlatform" TEXT,
    "isLuxucar" BOOLEAN NOT NULL DEFAULT false,
    "isCash" BOOLEAN NOT NULL DEFAULT false,
    "isCard" BOOLEAN NOT NULL DEFAULT false,
    "origin" TEXT,
    "stops" TEXT,
    "destination" TEXT,
    "intermediary" TEXT,
    "communicator" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyExpense" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "concept" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'fixed',
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_companyId_code_key" ON "Platform"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "DailyOperation_companyId_driverId_vehicleId_operationDate_key" ON "DailyOperation"("companyId", "driverId", "vehicleId", "operationDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlatformIncome_dailyOperationId_platformId_key" ON "DailyPlatformIncome"("dailyOperationId", "platformId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPrivateIncomeSummary_dailyOperationId_key" ON "DailyPrivateIncomeSummary"("dailyOperationId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleEnergyLog_dailyOperationId_key" ON "VehicleEnergyLog"("dailyOperationId");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_defaultVehicleId_fkey" FOREIGN KEY ("defaultVehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Platform" ADD CONSTRAINT "Platform_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyOperation" ADD CONSTRAINT "DailyOperation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyOperation" ADD CONSTRAINT "DailyOperation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyOperation" ADD CONSTRAINT "DailyOperation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlatformIncome" ADD CONSTRAINT "DailyPlatformIncome_dailyOperationId_fkey" FOREIGN KEY ("dailyOperationId") REFERENCES "DailyOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlatformIncome" ADD CONSTRAINT "DailyPlatformIncome_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPrivateIncomeSummary" ADD CONSTRAINT "DailyPrivateIncomeSummary_dailyOperationId_fkey" FOREIGN KEY ("dailyOperationId") REFERENCES "DailyOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleEnergyLog" ADD CONSTRAINT "VehicleEnergyLog_dailyOperationId_fkey" FOREIGN KEY ("dailyOperationId") REFERENCES "DailyOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateTrip" ADD CONSTRAINT "PrivateTrip_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateTrip" ADD CONSTRAINT "PrivateTrip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateTrip" ADD CONSTRAINT "PrivateTrip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyExpense" ADD CONSTRAINT "CompanyExpense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyExpense" ADD CONSTRAINT "CompanyExpense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
