import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    companyId,
    concept,
    category,
    amount,
    expenseDate,
    type,
    frequency,
    notes,
  } = body;

  await prisma.companyExpense.create({
    data: {
      companyId,
      concept,
      category,
      amount,
      expenseDate: new Date(expenseDate),
      type,
      frequency,
      notes: notes || null,
    },
  });

  return new Response("OK");
}