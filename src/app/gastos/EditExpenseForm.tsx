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

type Props = {
  expenseId: string;
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
  return EXPENSE_CATEGORIES.includes(category as (typeof EXPENSE_CATEGORIES)[number]);
}

export default function EditExpenseForm({
  expenseId,
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
        onClick={() => setIsOpen(true)}
        style={{
          background: "#111",
          color: "white",
          border: "none",
          padding: "6px 10px",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Editar
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: 460,
              maxWidth: "92vw",
              background: "white",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              display: "grid",
              gap: 14,
            }}
          >
            <h3 style={{ margin: 0 }}>Editar gasto</h3>

            <div>
              <label>Concepto</label>
              <input
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <div>
              <label>Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
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
                  style={{ width: "100%", padding: 8, marginTop: 8 }}
                />
              )}
            </div>

            <div>
              <label>Importe (€)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <div>
              <label>Fecha</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <div>
              <label>Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              >
                <option value="fixed">Fijo</option>
                <option value="variable">Variable</option>
              </select>
            </div>

            <div>
              <label>Frecuencia</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              >
                <option value="one-time">Único</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>

            <div>
              <label>Notas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleSave}
                style={{
                  background: "#27ae60",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Guardar
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "#777",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>

              <button
                onClick={handleDelete}
                style={{
                  background: "#c0392b",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Eliminar
              </button>
            </div>

            {message && <p style={{ margin: 0 }}>{message}</p>}
          </div>
        </div>
      )}
    </>
  );
}