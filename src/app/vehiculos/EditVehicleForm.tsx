"use client";

import { useState } from "react";

type Props = {
  vehicleId: string;
  initialBrand: string | null;
  initialModel: string | null;
  initialEnergyType: string;
};

export default function EditVehicleForm({
  vehicleId,
  initialBrand,
  initialModel,
  initialEnergyType,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [brand, setBrand] = useState(initialBrand ?? "");
  const [model, setModel] = useState(initialModel ?? "");
  const [energyType, setEnergyType] = useState(initialEnergyType);
  const [message, setMessage] = useState("");

  async function handleSave() {
    const res = await fetch("/api/vehicles/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ vehicleId, brand, model, energyType }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Error guardando");
      return;
    }

    window.location.reload();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar este vehículo? Solo se podrá borrar si no tiene historial ni está asignado."
    );

    if (!confirmed) return;

    const res = await fetch("/api/vehicles/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Error al eliminar");
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
              width: 420,
              maxWidth: "90vw",
              background: "white",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              display: "grid",
              gap: 12,
            }}
          >
            <h3 style={{ margin: 0 }}>Editar vehículo</h3>

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

            <div>
              <label>Energía</label>
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

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                Eliminar vehículo
              </button>
            </div>

            {message && <p style={{ margin: 0 }}>{message}</p>}
          </div>
        </div>
      )}
    </>
  );
}