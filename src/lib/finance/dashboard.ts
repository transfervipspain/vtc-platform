// src/lib/finance/dashboard.ts

import { prisma } from "@/lib/prisma";

type FinancialDashboardParams = {
  companyId: string;
  from: Date;
  to: Date;
};

type CommissionMode = "weekly" | "monthly";

type DriverFinancialRow = {
  driverId: string;
  driverName: string;
  fixedCost: number;
  variableCost: number;
  totalCost: number;
  generatedIncome: number;
};

export type FinancialDashboardData = {
  company: {
    id: string;
    legalName: string;
    tradeName: string | null;
  };
  range: {
    from: string;
    to: string;
  };
  income: {
    dailyPlatforms: number;
    dailyPrivateSummary: number;
    privateTripsCompleted: number;
    total: number;
  };
  costs: {
    driversFixed: number;
    driversVariable: number;
    driversTotal: number;
    energy: number;
    companyExpenses: number;
    total: number;
  };
  profit: {
    real: number;
    marginPct: number;
  };
  breakdown: {
    driverRows: DriverFinancialRow[];
  };
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function safeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function minDate(a: Date, b: Date) {
  return a < b ? a : b;
}

function maxDate(a: Date, b: Date) {
  return a > b ? a : b;
}

function datesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart <= bEnd && bStart <= aEnd;
}

function daysBetweenInclusive(start: Date, end: Date) {
  const oneDay = 1000 * 60 * 60 * 24;

  const utcStart = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const utcEnd = Date.UTC(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  );

  return Math.floor((utcEnd - utcStart) / oneDay) + 1;
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getWeekStartMonday(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const day = d.getDay(); // 0 domingo, 1 lunes...
  const diff = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + diff);
  return d;
}

