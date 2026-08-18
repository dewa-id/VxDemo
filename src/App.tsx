import { useAuth } from "react-oidc-context";
import jwtIconUrl from "./icons/jwt-io.svg";
import ssi_iconUrl from "./icons/SSI_tools.png";
import { LoginPage } from "./LoginPage";

function App() {
  const auth = useAuth();

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
    return (
      <div>
        <p>Oops... {auth.error.message}</p>
        <button
          onClick={() => {
            window.location.href = window.location.origin;
          }}
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
          Go back
        </button>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    const idToken = auth.user?.id_token;
    const accessToken = auth.user?.access_token;

    console.debug("id token", idToken);
    console.debug("access token", accessToken);

    const goToJwtIoUrl =
      idToken && `https://jwt.io/#token=${encodeURIComponent(idToken)}`;
    const goToDewaUrl = (() => {
      if (idToken == null) return undefined;

      const url = new URL("https://ssi.dewa-id.com/");
      url.searchParams.set("decoderPayloadDisplay", "raw");
      url.searchParams.set("decoderSignatureLookup", "url");
      url.searchParams.set("jwtEncoded", idToken);
      return url.toString();
    })();

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
          <a
            href={goToJwtIoUrl}
            rel="noopener noreferrer"
            target="_blank"
            style={{
              background: "#000",
              textDecoration: "none",
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
          </a>
          <a
            href={goToDewaUrl}
            rel="noopener noreferrer"
            target="_blank"
            style={{
              background: "#000",
              color: "#fff",
              textDecoration: "none",
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
          </a>
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
  return ( <LoginPage /> ); 
}

export default App;
