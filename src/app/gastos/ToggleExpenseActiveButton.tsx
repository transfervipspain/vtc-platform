"use client";

export default function ToggleExpenseActiveButton({
  expenseId,
  isActive,
}: {
  expenseId: string;
  isActive: boolean;
}) {
  async function handleClick() {
    await fetch("/api/expenses/toggle-active", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expenseId }),
    });

    window.location.reload();
  }

  return (
    <button
      onClick={handleClick}
      style={{
        background: isActive ? "#c0392b" : "#27ae60",
        color: "white",
        border: "none",
        padding: "6px 10px",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      {isActive ? "Desactivar" : "Activar"}
    </button>
  );
}