function getWeekEndSunday(date: Date) {
  const start = getWeekStartMonday(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function buildWeeklyPeriods(from: Date, to: Date) {
  const periods: Array<{ start: Date; end: Date }> = [];

  let cursor = getWeekStartMonday(from);

  while (cursor <= to) {
    const periodStart = maxDate(cursor, from);
    const rawEnd = getWeekEndSunday(cursor);
    const periodEnd = minDate(rawEnd, to);

    periods.push({
      start: periodStart,
      end: periodEnd,
    });

    const next = new Date(cursor);
    next.setDate(next.getDate() + 7);
    cursor = next;
  }

  return periods;
}

function buildMonthlyPeriods(from: Date, to: Date) {
  const periods: Array<{ start: Date; end: Date }> = [];

  let cursor = getMonthStart(from);

  while (cursor <= to) {
    const monthStart = getMonthStart(cursor);
    const monthEnd = getMonthEnd(cursor);

    periods.push({
      start: maxDate(monthStart, from),
      end: minDate(monthEnd, to),
    });

    cursor = addMonths(cursor, 1);
  }

  return periods;
}

function getPeriodsByMode(from: Date, to: Date, mode: CommissionMode) {
  return mode === "monthly"
    ? buildMonthlyPeriods(from, to)
    : buildWeeklyPeriods(from, to);
}

function prorateMonthlyFixedSalaryForRange(params: {
  fixedSalaryMonthly: number;
  hireDate: Date | null;
  from: Date;
  to: Date;
}) {
  const { fixedSalaryMonthly, hireDate, from, to } = params;

  if (fixedSalaryMonthly <= 0) return 0;

  let total = 0;
  let cursor = getMonthStart(from);

  while (cursor <= to) {
    const monthStart = getMonthStart(cursor);
    const monthEnd = getMonthEnd(cursor);

    let effectiveStart = maxDate(monthStart, from);
    const effectiveEnd = minDate(monthEnd, to);

    if (hireDate) {
      effectiveStart = maxDate(effectiveStart, startOfDay(hireDate));
    }

    if (effectiveStart <= effectiveEnd) {
      const overlapDays = daysBetweenInclusive(effectiveStart, effectiveEnd);
      const totalMonthDays = daysInMonth(
        monthStart.getFullYear(),
        monthStart.getMonth()
      );

      total += (fixedSalaryMonthly / totalMonthDays) * overlapDays;
    }

    cursor = addMonths(cursor, 1);
  }

  return total;
}

function prorateExpenseForRange(params: {
  amount: number;
  frequency: string;
  expenseDate: Date;
  isActive: boolean;
  rangeStart: Date;
  rangeEnd: Date;
}) {
  const { amount, frequency, expenseDate, isActive, rangeStart, rangeEnd } = params;

  if (amount <= 0) return 0;

  const normalized = frequency.toLowerCase();

  if (normalized === "one-time" || normalized === "one_time" || normalized === "unique") {
    return expenseDate >= rangeStart && expenseDate <= rangeEnd ? amount : 0;
  }

  if (!isActive) {
    return 0;
  }

  const effectiveStart = maxDate(startOfDay(expenseDate), rangeStart);
  if (effectiveStart > rangeEnd) {
    return 0;
  }

  const coveredDays = daysBetweenInclusive(effectiveStart, rangeEnd);

  if (normalized === "weekly") {
    return (amount / 7) * coveredDays;
  }

  if (normalized === "monthly") {
    return (amount / 30) * coveredDays;
  }

  if (normalized === "yearly" || normalized === "annual") {
    return (amount / 365) * coveredDays;
  }

  return 0;
}

export async function getFinancialDashboardData({
  companyId,
  from,
  to,
}: FinancialDashboardParams): Promise<FinancialDashboardData> {
  const rangeStart = startOfDay(from);
  const rangeEnd = endOfDay(to);

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      legalName: true,
      tradeName: true,
    },
  });

  if (!company) {
    throw new Error("Empresa no encontrada");
  }

  const [drivers, dailyOperations, privateTrips, expenses] = await Promise.all([
    prisma.driver.findMany({
      where: {
        companyId,
      },
      select: {
        id: true,
        fullName: true,
        fixedSalaryMonthly: true,
        commissionPercentage: true,
        commissionMode: true,
        commissionThreshold: true,
        commissionEnabled: true,
        hireDate: true,
      },
      orderBy: {
        fullName: "asc",
      },
    }),

    prisma.dailyOperation.findMany({
      where: {
        companyId,
        operationDate: {
          gte: rangeStart,
          lte: rangeEnd,
        },
      },
      select: {
        id: true,
        driverId: true,
        operationDate: true,
        platformIncomes: {
          select: {
            grossAmount: true,
          },
        },
        privateIncomeSummary: {
          select: {
            grossAmount: true,
          },
        },
        vehicleEnergyLog: {
          select: {
            electricCost: true,
            fuelCost: true,
          },
        },
      },
      orderBy: {
        operationDate: "asc",
      },
    }),

    prisma.privateTrip.findMany({
      where: {
        companyId,
        serviceDate: {
          gte: rangeStart,
          lte: rangeEnd,
        },
        status: "completed",
      },
      select: {
        id: true,
        driverId: true,
        serviceDate: true,
        amount: true,
      },
      orderBy: {
        serviceDate: "asc",
      },
    }),

    prisma.companyExpense.findMany({
      where: {
        companyId,
      },
      select: {
        id: true,
        concept: true,
        amount: true,
        frequency: true,
        expenseDate: true,
        isActive: true,
      },
      orderBy: {
        expenseDate: "asc",
      },
    }),
  ]);

  let dailyPlatformsIncome = 0;
  let dailyPrivateSummaryIncome = 0;
  let privateTripsCompletedIncome = 0;
  let energyCostTotal = 0;
  let companyExpensesTotal = 0;

  const incomeByDriver = new Map<string, number>();

  for (const operation of dailyOperations) {
    const platformIncome = operation.platformIncomes.reduce((sum, item) => {
      return sum + safeNumber(item.grossAmount);
    }, 0);

    const privateSummaryIncome = safeNumber(
      operation.privateIncomeSummary?.grossAmount
    );

    const operationIncome = platformIncome + privateSummaryIncome;

    dailyPlatformsIncome += platformIncome;
    dailyPrivateSummaryIncome += privateSummaryIncome;

    const electricCost = safeNumber(operation.vehicleEnergyLog?.electricCost);
    const fuelCost = safeNumber(operation.vehicleEnergyLog?.fuelCost);

    energyCostTotal += electricCost + fuelCost;

    const previous = incomeByDriver.get(operation.driverId) ?? 0;
    incomeByDriver.set(operation.driverId, previous + operationIncome);
  }

  for (const trip of privateTrips) {
    privateTripsCompletedIncome += safeNumber(trip.amount);

    if (trip.driverId) {
      const previous = incomeByDriver.get(trip.driverId) ?? 0;
      incomeByDriver.set(trip.driverId, previous + safeNumber(trip.amount));
    }
  }

  for (const expense of expenses) {
    companyExpensesTotal += prorateExpenseForRange({
      amount: safeNumber(expense.amount),
      frequency: expense.frequency,
      expenseDate: expense.expenseDate,
      isActive: expense.isActive,
      rangeStart,
      rangeEnd,
    });
  }

  const driverRows: DriverFinancialRow[] = [];
  let driversFixedTotal = 0;
  let driversVariableTotal = 0;

  for (const driver of drivers) {
    const generatedIncome = incomeByDriver.get(driver.id) ?? 0;

    const fixedCost = prorateMonthlyFixedSalaryForRange({
      fixedSalaryMonthly: safeNumber(driver.fixedSalaryMonthly),
      hireDate: driver.hireDate,
      from: rangeStart,
      to: rangeEnd,
    });

    let variableCost = 0;

    if (driver.commissionEnabled) {
      const mode =
        driver.commissionMode?.toLowerCase() === "monthly"
          ? "monthly"
          : "weekly";

      const periods = getPeriodsByMode(rangeStart, rangeEnd, mode);

      for (const period of periods) {
        let periodIncome = 0;

        for (const operation of dailyOperations) {
          if (operation.driverId !== driver.id) continue;

          if (
            !datesOverlap(
              operation.operationDate,
              operation.operationDate,
              period.start,
              period.end
            )
          ) {
            continue;
          }

          const platformIncome = operation.platformIncomes.reduce((sum, item) => {
            return sum + safeNumber(item.grossAmount);
          }, 0);

          const privateSummaryIncome = safeNumber(
            operation.privateIncomeSummary?.grossAmount
          );

          periodIncome += platformIncome + privateSummaryIncome;
        }

        for (const trip of privateTrips) {
          if (trip.driverId !== driver.id) continue;

          if (
            !datesOverlap(
              trip.serviceDate,
              trip.serviceDate,
              period.start,
              period.end
            )
          ) {
            continue;
          }

          periodIncome += safeNumber(trip.amount);
        }

        const threshold = safeNumber(driver.commissionThreshold);
        const commissionBase = Math.max(periodIncome - threshold, 0);
        const commissionRate = safeNumber(driver.commissionPercentage) / 100;

        variableCost += commissionBase * commissionRate;
      }
    }

    const totalCost = fixedCost + variableCost;

    driversFixedTotal += fixedCost;
    driversVariableTotal += variableCost;

    driverRows.push({
      driverId: driver.id,
      driverName: driver.fullName,
      fixedCost: round2(fixedCost),
      variableCost: round2(variableCost),
      totalCost: round2(totalCost),
      generatedIncome: round2(generatedIncome),
    });
  }

  const totalIncome =
    dailyPlatformsIncome + dailyPrivateSummaryIncome + privateTripsCompletedIncome;

  const driversTotal = driversFixedTotal + driversVariableTotal;
  const totalCosts = driversTotal + energyCostTotal + companyExpensesTotal;
  const realProfit = totalIncome - totalCosts;
  const marginPct = totalIncome > 0 ? (realProfit / totalIncome) * 100 : 0;

  return {
    company: {
      id: company.id,
      legalName: company.legalName,
      tradeName: company.tradeName,
    },
    range: {
      from: rangeStart.toISOString(),
      to: rangeEnd.toISOString(),
    },
    income: {
      dailyPlatforms: round2(dailyPlatformsIncome),
      dailyPrivateSummary: round2(dailyPrivateSummaryIncome),
      privateTripsCompleted: round2(privateTripsCompletedIncome),
      total: round2(totalIncome),
    },
    costs: {
      driversFixed: round2(driversFixedTotal),
      driversVariable: round2(driversVariableTotal),
      driversTotal: round2(driversTotal),
      energy: round2(energyCostTotal),
      companyExpenses: round2(companyExpensesTotal),
      total: round2(totalCosts),
    },
    profit: {
      real: round2(realProfit),
      marginPct: round2(marginPct),
    },
    breakdown: {
      driverRows,
    },
  };
}