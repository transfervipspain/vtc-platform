import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.companyId || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.create({
      data: {
        companyId: body.companyId,
        firstName: body.firstName,
        lastName: body.lastName,
        fullName: `${body.firstName} ${body.lastName}`,
        phone: body.phone || null,
        email: body.email || null,
        licensePoints: body.licensePoints || null,
        isActive: true,
      },
    });

    return NextResponse.json(driver);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}