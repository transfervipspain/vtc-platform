import { prisma } from "@/lib/prisma";

type MonthBucket = {
  key: string;
  label: string;
  start: Date;
  end: Date;
};

type ProfitLossLine = {
  label: string;
  values: number[];
};

type VehicleProfitLoss = {
  vehicleId: string;
  plateNumber: string;
  brand: string;
  model: string;
  income: number[];
  energy: number[];
  directExpenses: number[];
  allocatedExpenses: number[];
  totalExpenses: number[];
  result: number[];
};

export type ProfitLossReport = {
  months: string[];
  total: {
    incomeLines: ProfitLossLine[];
    totalIncome: number[];
    expenseLines: ProfitLossLine[];
    totalExpenses: number[];
    result: number[];
    marginPct: number[];
  };
  vehicles: VehicleProfitLoss[];
};

const REPORT_EXPENSE_ORDER = [
  "Nominas",
  "comisiones",
  "Seg Social",
  "Gasolina",
  "Gestoría",
  "Seguros",
  "Taller",
  "Cuota autónomos",
  "Cuota Coche",
  "Gastos Bancarios",
  "Lavados",
  "Peajes",
  "garage",
  "Varios",
  "linea movil",
] as const;

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function monthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("es-ES", {
    month: "short",
    year: "2-digit",
  });
}

function buildMonthBuckets(from: Date, to: Date): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  let cursor = startOfMonth(from);

  while (cursor <= to) {
    buckets.push({
      key: monthKey(cursor),
      label: monthLabel(cursor),
      start: startOfMonth(cursor),
      end: endOfMonth(cursor),
    });

    cursor = addMonths(cursor, 1);
  }

  return buckets;
}

function makeZeroArray(length: number) {
  return Array.from({ length }, () => 0);
}

function normalizeExpenseCategory(category: string) {
  const trimmed = category.trim();

  if (REPORT_EXPENSE_ORDER.includes(trimmed as (typeof REPORT_EXPENSE_ORDER)[number])) {
    return trimmed;
  }

  return trimmed || "Varios";
}

