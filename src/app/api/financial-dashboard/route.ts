// src/app/api/financial-dashboard/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFinancialDashboardData } from "@/lib/finance/dashboard";

export const dynamic = "force-dynamic";

function parseDate(value: string | null, fallback: Date) {
  if (!value) return fallback;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;

  return parsed;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    let companyId = searchParams.get("companyId");

    if (!companyId) {
      const firstCompany = await prisma.company.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (!firstCompany) {
        return NextResponse.json(
          { error: "No hay empresas disponibles" },
          { status: 404 }
        );
      }

      companyId = firstCompany.id;
    }

    const today = new Date();
    const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1);
    const defaultTo = today;

    const from = parseDate(searchParams.get("from"), defaultFrom);
    const to = parseDate(searchParams.get("to"), defaultTo);

    const data = await getFinancialDashboardData({
      companyId,
      from,
      to,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/financial-dashboard error", error);

    return NextResponse.json(
      { error: "No se pudo cargar el dashboard financiero" },
      { status: 500 }
    );
  }
}