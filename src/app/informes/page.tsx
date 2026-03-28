export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getProfitLossReport } from "@/lib/reports/profitLoss";

type PageProps = {
  searchParams?: Promise<{
    year?: string;
    vehicleId?: string;
  }>;
};

function formatCurrency(value: number) {
  return `${value.toFixed(2)} €`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)} %`;
}

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0);
}

export default async function InformesPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const currentYear = new Date().getFullYear();
  const selectedYear = Number(params.year || currentYear);
  const selectedVehicleId = params.vehicleId || "";

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
      <main style={{ padding: 32, fontFamily: "Arial" }}>
        <h1>Informes</h1>
        <p>No hay empresa cargada.</p>
      </main>
    );
  }

  const report = await getProfitLossReport(company.id, selectedYear);

  const totalIncomeAll = sum(report.total.totalIncome);
  const totalExpensesAll = sum(report.total.totalExpenses);
  const totalResultAll = sum(report.total.result);
  const totalMarginAll =
    totalIncomeAll > 0 ? (totalResultAll / totalIncomeAll) * 100 : 0;

  const yearOptions = Array.from({ length: 5 }, (_, idx) => currentYear - 2 + idx);

  const filteredVehicles = selectedVehicleId
    ? report.vehicles.filter((vehicle) => vehicle.vehicleId === selectedVehicleId)
    : report.vehicles;

  const vehicleRanking = [...report.vehicles]
    .map((vehicle) => {
      const income = sum(vehicle.income);
      const expenses = sum(vehicle.totalExpenses);
      const result = sum(vehicle.result);
      const margin = income > 0 ? (result / income) * 100 : 0;

      return {
        vehicleId: vehicle.vehicleId,
        plateNumber: vehicle.plateNumber,
        name: `${vehicle.plateNumber} · ${vehicle.brand} ${vehicle.model}`,
        income,
        expenses,
        result,
        margin,
      };
    })
    .sort((a, b) => b.result - a.result);

  return (
    <main
      style={{
        padding: 32,
        maxWidth: 1400,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8 }}>Informes</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Pérdidas y ganancias total y por vehículo.
        </p>
      </div>

      <form
        method="GET"
        style={{
          display: "flex",
          gap: 10,
          alignItems: "end",
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <label style={labelStyle}>Año</label>
          <select name="year" defaultValue={String(selectedYear)} style={inputStyle}>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Vehículo</label>
          <select
            name="vehicleId"
            defaultValue={selectedVehicleId}
            style={inputStyle}
          >
            <option value="">Todos</option>
            {company.vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plateNumber} · {vehicle.brand} {vehicle.model}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" style={buttonStyle}>
          Ver informe
        </button>

        <a href="/informes" style={clearButtonStyle}>
          Limpiar
        </a>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <Kpi title="Ingresos totales" value={formatCurrency(totalIncomeAll)} color="#2563eb" />
        <Kpi title="Gastos totales" value={formatCurrency(totalExpensesAll)} color="#dc2626" />
        <Kpi
          title="Beneficio total"
          value={formatCurrency(totalResultAll)}
          color={totalResultAll >= 0 ? "#16a34a" : "#dc2626"}
        />
        <Kpi
          title="Margen total"
          value={formatPercent(totalMarginAll)}
          color={totalMarginAll >= 0 ? "#7c3aed" : "#dc2626"}
        />
      </div>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ marginBottom: 14 }}>P&amp;L total · {selectedYear}</h2>

        <div
          style={{
            overflowX: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            background: "#fff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 980,
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                <th style={thStyleLeft}>Concepto</th>
                {report.months.map((month) => (
                  <th key={month} style={thStyleRight}>
                    {month}
                  </th>
                ))}
                <th style={thStyleRight}>Total</th>
              </tr>
            </thead>

            <tbody>
              <SectionRow label="INGRESOS" />

              {report.total.incomeLines.map((line) => (
                <DataRow key={line.label} label={line.label} values={line.values} />
              ))}

              <TotalRow label="TOTAL INGRESOS" values={report.total.totalIncome} />

              <SpacerRow />

              <SectionRow label="GASTOS" />

              {report.total.expenseLines.map((line) => (
                <DataRow
                  key={line.label}
                  label={line.label}
                  values={line.values.map((v) => -v)}
                />
              ))}

              <TotalRow
                label="TOTAL GASTOS"
                values={report.total.totalExpenses.map((v) => -v)}
              />

              <SpacerRow />

              <SectionRow label="RESULTADO" />
              <TotalRow label="Beneficio" values={report.total.result} />
              <DataRow
                label="Margen %"
                values={report.total.marginPct}
                formatter={formatPercent}
              />
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ marginBottom: 14 }}>Ranking de vehículos · {selectedYear}</h2>

        {vehicleRanking.length === 0 ? (
          <div
            style={{
              border: "1px dashed #d1d5db",
              borderRadius: 12,
              padding: 24,
              color: "#6b7280",
              background: "#fafafa",
            }}
          >
            No hay datos de vehículos para este año.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              background: "#fff",
              boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 900,
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={thStyleLeft}>#</th>
                  <th style={thStyleLeft}>Vehículo</th>
                  <th style={thStyleRight}>Ingresos</th>
                  <th style={thStyleRight}>Gastos</th>
                  <th style={thStyleRight}>Beneficio</th>
                  <th style={thStyleRight}>Margen</th>
                </tr>
              </thead>
              <tbody>
                {vehicleRanking.map((vehicle, idx) => (
                  <tr key={vehicle.vehicleId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdLabelStyle}>{idx + 1}</td>
                    <td style={tdLabelStyle}>{vehicle.name}</td>
                    <td style={tdValueStyle}>{formatCurrency(vehicle.income)}</td>
                    <td style={tdValueStyle}>{formatCurrency(vehicle.expenses)}</td>
                    <td
                      style={{
                        ...tdValueStyle,
                        fontWeight: 700,
                        color: vehicle.result >= 0 ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {formatCurrency(vehicle.result)}
                    </td>
                    <td
                      style={{
                        ...tdValueStyle,
                        fontWeight: 700,
                        color: vehicle.margin >= 0 ? "#7c3aed" : "#dc2626",
                      }}
                    >
                      {formatPercent(vehicle.margin)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 style={{ marginBottom: 14 }}>
          P&amp;L por vehículo · {selectedYear}
          {selectedVehicleId ? " · filtrado" : ""}
        </h2>

        {filteredVehicles.length === 0 ? (
          <div
            style={{
              border: "1px dashed #d1d5db",
              borderRadius: 12,
              padding: 24,
              color: "#6b7280",
              background: "#fafafa",
            }}
          >
            No hay datos para ese vehículo en el año seleccionado.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {filteredVehicles.map((vehicle) => {
              const vehicleIncome = sum(vehicle.income);
              const vehicleEnergy = sum(vehicle.energy);
              const vehicleDirectExpenses = sum(vehicle.directExpenses);
              const vehicleAllocatedExpenses = sum(vehicle.allocatedExpenses);
              const vehicleExpenses = sum(vehicle.totalExpenses);
              const vehicleResult = sum(vehicle.result);
              const vehicleMargin =
                vehicleIncome > 0 ? (vehicleResult / vehicleIncome) * 100 : 0;

              return (
                <div
                  key={vehicle.vehicleId}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    background: "#fff",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid #e5e7eb",
                      background: "#f8fafc",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>
                        {vehicle.plateNumber}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: 13 }}>
                        {vehicle.brand} {vehicle.model}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                      <MiniStat label="Ingresos" value={formatCurrency(vehicleIncome)} />
                      <MiniStat label="Energía" value={formatCurrency(vehicleEnergy)} />
                      <MiniStat
                        label="Gastos directos"
                        value={formatCurrency(vehicleDirectExpenses)}
                      />
                      <MiniStat
                        label="Gastos asignados"
                        value={formatCurrency(vehicleAllocatedExpenses)}
                      />
                      <MiniStat label="Gastos" value={formatCurrency(vehicleExpenses)} />
                      <MiniStat
                        label="Beneficio"
                        value={formatCurrency(vehicleResult)}
                        color={vehicleResult >= 0 ? "#16a34a" : "#dc2626"}
                      />
                      <MiniStat
                        label="Margen"
                        value={formatPercent(vehicleMargin)}
                        color={vehicleMargin >= 0 ? "#7c3aed" : "#dc2626"}
                      />
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: 980,
                        fontSize: 14,
                      }}
                    >
                      <thead>
                        <tr style={{ background: "#fcfcfd", borderBottom: "1px solid #eef2f7" }}>
                          <th style={thStyleLeft}>Concepto</th>
                          {report.months.map((month) => (
                            <th key={month} style={thStyleRight}>
                              {month}
                            </th>
                          ))}
                          <th style={thStyleRight}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <SectionRow label="INGRESOS" />
                        <DataRow label="Ingresos" values={vehicle.income} />

                        <SpacerRow />

                        <SectionRow label="GASTOS" />
                        <DataRow label="Energía" values={vehicle.energy.map((v) => -v)} />
                        <DataRow
                          label="Gastos directos"
                          values={vehicle.directExpenses.map((v) => -v)}
                        />
                        <DataRow
                          label="Gastos asignados"
                          values={vehicle.allocatedExpenses.map((v) => -v)}
                        />
                        <TotalRow
                          label="TOTAL GASTOS"
                          values={vehicle.totalExpenses.map((v) => -v)}
                        />

                        <SpacerRow />

                        <SectionRow label="RESULTADO" />
                        <TotalRow label="Beneficio" values={vehicle.result} />
                      </tbody>
                    </table>
                  </div>

                  <div
                    style={{
                      padding: "10px 16px",
                      fontSize: 12,
                      color: "#6b7280",
                      borderTop: "1px solid #eef2f7",
                      background: "#fafafa",
                    }}
                  >
                    Los gastos con vehículo asignado se imputan directamente. Solo los gastos generales se reparten entre los vehículos con actividad en cada mes.
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function Kpi({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 13, color: "#6b7280" }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color = "#111827",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function SectionRow({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={999} style={sectionStyle}>
        {label}
      </td>
    </tr>
  );
}

function SpacerRow() {
  return (
    <tr>
      <td colSpan={999} style={{ height: 8, background: "#fff" }} />
    </tr>
  );
}

function DataRow({
  label,
  values,
  formatter = formatCurrency,
}: {
  label: string;
  values: number[];
  formatter?: (value: number) => string;
}) {
  return (
    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
      <td style={tdLabelStyle}>{label}</td>
      {values.map((value, idx) => (
        <td key={idx} style={tdValueStyle}>
          {formatter(value)}
        </td>
      ))}
      <td style={{ ...tdValueStyle, fontWeight: 700 }}>
        {formatter(sum(values))}
      </td>
    </tr>
  );
}

function TotalRow({
  label,
  values,
}: {
  label: string;
  values: number[];
}) {
  return (
    <tr style={{ borderTop: "2px solid #cbd5e1", borderBottom: "1px solid #e2e8f0" }}>
      <td style={{ ...tdLabelStyle, fontWeight: 800 }}>{label}</td>
      {values.map((value, idx) => (
        <td key={idx} style={{ ...tdValueStyle, fontWeight: 800 }}>
          {formatCurrency(value)}
        </td>
      ))}
      <td style={{ ...tdValueStyle, fontWeight: 800 }}>
        {formatCurrency(sum(values))}
      </td>
    </tr>
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
  minWidth: 180,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
};

const buttonStyle: React.CSSProperties = {
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

const thStyleLeft: React.CSSProperties = {
  padding: "12px 14px",
  textAlign: "left",
  fontWeight: 700,
  color: "#475569",
  whiteSpace: "nowrap",
};

const thStyleRight: React.CSSProperties = {
  padding: "12px 14px",
  textAlign: "right",
  fontWeight: 700,
  color: "#475569",
  whiteSpace: "nowrap",
};

const tdLabelStyle: React.CSSProperties = {
  padding: "10px 14px",
  color: "#111827",
  whiteSpace: "nowrap",
};

const tdValueStyle: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "right",
  color: "#111827",
  whiteSpace: "nowrap",
};

const sectionStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontWeight: 800,
  background: "#f8fafc",
  color: "#111827",
};