export async function getProfitLossReport(
  companyId: string,
  year?: number
): Promise<ProfitLossReport> {
  const selectedYear = year ?? new Date().getFullYear();
  const from = new Date(selectedYear, 0, 1);
  const to = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

  const [operations, privateTrips, expenses] = await Promise.all([
    prisma.dailyOperation.findMany({
      where: {
        companyId,
        operationDate: {
          gte: from,
          lte: to,
        },
      },
      include: {
        vehicle: true,
        platformIncomes: {
          include: {
            platform: true,
          },
        },
        privateIncomeSummary: true,
        vehicleEnergyLog: true,
      },
      orderBy: {
        operationDate: "asc",
      },
    }),

    prisma.privateTrip.findMany({
      where: {
        companyId,
        status: "completed",
        serviceDate: {
          gte: from,
          lte: to,
        },
      },
      include: {
        vehicle: true,
      },
      orderBy: {
        serviceDate: "asc",
      },
    }),

    prisma.companyExpense.findMany({
      where: {
        companyId,
        expenseDate: {
          gte: from,
          lte: to,
        },
      },
      include: {
        vehicle: true,
      },
      orderBy: {
        expenseDate: "asc",
      },
    }),
  ]);

  const monthBuckets = buildMonthBuckets(from, to);
  const monthIndexByKey = new Map(monthBuckets.map((m, i) => [m.key, i]));
  const monthLabels = monthBuckets.map((m) => m.label);

  const bolt = makeZeroArray(monthBuckets.length);
  const uber = makeZeroArray(monthBuckets.length);
  const cabify = makeZeroArray(monthBuckets.length);
  const privados = makeZeroArray(monthBuckets.length);

  const directEnergy = makeZeroArray(monthBuckets.length);

  const expenseMap: Record<string, number[]> = {};

  for (const category of REPORT_EXPENSE_ORDER) {
    expenseMap[category] = makeZeroArray(monthBuckets.length);
  }

  const vehiclesMap = new Map<
    string,
    {
      vehicleId: string;
      plateNumber: string;
      brand: string;
      model: string;
      income: number[];
      energy: number[];
      directExpenses: number[];
      allocatedExpenses: number[];
    }
  >();

  function ensureVehicle(params: {
    vehicleId: string;
    plateNumber: string;
    brand: string;
    model: string;
  }) {
    const existing = vehiclesMap.get(params.vehicleId);
    if (existing) return existing;

    const created = {
      vehicleId: params.vehicleId,
      plateNumber: params.plateNumber,
      brand: params.brand,
      model: params.model,
      income: makeZeroArray(monthBuckets.length),
      energy: makeZeroArray(monthBuckets.length),
      directExpenses: makeZeroArray(monthBuckets.length),
      allocatedExpenses: makeZeroArray(monthBuckets.length),
    };

    vehiclesMap.set(params.vehicleId, created);
    return created;
  }

  for (const op of operations) {
    const key = monthKey(new Date(op.operationDate));
    const monthIdx = monthIndexByKey.get(key);
    if (monthIdx === undefined) continue;

    for (const income of op.platformIncomes) {
      const platformName = income.platform.name.trim().toLowerCase();

      if (platformName === "bolt") {
        bolt[monthIdx] += income.grossAmount;
      } else if (platformName === "uber") {
        uber[monthIdx] += income.grossAmount;
      } else if (platformName === "cabify") {
        cabify[monthIdx] += income.grossAmount;
      }
    }

    privados[monthIdx] += op.privateIncomeSummary?.grossAmount ?? 0;

    const energy =
      op.vehicleEnergyLog?.electricCost ??
      op.vehicleEnergyLog?.fuelCost ??
      0;

    directEnergy[monthIdx] += energy;

    const vehicle = ensureVehicle({
      vehicleId: op.vehicle.id,
      plateNumber: op.vehicle.plateNumber,
      brand: op.vehicle.brand,
      model: op.vehicle.model,
    });

    const opIncome =
      op.platformIncomes.reduce((sum, i) => sum + i.grossAmount, 0) +
      (op.privateIncomeSummary?.grossAmount ?? 0);

    vehicle.income[monthIdx] += opIncome;
    vehicle.energy[monthIdx] += energy;
  }

  for (const trip of privateTrips) {
    const key = monthKey(new Date(trip.serviceDate));
    const monthIdx = monthIndexByKey.get(key);
    if (monthIdx === undefined) continue;

    privados[monthIdx] += trip.amount;

    if (trip.vehicle) {
      const vehicle = ensureVehicle({
        vehicleId: trip.vehicle.id,
        plateNumber: trip.vehicle.plateNumber,
        brand: trip.vehicle.brand,
        model: trip.vehicle.model,
      });

      vehicle.income[monthIdx] += trip.amount;
    }
  }

  for (const expense of expenses) {
    const key = monthKey(new Date(expense.expenseDate));
    const monthIdx = monthIndexByKey.get(key);
    if (monthIdx === undefined) continue;

    const category = normalizeExpenseCategory(expense.category);

    if (!expenseMap[category]) {
      expenseMap[category] = makeZeroArray(monthBuckets.length);
    }

    expenseMap[category][monthIdx] += expense.amount;

    if (expense.vehicleId && expense.vehicle) {
      const vehicle = ensureVehicle({
        vehicleId: expense.vehicle.id,
        plateNumber: expense.vehicle.plateNumber,
        brand: expense.vehicle.brand,
        model: expense.vehicle.model,
      });

      vehicle.directExpenses[monthIdx] += expense.amount;
    }
  }

  expenseMap["Gasolina"] = expenseMap["Gasolina"] || makeZeroArray(monthBuckets.length);
  for (let i = 0; i < monthBuckets.length; i += 1) {
    expenseMap["Gasolina"][i] += directEnergy[i];
  }

  const totalIncome = makeZeroArray(monthBuckets.length);
  for (let i = 0; i < monthBuckets.length; i += 1) {
    totalIncome[i] = bolt[i] + uber[i] + cabify[i] + privados[i];
  }

  const expenseLinesOrder = [
    ...REPORT_EXPENSE_ORDER,
    ...Object.keys(expenseMap).filter(
      (c) => !REPORT_EXPENSE_ORDER.includes(c as (typeof REPORT_EXPENSE_ORDER)[number])
    ),
  ];

  const totalExpenses = makeZeroArray(monthBuckets.length);
  for (const category of expenseLinesOrder) {
    const values = expenseMap[category] || makeZeroArray(monthBuckets.length);
    for (let i = 0; i < monthBuckets.length; i += 1) {
      totalExpenses[i] += values[i];
    }
  }

  const result = makeZeroArray(monthBuckets.length);
  const marginPct = makeZeroArray(monthBuckets.length);
  for (let i = 0; i < monthBuckets.length; i += 1) {
    result[i] = totalIncome[i] - totalExpenses[i];
    marginPct[i] = totalIncome[i] > 0 ? (result[i] / totalIncome[i]) * 100 : 0;
  }

  const vehicles = Array.from(vehiclesMap.values()).sort((a, b) =>
    a.plateNumber.localeCompare(b.plateNumber, "es")
  );

  for (let i = 0; i < monthBuckets.length; i += 1) {
    const activeVehiclesThisMonth = vehicles.filter(
      (v) => v.income[i] !== 0 || v.energy[i] !== 0 || v.directExpenses[i] !== 0
    );

    const totalDirectVehicleExpensesThisMonth = vehicles.reduce(
      (sum, vehicle) => sum + vehicle.directExpenses[i],
      0
    );

    const sharedExpensesThisMonth =
      totalExpenses[i] - directEnergy[i] - totalDirectVehicleExpensesThisMonth;

    const allocation =
      activeVehiclesThisMonth.length > 0
        ? sharedExpensesThisMonth / activeVehiclesThisMonth.length
        : 0;

    for (const vehicle of activeVehiclesThisMonth) {
      vehicle.allocatedExpenses[i] = allocation;
    }
  }

  const vehicleReports: VehicleProfitLoss[] = vehicles.map((vehicle) => {
    const totalVehicleExpenses = vehicle.energy.map(
      (energyValue, idx) =>
        energyValue + vehicle.directExpenses[idx] + vehicle.allocatedExpenses[idx]
    );

    const vehicleResult = vehicle.income.map(
      (incomeValue, idx) => incomeValue - totalVehicleExpenses[idx]
    );

    return {
      vehicleId: vehicle.vehicleId,
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand,
      model: vehicle.model,
      income: vehicle.income,
      energy: vehicle.energy,
      directExpenses: vehicle.directExpenses,
      allocatedExpenses: vehicle.allocatedExpenses,
      totalExpenses: totalVehicleExpenses,
      result: vehicleResult,
    };
  });

  return {
    months: monthLabels,
    total: {
      incomeLines: [
        { label: "Bolt", values: bolt },
        { label: "Uber", values: uber },
        { label: "Cabify", values: cabify },
        { label: "Privados", values: privados },
      ],
      totalIncome,
      expenseLines: expenseLinesOrder.map((category) => ({
        label: category,
        values: expenseMap[category] || makeZeroArray(monthBuckets.length),
      })),
      totalExpenses,
      result,
      marginPct,
    },
    vehicles: vehicleReports,
  };
}