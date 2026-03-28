export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import ExpenseForm from "./ExpenseForm";
import EditExpenseForm from "./EditExpenseForm";
import NewExpenseModal from "./NewExpenseModal";

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

  const company = await prisma.company.findFirst({
    include: {
      vehicles: {
        where: {
          isActive: true,
        },
        orderBy: {
          plateNumber: "asc",
        },
      },
    },
  });

  if (!company) {
    return (
      <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
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
    include: {
      vehicle: true,
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
        padding: 24,
        maxWidth: 1280,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, marginBottom: 8 }}>Gastos</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Control y seguimiento de gastos de la empresa.
        </p>
      </div>

      <NewExpenseModal>
        <ExpenseForm companyId={company.id} vehicles={company.vehicles} />
      </NewExpenseModal>

      <form
        method="GET"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          alignItems: "end",
          marginBottom: 20,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
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

        <button type="submit" style={primaryButtonStyle}>
          Filtrar
        </button>

        <a href="/gastos" style={secondaryButtonStyle}>
          Limpiar
        </a>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Kpi
          title="Total gastos"
          value={formatCurrency(totalGeneral)}
          valueColor="#1d4ed8"
          background="#eff6ff"
          borderColor="#bfdbfe"
        />
        <Kpi
          title="Nº registros"
          value={expenses.length.toString()}
          valueColor="#111827"
          background="#ffffff"
          borderColor="#e5e7eb"
        />
      </div>

      <div
        style={{
          marginBottom: 28,
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          background: "#ffffff",
          padding: 18,
          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 14 }}>Resumen por categoría</h3>

        {Object.keys(totalsByCategory).length === 0 ? (
          <p style={{ color: "#6b7280", margin: 0 }}>No hay categorías todavía.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            {Object.entries(totalsByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, total]) => (
                <div
                  key={category}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    background: "#f8fafc",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#111827" }}>{category}</span>
                  <strong style={{ color: "#1d4ed8" }}>{formatCurrency(total)}</strong>
                </div>
              ))}
          </div>
        )}
      </div>

      {expenses.length === 0 ? (
        <div
          style={{
            border: "1px dashed #d1d5db",
            borderRadius: 14,
            padding: 24,
            background: "#fafafa",
            color: "#6b7280",
          }}
        >
          No hay gastos.
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 900,
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={th}>Fecha</th>
                <th style={th}>Concepto</th>
                <th style={th}>Categoría</th>
                <th style={th}>Vehículo</th>
                <th style={th}>Importe</th>
                <th style={th}>Acción</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} style={{ borderTop: "1px solid #eef2f7" }}>
                  <td style={td}>
                    {new Date(e.expenseDate).toLocaleDateString("es-ES")}
                  </td>

                  <td style={td}>{e.concept}</td>
                  <td style={td}>{e.category}</td>

                  <td style={td}>
                    {e.vehicle
                      ? `${e.vehicle.plateNumber} · ${e.vehicle.brand} ${e.vehicle.model}`
                      : "General"}
                  </td>

                  <td style={{ ...td, fontWeight: 700, color: "#1d4ed8" }}>
                    {formatCurrency(e.amount)}
                  </td>

                  <td style={td}>
                    <EditExpenseForm
                      expenseId={e.id}
                      vehicles={company.vehicles}
                      initialVehicleId={e.vehicleId}
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

function Kpi({
  title,
  value,
  valueColor,
  background,
  borderColor,
}: {
  title: string;
  value: string;
  valueColor: string;
  background: string;
  borderColor: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: 18,
        background,
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: valueColor }}>{value}</div>
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

const primaryButtonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  minHeight: 42,
};

const secondaryButtonStyle: React.CSSProperties = {
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
  minHeight: 42,
  boxSizing: "border-box",
};

const th: React.CSSProperties = {
  padding: 12,
  textAlign: "left",
  fontSize: 13,
  color: "#475569",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: 12,
  color: "#111827",
  verticalAlign: "top",
};