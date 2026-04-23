import { useAuth } from "react-oidc-context";
import { v4 } from "uuid";
import eboksIconUrl from "./icons/e_boks.png";

export function LoginPage() {
  const auth = useAuth();

  const onSignIn = () =>
    auth.signinRedirect({
      state: undefined,
      nonce: v4(),
      scope: "openid",
      extraQueryParams: {
        presentation_template_id: "418db504-1de1-4b9c-8538-02ad007372ed",
        service_name: "Title",
        scan_qr_message: "Description of the service",
      },
    });
    

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
          Login with e-Wallet
        </h1>

        <p
          style={{
            fontSize: "0.95rem",
            color: "#475569",
            marginBottom: "2rem",
            lineHeight: 1.5,
          }}
        >
          This demo uses an e-Wallet–based login flow.
          <br />
          Click below to authenticate using your e-Boks ID.
        </p>

        <button
          type="button"
          onClick={onSignIn}
          aria-label="Sign in with e-Boks ID"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            height: "44px",
            padding: "0 22px 0 4px",
            borderRadius: "9999px",
            backgroundColor: "#BB1D2C",
            color: "#FFFFFF",
            fontSize: "15px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            width: "100%",
            justifyContent: "center",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#A91A27")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#BB1D2C")
          }
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "9999px",
              backgroundColor: "#A91A27",
              flex: "0 0 auto",
            }}
          >
            <img
              src={eboksIconUrl}
              alt=""
              aria-hidden="true"
              style={{
                width: "20px",
                height: "20px",
                display: "block",
                objectFit: "contain",
              }}
            />
          </span>

          <span style={{ whiteSpace: "nowrap" }}>
            Sign in with e-Boks ID
          </span>
        </button>

        <p
          style={{
            fontSize: "0.75rem",
            color: "#64748b",
            marginTop: "1.5rem",
          }}
        >
          Demo environment · No production credentials required
        </p>
      </div>
    </div>
  );
}