import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";

const oidcConfig = {
  authority: "https://pp.verify-id.eu",
  client_id: "e-Boks",
  redirect_uri: "http://localhost:5173/cb",
} satisfies AuthProviderProps;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </StrictMode>
);
