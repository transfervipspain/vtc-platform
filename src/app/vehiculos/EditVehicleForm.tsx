"use client";

import React, { useState } from "react";

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
    setMessage("Guardando...");

    const res = await fetch("/api/vehicles/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleId,
        brand: brand.trim(),
        model: model.trim(),
        energyType,
      }),
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
                <h3 style={{ margin: 0, marginBottom: 6 }}>Editar vehículo</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
                  Actualiza marca, modelo y tipo de energía.
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

              <Field label="Energía">
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
                  Eliminar vehículo
                </button>
              </div>

              {message && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color: message.toLowerCase().includes("error")
                      ? "#b91c1c"
                      : "#2563eb",
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
  maxWidth: 560,
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
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
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