import { useState } from "react";
import { BANKS, CLIENT_ID, startBankLogin, type Bank } from "./banks";

export function LoginPage() {
  const [busyBankId, setBusyBankId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSelectBank = async (bank: Bank) => {
    setError(null);
    setBusyBankId(bank.id);
    try {
      await startBankLogin(bank);
      // Browser navigates away to the authorize endpoint on success.
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(
        message.includes("Failed to fetch")
          ? `${message} — likely a CORS block on the PAR endpoint; it may need to be proxied through a backend.`
          : message
      );
      setBusyBankId(null);
    }
  };

  const busy = busyBankId !== null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            color: "#0f172a",
          }}
        >
          Choose your bank
        </h1>

        <p
          style={{
            fontSize: "0.95rem",
            color: "#475569",
            marginBottom: "2rem",
            lineHeight: 1.5,
          }}
        >
          Choose your bank to log into.
        </p>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {BANKS.map((bank) => {
            const isBusy = busyBankId === bank.id;
            return (
              <button
                key={bank.id}
                type="button"
                onClick={() => void onSelectBank(bank)}
                disabled={busy}
                aria-label={`Log in with ${bank.label}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  height: "52px",
                  padding: "0 22px",
                  borderRadius: "12px",
                  backgroundColor: isBusy ? "#94a3b8" : bank.theme.primary,
                  color: bank.theme.onPrimary,
                  fontSize: "15px",
                  fontWeight: 600,
                  border: "none",
                  cursor: busy ? "not-allowed" : "pointer",
                  width: "100%",
                  opacity: busy && !isBusy ? 0.5 : 1,
                  transition: "opacity 120ms ease",
                }}
              >
                {isBusy ? "Creating request…" : bank.label}
              </button>
            );
          })}
        </div>

        {error && (
          <p
            role="alert"
            style={{
              fontSize: "0.8rem",
              color: "#b91c1c",
              marginTop: "1.25rem",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {error}
          </p>
        )}

        <p
          style={{
            fontSize: "0.75rem",
            color: "#64748b",
            marginTop: "1.5rem",
          }}
        >
        </p>
      </div>
    </div>
  );
}
