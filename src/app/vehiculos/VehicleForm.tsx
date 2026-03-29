"use client";

import React, { useState } from "react";

type Props = {
  companyId: string;
};

export default function VehicleForm({ companyId }: Props) {
  const [plateNumber, setPlateNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [energyType, setEnergyType] = useState("electric");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cleanPlateNumber = plateNumber.trim().toUpperCase();
    const cleanBrand = brand.trim();
    const cleanModel = model.trim();

    if (!companyId || !cleanPlateNumber) {
      setMessage("Faltan campos obligatorios");
      return;
    }

    setMessage("Guardando...");

    const res = await fetch("/api/vehicles/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyId,
        plateNumber: cleanPlateNumber,
        brand: cleanBrand,
        model: cleanModel,
        energyType,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Error creando vehículo");
      return;
    }

    setMessage("Vehículo creado correctamente");
    window.location.reload();
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <div>
        <h2 style={{ margin: 0, marginBottom: 6 }}>Nuevo vehículo</h2>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          Añade un vehículo a la empresa.
        </p>
      </div>

      <Field label="Matrícula">
        <input
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          required
          style={inputStyle}
        />
      </Field>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <Field label="Marca">
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="Modelo">
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={inputStyle}
          />
        </Field>
      </div>

      <Field label="Tipo de energía">
        <select
          value={energyType}
          onChange={(e) => setEnergyType(e.target.value)}
          style={inputStyle}
        >
          <option value="electric">Eléctrico</option>
          <option value="hybrid">Híbrido</option>
          <option value="gasoline">Gasolina</option>
          <option value="diesel">Diésel</option>
        </select>
      </Field>

      <button type="submit" style={primaryButtonStyle}>
        Crear vehículo
      </button>

      {message && <p style={{ margin: 0 }}>{message}</p>}
    </form>
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
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

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
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};