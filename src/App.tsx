import { useAuth } from "react-oidc-context";
import { useState } from "react";
import { v4 } from "uuid";
import jwtIconUrl from "./icons/jwt-io.svg";
import ssi_iconUrl from "./icons/SSI_tools.png";

function App() {
  const auth = useAuth();
  const [tokenType, setTokenType] = useState<'id' | 'access'>('id');

  const handleLogin = (selectedProvider: 'github' | 'apple' | 'entra' | 'google') => {
    auth.signinRedirect({
      state: undefined /* let react-oidc-context generate new state */,
      nonce: v4(),
      scope: "openid",
      extraQueryParams: {
        provider: selectedProvider,
        // preferred_tenant: "demo-030a396a54fc4b96b651856176e4be30",
      },
    });
  };

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
    return (<div>
      <p>Oops... {auth.error.name}: {auth.error.message}</p>
      <p>{'' + auth.error.innerError}</p>
      <a href="/">Go back</a>
    </div>)
  }

  if (auth.isAuthenticated) {
    const idToken = auth.user?.id_token;
    const accessToken = auth.user?.access_token;
    const activeToken = tokenType === 'id' ? idToken : accessToken;

    console.debug("id token", idToken);
    console.debug("access token", accessToken);

    const goToJwtIoUrl =
      activeToken && `https://jwt.io/#token=${encodeURIComponent(activeToken)}`;
    const goToDewaUrl = (() => {
      if (idToken == null) return undefined;

      const url = new URL("https://ssi.dewa-id.com/");
      url.searchParams.set("decoderPayloadDisplay", "raw");
      url.searchParams.set("decoderSignatureLookup", "url");
      url.searchParams.set("jwtEncoded", activeToken!);
      return url.toString();
    })();

    return (
      <div>
        <p>Hello {auth.user?.profile.sub} ({auth.user?.profile.email || ''})</p>
        <p style={{ fontSize: "0.9rem", color: "#334155" }}>
          {tokenType === 'id' ? 'ID token' : 'Access token'} is ready below. Treat it as a secret.
        </p>
        <select
          value={tokenType}
          onChange={(e) => setTokenType(e.target.value as 'id' | 'access')}
          style={{
            marginBottom: "0.75rem",
            padding: "0.5rem",
            borderRadius: "0.25rem",
            border: "1px solid #cbd5e1",
            fontSize: "0.9rem",
          }}
        >
          <option value="id">ID Token</option>
          <option value="access">Access Token</option>
        </select> <br />
        <textarea
          readOnly
          value={activeToken}
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
            onClick={() => {
              auth.signinSilent();
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
            REFRESH
          </button>
          <button
            onClick={async () => {
              await auth.removeUser()
              const url = new URL(window.location.href)
              url.pathname = '/';
              url.search = '';
              url.hash = '';
              await auth.signoutRedirect({post_logout_redirect_uri: url.href});
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
            LOG OUT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ marginBottom: "0.5rem", fontSize: "0.9rem", color: "#334155" }}>
          Choose authentication provider:
        </p>
        <div >
          <button
            onClick={() => handleLogin('github')}
            style={{
              background: "#000",
              color: "#fff",
              border: "1px solid #000",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            GitHub
          </button>
          <button
            onClick={() => handleLogin('apple')}
            style={{
              background: "#000",
              color: "#fff",
              border: "1px solid #000",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Apple
          </button> <br />
          <button
            onClick={() => handleLogin('entra')}
            style={{
              background: "#000",
              color: "#fff",
              border: "1px solid #000",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Microsoft
          </button>
          <button
            onClick={() => handleLogin('google')}
            style={{
              background: "#000",
              color: "#fff",
              border: "1px solid #000",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
