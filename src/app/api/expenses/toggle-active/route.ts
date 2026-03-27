import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { expenseId } = await req.json();

  const expense = await prisma.companyExpense.findUnique({
    where: { id: expenseId },
  });

  if (!expense) {
    return new Response("Not found", { status: 404 });
  }

  await prisma.companyExpense.update({
    where: { id: expenseId },
    data: { isActive: !expense.isActive },
  });

  return new Response("OK");
}