"use client";

import { useState } from "react";

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

    const res = await fetch("/api/vehicles/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyId,
        plateNumber,
        brand,
        model,
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
        border: "1px solid #ddd",
        borderRadius: 10,
        padding: 20,
        marginBottom: 24,
        display: "grid",
        gap: 12,
        background: "#fafafa",
      }}
    >
      <h2>Nuevo vehículo</h2>

      <div>
        <label>Matrícula</label>
        <input
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label>Marca</label>
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div>
          <label>Modelo</label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
      </div>

      <div>
        <label>Tipo de energía</label>
        <select
          value={energyType}
          onChange={(e) => setEnergyType(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        >
          <option value="electric">Eléctrico</option>
          <option value="hybrid">Híbrido</option>
          <option value="gasoline">Gasolina</option>
          <option value="diesel">Diésel</option>
        </select>
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
        Crear vehículo
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}