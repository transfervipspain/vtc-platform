export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import ExpenseForm from "./ExpenseForm";
import EditExpenseForm from "./EditExpenseForm";

const EXPENSE_CATEGORIES = [
  "Nominas",
  "comisiones",
  "Seg Social",
  "Gasolina",
  "Gestoría",
  "Seguros",
  "Taller",
  "Cuota autónomos",
  "Cuota Coche",
  "Gastos Bancarios",
  "Lavados",
  "Peajes",
  "garage",
  "Varios",
  "linea movil",
];

type PageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

function formatCurrency(value: number) {
  return `${value.toFixed(2)} €`;
}

export default async function GastosPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const selectedCategory = params.category || "";

  const company = await prisma.company.findFirst();

  if (!company) {
    return (
      <main style={{ padding: 32, fontFamily: "Arial" }}>
        <h1>Gastos</h1>
        <p>No hay empresa cargada.</p>
      </main>
    );
  }

  const where: {
    companyId: string;
    category?: string;
  } = {
    companyId: company.id,
  };

  if (selectedCategory) {
    where.category = selectedCategory;
  }

  const expenses = await prisma.companyExpense.findMany({
    where,
    orderBy: {
      expenseDate: "desc",
    },
  });

  const allExpenses = await prisma.companyExpense.findMany({
    where: {
      companyId: company.id,
    },
    select: {
      category: true,
      amount: true,
    },
  });

  const totalsByCategory: Record<string, number> = {};

  for (const expense of allExpenses) {
    if (!totalsByCategory[expense.category]) {
      totalsByCategory[expense.category] = 0;
    }

    totalsByCategory[expense.category] += expense.amount;
  }

  const totalGeneral = expenses.reduce((sum, e) => sum + e.amount, 0);

  const dynamicCategories = Object.keys(totalsByCategory)
    .filter((c) => !EXPENSE_CATEGORIES.includes(c))
    .sort((a, b) => a.localeCompare(b, "es"));

  const allCategories = [...EXPENSE_CATEGORIES, ...dynamicCategories];

  return (
    <main
      style={{
        padding: 32,
        maxWidth: 1200,
        margin: "0 auto",
        fontFamily: "Arial",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8 }}>Gastos</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Control y seguimiento de gastos de la empresa.
        </p>
      </div>

      <ExpenseForm companyId={company.id} />

      <form
        method="GET"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 320px) auto auto",
          gap: 10,
          alignItems: "end",
          marginBottom: 20,
        }}
      >
        <div>
          <label style={labelStyle}>Categoría</label>
          <select
            name="category"
            defaultValue={selectedCategory}
            style={inputStyle}
          >
            <option value="">Todas</option>

            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" style={filterButtonStyle}>
          Filtrar
        </button>

        <a href="/gastos" style={clearButtonStyle}>
          Limpiar
        </a>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <Kpi title="Total gastos" value={formatCurrency(totalGeneral)} />
        <Kpi title="Nº registros" value={expenses.length.toString()} />
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ marginBottom: 12 }}>Resumen por categoría</h3>

        {Object.keys(totalsByCategory).length === 0 ? (
          <p style={{ color: "#6b7280" }}>No hay categorías todavía.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {Object.entries(totalsByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, total]) => (
                <div
                  key={category}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    background: "#fafafa",
                  }}
                >
                  <span>{category}</span>
                  <strong>{formatCurrency(total)}</strong>
                </div>
              ))}
          </div>
        )}
      </div>

      {expenses.length === 0 ? (
        <p>No hay gastos.</p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #ddd",
            borderRadius: 10,
            background: "#fff",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={th}>Fecha</th>
                <th style={th}>Concepto</th>
                <th style={th}>Categoría</th>
                <th style={th}>Importe</th>
                <th style={th}>Acción</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={td}>
                    {new Date(e.expenseDate).toLocaleDateString("es-ES")}
                  </td>

                  <td style={td}>{e.concept}</td>

                  <td style={td}>{e.category}</td>

                  <td style={td}>{formatCurrency(e.amount)}</td>

                  <td style={td}>
                    <EditExpenseForm
                      expenseId={e.id}
                      initialConcept={e.concept}
                      initialCategory={e.category}
                      initialAmount={e.amount}
                      initialExpenseDate={e.expenseDate}
                      initialType={e.type}
                      initialFrequency={e.frequency}
                      initialNotes={e.notes}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 10,
        padding: 16,
        background: "#fafafa",
      }}
    >
      <div style={{ fontSize: 13, color: "#666" }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  boxSizing: "border-box",
};

const filterButtonStyle: React.CSSProperties = {
  background: "#111827",
  color: "white",
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
};

const clearButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#e5e7eb",
  color: "#111827",
  padding: "10px 14px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
};

const th: React.CSSProperties = {
  padding: 10,
  textAlign: "left",
};

const td: React.CSSProperties = {
  padding: 10,
};