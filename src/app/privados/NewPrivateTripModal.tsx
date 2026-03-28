"use client";

import { useState } from "react";

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
        <div style={overlayStyle} onClick={() => setOpen(false)}>
          <div
            style={modalStyle}
            onClick={(e) => e.stopPropagation()}
          >
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

            <div style={contentStyle}>{children}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const openButtonStyle: React.CSSProperties = {
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: 600,
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

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 980,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "white",
  borderRadius: 18,
  boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
  border: "1px solid #e5e7eb",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  padding: 20,
  borderBottom: "1px solid #e5e7eb",
  position: "sticky",
  top: 0,
  background: "white",
  zIndex: 1,
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
};

const contentStyle: React.CSSProperties = {
  padding: 20,
};