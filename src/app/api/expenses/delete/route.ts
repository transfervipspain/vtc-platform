import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { expenseId } = await req.json();

  await prisma.companyExpense.delete({
    where: { id: expenseId },
  });

  return new Response("OK");
}