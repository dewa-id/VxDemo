import { useEffect, useState } from "react";
import {
  DEMO_PAYMENT,
  generateTransactionCode,
  goToLoggedInHome,
  isPaymentPaid,
  logOut,
  markPaymentPaid,
  startPaymentApproval,
  type Bank,
  type FlowPurpose,
} from "./banks";

type Props = {
  bank: Bank;
  params: Record<string, string>;
  purpose: FlowPurpose;
};

/**
 * Themed landing page shown after a wallet round completes and the
 * authorization server redirects back to the callback URL.
 *
 * - purpose "login":   show the account overview + a pending payment to approve
 * - purpose "payment": show the payment as approved (the SCA step completed)
 */
export function BankHome({ bank, params, purpose }: Props) {
  const { theme } = bank;
  const error = params.error || params.error_description;
  const success = !error;

  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  // Transaction code sent as reference_txt / purpose on the payment PAR.
  // Not displayed on this page — the user matches it in their wallet.
  const [pendingTxCode] = useState(() => generateTransactionCode());

  // Persisted paid flag: set once the SCA receipt renders, read on the overview
  // so the payment shows as completed instead of pending.
  const paid = isPaymentPaid();
  useEffect(() => {
    if (purpose === "payment" && success) markPaymentPaid();
  }, [purpose, success]);

  const approvePayment = async () => {
    setPayError(null);
    setPayBusy(true);
    try {
      // Second PAR + authorize round → this is the SCA demonstration.
      await startPaymentApproval(bank, DEMO_PAYMENT, pendingTxCode);
    } catch (e) {
      setPayError(e instanceof Error ? e.message : String(e));
      setPayBusy(false);
    }
  };

  const card = {
    background: theme.surface,
    borderRadius: "16px",
    padding: "1.75rem",
    boxShadow: "0 16px 40px rgba(0,0,0,0.06)",
  } as const;

  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "0.5rem 0",
  } as const;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.pageBg,
        color: theme.text,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Branded header */}
      <header
        style={{
          background: theme.primary,
          color: theme.onPrimary,
          padding: "1.1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            aria-hidden="true"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "9px",
              background: theme.accent,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: theme.primaryDark,
              fontSize: "1.1rem",
            }}
          >
            {bank.label.charAt(0)}
          </span>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              {bank.label}
            </div>
            <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>
              {bank.tagline}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={logOut}
          style={{
            background: "transparent",
            color: theme.onPrimary,
            border: `1px solid ${theme.onPrimary}`,
            borderRadius: "9999px",
            padding: "0.45rem 1rem",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          padding: "2rem 1.5rem",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {!success ? (
          <div style={{ ...card, borderTop: "4px solid #b91c1c" }}>
            <h1
              style={{
                margin: "0 0 0.4rem",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#b91c1c",
              }}
            >
              {purpose === "payment" ? "Payment declined" : "Login failed"}
            </h1>
            <p style={{ margin: 0, color: theme.muted, lineHeight: 1.5 }}>
              {params.error_description || params.error}
            </p>
          </div>
        ) : purpose === "payment" ? (
          // ---- SCA step completed: payment approved ----
          <div style={{ ...card, borderTop: `4px solid ${theme.primary}` }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: theme.accent,
                color: theme.primaryDark,
                borderRadius: "9999px",
                padding: "0.3rem 0.8rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              ✓ SCA completed
            </div>
            <h1
              style={{
                margin: "0 0 0.4rem",
                fontSize: "1.5rem",
                fontWeight: 700,
              }}
            >
              Payment approved
            </h1>
            <p style={{ margin: "0 0 1.25rem", color: theme.muted, lineHeight: 1.5 }}>
              The payment was approved with Strong Customer Authentication via
              your e-Wallet.
            </p>

            <div style={{ borderTop: `1px solid ${theme.pageBg}` }}>
              <div style={rowStyle}>
                <span style={{ color: theme.muted }}>Amount</span>
                <strong>{DEMO_PAYMENT.amount}</strong>
              </div>
              <div style={rowStyle}>
                <span style={{ color: theme.muted }}>From</span>
                <strong>{DEMO_PAYMENT.from}</strong>
              </div>
              <div style={rowStyle}>
                <span style={{ color: theme.muted }}>To</span>
                <strong>{DEMO_PAYMENT.to}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={goToLoggedInHome}
              style={{
                marginTop: "1.5rem",
                background: theme.primary,
                color: theme.onPrimary,
                border: "none",
                borderRadius: "12px",
                height: "48px",
                padding: "0 1.25rem",
                fontWeight: 600,
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Back to home
            </button>
          </div>
        ) : (
          // ---- Logged in: overview + pending payment (SCA to come) ----
          <>
            <div style={{ ...card, borderTop: `4px solid ${theme.primary}` }}>
              <h1
                style={{
                  margin: "0 0 0.4rem",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                Welcome to {bank.label}
              </h1>
              <p style={{ margin: 0, color: theme.muted, lineHeight: 1.5 }}>
                You are now logged in with your e-Wallet. Your identity has been
                verified.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "0.9rem",
                  marginTop: "1.5rem",
                }}
              >
                {[
                  { label: "Salary account", value: "DKK 12,480.55" },
                  { label: "Savings", value: "DKK 84,200.00" },
                  { label: "Credit", value: "−DKK 3,150.20" },
                ].map((acct) => (
                  <div
                    key={acct.label}
                    style={{
                      background: theme.pageBg,
                      borderRadius: "12px",
                      padding: "1rem",
                    }}
                  >
                    <div style={{ fontSize: "0.8rem", color: theme.muted }}>
                      {acct.label}
                    </div>
                    <div
                      style={{
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        marginTop: "0.25rem",
                      }}
                    >
                      {acct.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending payment requiring SCA */}
            <div style={{ ...card, borderTop: `4px solid ${theme.accent}` }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "1rem",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                  {paid ? "Payment completed" : "Payment awaiting approval"}
                </h2>
                {paid ? (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      background: theme.accent,
                      color: theme.primaryDark,
                      borderRadius: "9999px",
                      padding: "0.2rem 0.6rem",
                    }}
                  >
                    ✓ Paid
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: theme.muted,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Requires SCA
                  </span>
                )}
              </div>

              <div style={{ marginTop: "1rem", borderTop: `1px solid ${theme.pageBg}` }}>
                <div style={rowStyle}>
                  <span style={{ color: theme.muted }}>Amount</span>
                  <strong>{DEMO_PAYMENT.amount}</strong>
                </div>
                <div style={rowStyle}>
                  <span style={{ color: theme.muted }}>From</span>
                  <strong>{DEMO_PAYMENT.from}</strong>
                </div>
                <div style={rowStyle}>
                  <span style={{ color: theme.muted }}>To</span>
                  <strong>{DEMO_PAYMENT.to}</strong>
                </div>
              </div>

              {paid ? (
                <div
                  style={{
                    marginTop: "1.25rem",
                    padding: "0.85rem 1rem",
                    borderRadius: "12px",
                    background: theme.pageBg,
                    color: theme.primaryDark,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textAlign: "center",
                  }}
                >
                  ✓ Approved with Strong Customer Authentication
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void approvePayment()}
                  disabled={payBusy}
                  style={{
                    marginTop: "1.25rem",
                    width: "100%",
                    background: payBusy ? "#94a3b8" : theme.primary,
                    color: theme.onPrimary,
                    border: "none",
                    borderRadius: "12px",
                    height: "52px",
                    fontWeight: 600,
                    fontSize: "15px",
                    cursor: payBusy ? "not-allowed" : "pointer",
                  }}
                >
                  {payBusy
                    ? "Creating request…"
                    : "Approve payment with e-Wallet"}
                </button>
              )}

              {payError && (
                <p
                  role="alert"
                  style={{
                    fontSize: "0.8rem",
                    color: "#b91c1c",
                    marginTop: "1rem",
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                  }}
                >
                  {payError}
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
