"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  companyId?: string;
};

export default function NewTripModal({ companyId }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [serviceTime, setServiceTime] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/private-trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          origin,
          destination,
          amount: Number(amount),
          serviceDate,
          serviceTime,
          notes,
          status: "pending",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo crear el servicio");
      }

      setOpen(false);
      setOrigin("");
      setDestination("");
      setAmount("");
      setServiceDate(new Date().toISOString().slice(0, 10));
      setServiceTime("");
      setNotes("");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "8px 14px",
          borderRadius: 8,
          background: "#111827",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        + Nuevo servicio
      </button>

      {open && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <h3 style={{ margin: 0 }}>Nuevo servicio</h3>

              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={fieldWrapper}>
                <label style={labelStyle}>Origen</label>
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Origen"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={fieldWrapper}>
                <label style={labelStyle}>Destino</label>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Destino"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={fieldWrapper}>
                <label style={labelStyle}>Importe (€)</label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Importe"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={twoColsStyle}>
                <div style={fieldWrapper}>
                  <label style={labelStyle}>Fecha</label>
                  <input
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    type="date"
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={fieldWrapper}>
                  <label style={labelStyle}>Hora</label>
                  <input
                    value={serviceTime}
                    onChange={(e) => setServiceTime(e.target.value)}
                    type="time"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={fieldWrapper}>
                <label style={labelStyle}>Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas opcionales"
                  rows={3}
                  style={textareaStyle}
                />
              </div>

              {error ? (
                <div
                  style={{
                    marginTop: 10,
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "#fef2f2",
                    color: "#b91c1c",
                    fontSize: 14,
                  }}
                >
                  {error}
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 16,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  style={btnSecondary}
                >
                  Cancelar
                </button>

                <button type="submit" disabled={saving} style={btnPrimary}>
                  {saving ? "Guardando..." : "Crear servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  width: "100%",
  maxWidth: 520,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
};

const fieldWrapper: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginTop: 12,
};

const twoColsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 14,
};

const textareaStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 14,
  resize: "vertical",
};

const btnPrimary: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  padding: "10px 14px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

const btnSecondary: React.CSSProperties = {
  background: "#e5e7eb",
  color: "#111827",
  padding: "10px 14px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};