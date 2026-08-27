/**
 * Configuration for the Pushed Authorization Request (PAR, RFC 9126) flow.
 */

/** `private_key_jwt` client authentication, RFC 7523 §2.2. */
export const CLIENT_ASSERTION_TYPE =
  "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";

/**
 * Client assertion authenticating this client at the PAR and token endpoints.
 *
 * It is a long-lived credential baked into the bundle: anyone who loads the page
 * can authenticate as this client until it expires. That is the trade for a
 * demo that needs no backend — keep it to a throwaway demo client, and note that
 * a production client signs a short-lived assertion per request, server-side.
 *
 * `iss` and `sub` must both be the `client_id`, and `aud` the authority's
 * issuer; get one wrong and the authority answers a bare `invalid_client`.
 * Override per environment with VITE_CLIENT_ASSERTION rather than editing here.
 */
export const CLIENT_ASSERTION: string =
  import.meta.env.VITE_CLIENT_ASSERTION ??
  "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL3BwLnZlcmlmeS1pZC5ldSIsImV4cCI6Mjc0OTIwMzYzMywiaWF0IjoxNzQ5MjAwMDMzLCJpc3MiOiJBZHJpYW4iLCJqdGkiOiJmZmZjMDc1OC1iNTBiLTQyODYtYTJhMS03NWY4OWUzMmIzYmMiLCJuYW1lIjoiSm9obiBEb2UiLCJzdWIiOiJBZHJpYW4ifQ.Im74R-W_kqQI_rVp9zueQndIZBkz3B-pLx7QZ9vvw0nV8xug3m_JptcJ25ipkZGLE-2w6LPblcRXlD3FzMXRrQ";

/**
 * Authorization parameters that only the PAR flow sends. Because they travel in
 * a back-channel POST body rather than a redirect URL, they are not length
 * limited and never appear in browser history or server logs — the whole point
 * of PAR.
 */
export const PAR_EXTRA_PARAMS: Record<string, string> = {
  presentation_template_id: "4a3e4a2d-ec10-4ee5-888d-ba34bc6dcb6e",
  service_name: "Zalando",
  scan_qr_message: "Log på Zalando",
  "dewa.name": "Signaturgruppen",
  "dewa.purpose": "testAAID",
  "dewa.reference_txt": "Nigerian prince",
  "dewa.escalation_lvl": "MeDiUm",
  "dewa.logo":
    "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
};

/** Passed as a first-class OIDC parameter rather than an extra one. */
export const PAR_UI_LOCALES = "da";
