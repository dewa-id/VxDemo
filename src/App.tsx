import { useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { v4 } from "uuid";
import jwtIconUrl from "./icons/jwt-io.svg";
import ssi_iconUrl from "./icons/SSI_tools.png";

function App() {
  const auth = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    if (!auth.isAuthenticated && !auth.isLoading) {
      hasRedirected.current = true;
      void auth.signinRedirect({
        state: undefined,
        nonce: v4(),
        extraQueryParams: {
          presentation_template_id: "368df5b3-6298-49a6-b521-ef8645a32749",
        },
      });
    }
  }, [auth.isAuthenticated, auth.isLoading, auth]);

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    const idToken = auth.user?.id_token ?? "";
    const goToJwtIo = () => {
      if (!idToken) return;
      const url = new URL("https://jwt.io/");
      url.hash = `token=${encodeURIComponent(idToken)}`;
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    };

    const goToDewa = () => {
      if (!idToken) return;
      const url = new URL("https://dev.dewa-id.com/");
      url.searchParams.set("decoderPayloadDisplay", "raw");
      url.searchParams.set("decoderSignatureLookup", "url");
      url.searchParams.set("jwtEncoded", idToken);
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    };

    return (
      <div>
        <p>Hello {auth.user?.profile.sub}</p>
        <p style={{ fontSize: "0.9rem", color: "#334155" }}>
          ID token is ready below. Treat it as a secret.
        </p>
        <textarea
          readOnly
          value={idToken}
          style={{
            width: "100%",
            minHeight: "240px",
            padding: "0.75rem",
            fontFamily: "monospace",
            fontSize: "0.85rem",
            borderRadius: "0.5rem",
            border: "1px solid #cbd5e1",
            background: "#f8fafc",
            color: "#0f172a",
            marginBottom: "0.75rem",
          }}
        />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={goToJwtIo}
            disabled={!idToken}
            style={{
              background: "#000",
              color: "#fff",
              borderRadius: "999px",
              border: "1px solid #000",
              padding: "0.6rem 1rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            }}
          >
            <img
              src={jwtIconUrl}
              alt="jwt.io"
              width={24}
              height={24}
              style={{ display: "inline-block" }}
            />
            <span>View on jwt.io</span>
          </button>
          <button
            onClick={goToDewa}
            disabled={!idToken}
            style={{
              background: "#000",
              color: "#fff",
              borderRadius: "999px",
              border: "1px solid #000",
              padding: "0.6rem 1rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            }}
          >
            <img
              src={ssi_iconUrl}
              alt="dev.dewa-id.com"
              width={24}
              height={24}
              style={{ display: "inline-block" }}
            />
            <span>VIEW ON DEWA</span>
          </button>
          <button
            onClick={() => void auth.removeUser()}
            style={{
              background: "#000",
              color: "#fff",
              borderRadius: "999px",
              border: "1px solid #000",
              padding: "0.6rem 1rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            }}
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() =>
        void auth.signinRedirect({
          nonce: v4(),
          extraQueryParams: {
            presentation_definition_id: "c147092f-1954-4b5e-9fb1-fe0b466f30a0",
          },
        })
      }
    >
      Log in
    </button>
  );
}

export default App;
