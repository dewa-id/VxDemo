import type { UserManagerSettings } from "oidc-client-ts";
import { ParUserManager } from "./ParUserManager";

export const oidcConfig = {
  authority: "https://pp.verify-id.eu",
  client_id: "Adrian",
  redirect_uri: new URL("cb", window.location.toString()).toString(),
} satisfies UserManagerSettings;

/**
 * Shared instance: `AuthProvider` drives the standard flow through it, and
 * `LoginPage` calls `signinRedirectWithPar` on it directly. Both have to be the
 * same object so the signin state written before the redirect is the state the
 * callback reads back.
 */
export const userManager = new ParUserManager(oidcConfig);
