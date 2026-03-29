"use client";

import { useState } from "react";

export default function NewVehicleModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 12,
          padding: "10px 16px",
          cursor: "pointer",
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        + Nuevo vehículo
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 640,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: 18,
              padding: 20,
              boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
              border: "1px solid #e5e7eb",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: "1px solid #d1d5db",
                  background: "white",
                  cursor: "pointer",
                  fontSize: 22,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {children}
          </div>
        </div>
      )}
    </>
  );
}