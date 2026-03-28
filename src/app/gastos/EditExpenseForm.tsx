"use client";

import { useState } from "react";

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
] as const;

const CUSTOM_CATEGORY_VALUE = "__custom__";

type Vehicle = {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
};

type Props = {
  expenseId: string;
  vehicles: Vehicle[];
  initialVehicleId: string | null;
  initialConcept: string;
  initialCategory: string;
  initialAmount: number;
  initialExpenseDate: Date;
  initialType: string;
  initialFrequency: string;
  initialNotes: string | null;
};

function formatDateForInput(date: Date) {
  return new Date(date).toISOString().split("T")[0];
}

function isPresetCategory(category: string) {
  return EXPENSE_CATEGORIES.includes(
    category as (typeof EXPENSE_CATEGORIES)[number]
  );
}

export default function EditExpenseForm({
  expenseId,
  vehicles,
  initialVehicleId,
  initialConcept,
  initialCategory,
  initialAmount,
  initialExpenseDate,
  initialType,
  initialFrequency,
  initialNotes,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [concept, setConcept] = useState(initialConcept);
  const [selectedCategory, setSelectedCategory] = useState(
    isPresetCategory(initialCategory) ? initialCategory : CUSTOM_CATEGORY_VALUE
  );
  const [customCategory, setCustomCategory] = useState(
    isPresetCategory(initialCategory) ? "" : initialCategory
  );
  const [vehicleId, setVehicleId] = useState(initialVehicleId ?? "");
  const [amount, setAmount] = useState(initialAmount.toString());
  const [expenseDate, setExpenseDate] = useState(
    formatDateForInput(initialExpenseDate)
  );
  const [type, setType] = useState(initialType);
  const [frequency, setFrequency] = useState(initialFrequency);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [message, setMessage] = useState("");

  const finalCategory =
    selectedCategory === CUSTOM_CATEGORY_VALUE
      ? customCategory.trim()
      : selectedCategory.trim();

  async function handleSave() {
    if (!finalCategory) {
      setMessage("Debes seleccionar o escribir una categoría");
      return;
    }

    const res = await fetch("/api/expenses/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expenseId,
        vehicleId: vehicleId || null,
        concept,
        category: finalCategory,
        amount: Number(amount),
        expenseDate,
        type,
        frequency,
        notes,
      }),
    });

    if (!res.ok) {
      setMessage("Error guardando");
      return;
    }

    window.location.reload();
  }

  async function handleDelete() {
    const confirmed = window.confirm("¿Seguro que quieres eliminar este gasto?");
    if (!confirmed) return;

    const res = await fetch("/api/expenses/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expenseId }),
    });

    if (!res.ok) {
      setMessage("Error eliminando");
      return;
    }

    window.location.reload();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={editButtonStyle}
      >
        Editar
      </button>

      {isOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={headerStyle}>
              <div>
                <h3 style={{ margin: 0, marginBottom: 6 }}>Editar gasto</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
                  Actualiza los datos del gasto o elimínalo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={iconCloseButtonStyle}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <Field label="Concepto">
                <input
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Categoría">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={inputStyle}
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value={CUSTOM_CATEGORY_VALUE}>Otra...</option>
                </select>

                {selectedCategory === CUSTOM_CATEGORY_VALUE && (
                  <input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Escribe una categoría nueva"
                    style={{ ...inputStyle, marginTop: 8 }}
                  />
                )}
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                <Field label="Vehículo">
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Gasto general</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNumber} · {vehicle.brand} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Importe (€)">
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Fecha">
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Tipo">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="fixed">Fijo</option>
                    <option value="variable">Variable</option>
                  </select>
                </Field>

                <Field label="Frecuencia">
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="one-time">Único</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </Field>
              </div>

              <Field label="Notas">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 96 }}
                />
              </Field>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <button type="button" onClick={handleSave} style={saveButtonStyle}>
                  Guardar
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={secondaryButtonStyle}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  style={dangerButtonStyle}
                >
                  Eliminar
                </button>
              </div>

              {message && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#b91c1c",
                  }}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 720,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "white",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
  border: "1px solid #e5e7eb",
  boxSizing: "border-box",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 18,
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

const editButtonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const saveButtonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const dangerButtonStyle: React.CSSProperties = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const iconCloseButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  border: "1px solid #d1d5db",
  background: "white",
  cursor: "pointer",
  fontSize: 22,
  lineHeight: 1,
};