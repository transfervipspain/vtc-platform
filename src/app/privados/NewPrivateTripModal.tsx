"use client";

import React, { useState } from "react";

type Props = {
  children: React.ReactNode;
};

export default function NewPrivateTripModal({ children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={openButtonStyle}
        >
          + Nuevo viaje privado
        </button>
      </div>

      {open ? (
        <div
          style={overlayStyle}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div style={modalShellStyle}>
            <div style={headerStyle}>
              <div>
                <h2 style={{ margin: 0, marginBottom: 4 }}>Nuevo viaje privado</h2>
                <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
                  Crea un servicio sin salir de esta pantalla.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                style={closeButtonStyle}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div style={bodyScrollStyle}>{children}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const openButtonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 1000,
};

const modalShellStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 980,
  maxHeight: "90vh",
  background: "white",
  borderRadius: 18,
  boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
  border: "1px solid #e5e7eb",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  padding: 20,
  borderBottom: "1px solid #e5e7eb",
  background: "white",
  flexShrink: 0,
};

const bodyScrollStyle: React.CSSProperties = {
  padding: 20,
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const closeButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  border: "1px solid #d1d5db",
  background: "white",
  cursor: "pointer",
  fontSize: 22,
  lineHeight: 1,
  flexShrink: 0,
};