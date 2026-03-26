import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      driverId,
      phone,
      email,
      licensePoints,
      commissionPercentage,
    } = body;

    await prisma.driver.update({
      where: { id: driverId },
      data: {
        phone: phone || null,
        email: email || null,
        licensePoints: licensePoints ? Number(licensePoints) : null,
        commissionPercentage:
          commissionPercentage !== undefined
            ? Number(commissionPercentage)
            : undefined,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return new Response("Error updating driver", { status: 500 });
  }
}