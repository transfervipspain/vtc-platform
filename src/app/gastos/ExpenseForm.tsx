"use client";

import { useMemo, useState } from "react";

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

export default function ExpenseForm({ companyId }: { companyId: string }) {
  const [concept, setConcept] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [type, setType] = useState("fixed");
  const [frequency, setFrequency] = useState("monthly");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const finalCategory = useMemo(() => {
    if (selectedCategory === CUSTOM_CATEGORY_VALUE) {
      return customCategory.trim();
    }

    return selectedCategory.trim();
  }, [selectedCategory, customCategory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!finalCategory) {
      setMessage("Debes seleccionar o escribir una categoría");
      return;
    }

    setMessage("Guardando...");

    const res = await fetch("/api/expenses/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyId,
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
      setMessage("Error creando gasto");
      return;
    }

    window.location.reload();
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: "1px solid #ddd",
        borderRadius: 10,
        padding: 20,
        marginBottom: 24,
        display: "grid",
        gap: 12,
        background: "#fafafa",
      }}
    >
      <h2>Nuevo gasto</h2>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
        <div>
          <label>Concepto</label>
          <input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div>
          <label>Categoría</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          >
            <option value="">Seleccionar</option>
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
              required
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
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <label>Fecha</label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
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

      <button
        type="submit"
        style={{
          background: "#111",
          color: "white",
          border: "none",
          borderRadius: 8,
          padding: "10px 14px",
          cursor: "pointer",
        }}
      >
        Añadir gasto
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}