import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { v4 } from "uuid";
import eboksIconUrl from "./icons/e_boks.png";
import { userManager } from "./auth";
import { PAR_EXTRA_PARAMS, PAR_UI_LOCALES } from "./parConfig";

export function LoginPage() {
  const auth = useAuth();
  const [isPushing, setIsPushing] = useState(false);
  const [parError, setParError] = useState<string>();

  const onSignIn = () =>
    auth.signinRedirect({
      state: undefined,
      nonce: v4(),
      scope: "openid",
      extraQueryParams: {
        presentation_template_id: "4a3e4a2d-ec10-4ee5-888d-ba34bc6dcb6e",
        service_name: "Title",
        scan_qr_message: "Description of the service",
      },
    });

  /**
   * Same authorization code flow, except the parameters are pushed to the
   * authority's PAR endpoint first and the redirect only carries the resulting
   * `request_uri`. The push is a network round-trip, so unlike `signinRedirect`
   * this can fail while the user is still on this page.
   */
  const onSignInWithPar = async () => {
    setParError(undefined);
    setIsPushing(true);
    try {
      await userManager.signinRedirectWithPar({
        state: undefined,
        nonce: v4(),
        scope: "openid",
        ui_locales: PAR_UI_LOCALES,
        extraQueryParams: PAR_EXTRA_PARAMS,
      });
    } catch (err) {
      console.error("PAR sign-in failed", err);
      setParError(err instanceof Error ? err.message : String(err));
      setIsPushing(false);
    }
  };

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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            margin: "1.25rem 0",
            color: "#94a3b8",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <span style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
          or
          <span style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
        </div>

        <button
          type="button"
          onClick={onSignInWithPar}
          disabled={isPushing}
          aria-label="Sign in using a pushed authorization request"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            height: "44px",
            padding: "0 22px",
            borderRadius: "9999px",
            backgroundColor: "#ffffff",
            color: "#0f172a",
            fontSize: "15px",
            fontWeight: 600,
            border: "1px solid #0f172a",
            cursor: isPushing ? "progress" : "pointer",
            width: "100%",
            opacity: isPushing ? 0.6 : 1,
          }}
        >
          {isPushing ? "Pushing request…" : "Sign in with PAR"}
        </button>

        <p
          style={{
            fontSize: "0.75rem",
            color: "#64748b",
            marginTop: "0.5rem",
          }}
        >
          RFC 9126 · parameters sent back-channel, redirect carries only a
          request_uri
        </p>

        {parError && (
          <p
            role="alert"
            style={{
              fontSize: "0.8rem",
              color: "#b91c1c",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "0.5rem",
              padding: "0.6rem 0.75rem",
              marginTop: "1rem",
              textAlign: "left",
              wordBreak: "break-word",
            }}
          >
            {parError}
          </p>
        )}

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
