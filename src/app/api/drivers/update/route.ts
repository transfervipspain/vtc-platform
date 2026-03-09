import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.driverId) {
      return NextResponse.json(
        { error: "Falta driverId" },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.update({
      where: { id: body.driverId },
      data: {
        phone: body.phone || null,
        email: body.email || null,
        licensePoints:
          body.licensePoints === "" || body.licensePoints === null
            ? null
            : Number(body.licensePoints),
      },
    });

    return NextResponse.json(driver);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error actualizando conductor" },
      { status: 500 }
    );
  }
}