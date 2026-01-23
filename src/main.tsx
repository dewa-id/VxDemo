import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";

const oidcConfig = {
  authority: "https://auth.dewa.localhost",
  client_id: "console_app",
  redirect_uri: "https://auth-page.dewa.localhost/cb",
} satisfies AuthProviderProps;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </StrictMode>
);
