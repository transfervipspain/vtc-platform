import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("BODY DRIVERS CREATE", body);

    const companyId =
      typeof body.companyId === "string" ? body.companyId.trim() : "";
    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName =
      typeof body.lastName === "string" ? body.lastName.trim() : "";

if (!body.companyId || body.companyId.trim() === "") {
  return NextResponse.json(
    { error: "CompanyId inválido" },
    { status: 400 }
  );
}
    if (!companyId || !firstName || !lastName) {
      return NextResponse.json(
        {
          error: `Faltan campos obligatorios: ${
            [
              !companyId ? "companyId" : null,
              !firstName ? "firstName" : null,
              !lastName ? "lastName" : null,
            ]
              .filter(Boolean)
              .join(", ")
          }`,
        },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.create({
      data: {
        companyId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        phone:
          typeof body.phone === "string" && body.phone.trim()
            ? body.phone.trim()
            : null,
        email:
          typeof body.email === "string" && body.email.trim()
            ? body.email.trim()
            : null,
        licensePoints:
          typeof body.licensePoints === "number" ? body.licensePoints : null,
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