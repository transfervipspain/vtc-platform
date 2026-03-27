import { prisma } from "@/lib/prisma";
import ExpenseForm from "./ExpenseForm";
import ToggleExpenseActiveButton from "./ToggleExpenseActiveButton";
import EditExpenseForm from "./EditExpenseForm";

export const dynamic = "force-dynamic";

export default async function GastosPage() {
  const company = await prisma.company.findFirst();

  const expenses = await prisma.companyExpense.findMany({
    orderBy: [
      { isActive: "desc" },
      { expenseDate: "desc" },
    ],
  });

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Gastos de empresa</h1>

      {company && <ExpenseForm companyId={company.id} />}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          overflow: "hidden",
          background: "#fafafa",
          marginTop: 20,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
              <th style={{ padding: "10px 12px" }}>Fecha</th>
              <th style={{ padding: "10px 12px" }}>Concepto</th>
              <th style={{ padding: "10px 12px" }}>Categoría</th>
              <th style={{ padding: "10px 12px" }}>Tipo</th>
              <th style={{ padding: "10px 12px" }}>Frecuencia</th>
              <th style={{ padding: "10px 12px" }}>Importe</th>
              <th style={{ padding: "10px 12px" }}>Estado</th>
              <th style={{ padding: "10px 12px" }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} style={{ borderTop: "1px solid #e5e5e5" }}>
                <td style={{ padding: "10px 12px" }}>
                  {new Date(expense.expenseDate).toLocaleDateString("es-ES")}
                </td>

                <td style={{ padding: "10px 12px", fontWeight: "bold" }}>
                  {expense.concept}
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {expense.category}
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {expense.type === "fixed" ? "Fijo" : "Variable"}
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {expense.frequency === "one-time"
                    ? "Único"
                    : expense.frequency === "weekly"
                    ? "Semanal"
                    : expense.frequency === "monthly"
                    ? "Mensual"
                    : expense.frequency === "yearly"
                    ? "Anual"
                    : expense.frequency}
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {expense.amount.toFixed(2)} €
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "white",
                      background: expense.isActive ? "#27ae60" : "#c0392b",
                    }}
                  >
                    {expense.isActive ? "ACTIVO" : "INACTIVO"}
                  </span>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <ToggleExpenseActiveButton
                      expenseId={expense.id}
                      isActive={expense.isActive}
                    />

                    <EditExpenseForm
                      expenseId={expense.id}
                      initialConcept={expense.concept}
                      initialCategory={expense.category}
                      initialAmount={expense.amount}
                      initialExpenseDate={expense.expenseDate}
                      initialType={expense.type}
                      initialFrequency={expense.frequency}
                      initialNotes={expense.notes}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}