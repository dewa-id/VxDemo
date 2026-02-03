import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";

const oidcConfig = {
  authority: "https://auth.dewa.localhost",
  // authority: "https://auth.staging.dewa-id.com",
  client_id: "dewa_platform_local",
  redirect_uri: "https://auth-page.dewa.localhost/cb",
  onSignoutCallback: () => {
    console.log('signout CALLBACK')
    window.location.pathname = "/";
  }
} satisfies AuthProviderProps;

createRoot(document.getElementById("root")!).render(
  <AuthProvider {...oidcConfig}>
    <App />
  </AuthProvider>,
);
