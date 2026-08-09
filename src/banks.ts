import { v4 as uuidv4 } from "uuid";

/**
 * OpenID4VP verifier flow config for verify-id.eu.
 *
 * Endpoints come from the OIDC discovery document:
 *   https://pp.verify-id.eu/.well-known/openid-configuration
 */
export const AUTH_SERVER = "https://pp.verify-id.eu/oidc";
export const PAR_ENDPOINT = `${AUTH_SERVER}/as/par`;
export const AUTHORIZE_ENDPOINT = `${AUTH_SERVER}/authorize`;

// Where the authorization server sends the browser back after the wallet
// presents. Must be a redirect_uri registered for the client. Served by the
// SPA (vite falls back to index.html), and handled in App.tsx.
export const CALLBACK_PATH = "/cb";
export const redirectUri = () => `${window.location.origin}${CALLBACK_PATH}`;

// --- Client credentials (shared placeholder set: "BEC-test") -----------------
// Swap in per-bank values later by moving these onto the Bank entries below.
export const CLIENT_ID = "BEC-test";
export const CLIENT_ASSERTION_TYPE =
  "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
export const CLIENT_ASSERTION = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL3BwLnZlcmlmeS1pZC5ldSIsImV4cCI6Mjc0OTIwMzYzMywiaWF0IjoxNzQ5MjAwMDMzLCJuYW1lIjoiSm9obiBEb2UiLCJzdWIiOiJCRUMtdGVzdCJ9.ZzgqLN5NTa9UFipUOiQo05ZMULM8dJqScAosLDhK2TblTEPNz9ChziYZOLz5KCMWkR9lZAHvVTPw6Nm5XNX1GA"

export type BankTheme = {
  /** Main brand colour: header background, primary buttons. */
  primary: string;
  /** Darker shade for hover / accents. */
  primaryDark: string;
  /** Secondary accent colour. */
  accent: string;
  /** Text colour that sits on top of `primary`. */
  onPrimary: string;
  /** Home-page background. */
  pageBg: string;
  /** Card / surface background. */
  surface: string;
  text: string;
  muted: string;
};

export type Bank = {
  id: string;
  label: string;
  tagline: string;
  /** Per-bank presentation template (both share a placeholder for now). */
  presentationTemplateId: string;
  /**
   * Hosted https URL of the bank logo, sent as `dewa.logo` and rendered on the
   * wallet QR page. Must be https (the QR page's CSP img-src blocks data: URIs).
   */
  logo: string;
  theme: BankTheme;
};

// NOTE: brand colours below are approximate — tweak to match exact brand specs.
export const BANKS: Bank[] = [
  {
    id: "laegernes-bank",
    label: "Lægernes Bank",
    tagline: "The bank for healthcare professionals",
    presentationTemplateId: "ff079b9e-38b7-4b9a-b4e9-f1b9547cc622",
    logo: "https://www.lpb.dk/Frontend/img/logo-so-me.png",
    theme: {
      primary: "#0E7C5A",
      primaryDark: "#0A5E44",
      accent: "#7FD1B0",
      onPrimary: "#FFFFFF",
      pageBg: "#F1F7F4",
      surface: "#FFFFFF",
      text: "#0B2E23",
      muted: "#5A7A70",
    },
  },
  {
    id: "nykredit",
    label: "Nykredit",
    tagline: "We dare where others hesitate",
    presentationTemplateId: "ff079b9e-38b7-4b9a-b4e9-f1b9547cc622",
    logo: "https://www.nykredit.dk/globalassets/billeder/ikoner-logoer-flag-grafikker-og-diverse/logoer/nykredit_logo.svg",
    theme: {
      primary: "#002B45",
      primaryDark: "#001B2E",
      accent: "#12B0C4",
      onPrimary: "#FFFFFF",
      pageBg: "#EEF3F6",
      surface: "#FFFFFF",
      text: "#0A1F2C",
      muted: "#5B6B75",
    },
  },
];

export function getBankById(id: string | null | undefined): Bank | undefined {
  if (!id) return undefined;
  return BANKS.find((b) => b.id === id);
}

// --- Flow purpose + demo payment ---------------------------------------------
// The demo has two wallet rounds: logging in, then approving a payment. The
// second round re-runs PAR + authorize and is the Strong Customer
// Authentication (SCA) demonstration.
export type FlowPurpose = "login" | "payment";

export type PaymentDetails = {
  amount: string;
  from: string;
  to: string;
  shortFrom: string;
  shortTo: string;
};

/** Demo payment the user must approve with SCA on the bank home page. */
export const DEMO_PAYMENT: PaymentDetails = {
  amount: "DKK 299.00",
  from: "Salary account · 5479 0001234567",
  to: "PureGym A/S · 9860 0004455667",
  shortFrom: "Salary account",
  shortTo: "PureGym A/S"

};

const BANK_STORAGE_KEY = "vxdemo:selectedBank";
const PURPOSE_STORAGE_KEY = "vxdemo:flowPurpose";
const TXCODE_STORAGE_KEY = "vxdemo:txCode";
const PAID_STORAGE_KEY = "vxdemo:paid";

/**
 * Short transaction code shown to the user and sent as `dewa.reference_txt` on
 * the payment round. The user checks that it matches what the wallet displays —
 * this is the dynamic-linking part of SCA.
 */
export function generateTransactionCode(): string {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  const six = (n[0] % 1_000_000).toString().padStart(6, "0");
  return `${six.slice(0, 3)} ${six.slice(3)}`;
}

/** The transaction code stored before the payment redirect (for the receipt). */
export function transactionCodeFromStorage(): string | null {
  try {
    return window.sessionStorage.getItem(TXCODE_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Return to the logged-in overview for the current bank. Resets the stored
 * step to "login" so the callback page renders the account overview (not the
 * payment receipt) and keeps the user "logged in".
 */
export function goToLoggedInHome(): void {
  try {
    window.sessionStorage.setItem(PURPOSE_STORAGE_KEY, "login");
  } catch {
    /* ignore */
  }
  window.location.href = `${window.location.origin}${CALLBACK_PATH}`;
}

/** Clear the demo session and return to the bank picker (log out). */
export function logOut(): void {
  try {
    window.sessionStorage.removeItem(BANK_STORAGE_KEY);
    window.sessionStorage.removeItem(PURPOSE_STORAGE_KEY);
    window.sessionStorage.removeItem(TXCODE_STORAGE_KEY);
    window.sessionStorage.removeItem(PAID_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.location.href = `${window.location.origin}/`;
}

/** Mark the demo payment as paid (set once the SCA receipt renders). */
export function markPaymentPaid(): void {
  try {
    window.sessionStorage.setItem(PAID_STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}

/** Whether the demo payment has been approved this session. */
export function isPaymentPaid(): boolean {
  try {
    return window.sessionStorage.getItem(PAID_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Run a Pushed Authorization Request for a bank, then redirect the browser to
 * the authorize endpoint with the returned request_uri.
 *
 * `purpose` ("login" | "payment") is packed into `state` so the callback page
 * knows which step just completed.
 */
async function pushAuthorizationRequest(opts: {
  bank: Bank;
  purpose: FlowPurpose;
  serviceName: string;
  scanQrMessage: string;
  dewaName: string;
  dewaPurpose: string;
  referenceTxt: string | null;
  dewaLogo: string;
}): Promise<void> {
  const {
    bank,
    purpose,
    serviceName,
    scanQrMessage,
    dewaName,
    dewaPurpose,
    referenceTxt,
    dewaLogo,
  } = opts;

  const body = new URLSearchParams();
  // response_type=vp_token is the only type the server advertises (OpenID4VP).
  body.set("response_type", "vp_token");
  body.set("scope", "openid");
  body.set("client_id", CLIENT_ID);
  body.set("client_assertion_type", CLIENT_ASSERTION_TYPE);
  body.set("client_assertion", CLIENT_ASSERTION);
  body.set("presentation_template_id", bank.presentationTemplateId);
  body.set("redirect_uri", redirectUri());
  body.set("nonce", uuidv4());
  // `state` carries bank + purpose across the redirect. The server echoes it.
  body.set("state", `${bank.id}::${purpose}`);
  // Display + DEWA-specific PAR extensions (see the backend's
  // ParPushedAuthorizationRequest model for the exact field names).
  body.set("service_name", serviceName);
  body.set("scan_qr_message", scanQrMessage);
  body.set("dewa.name", dewaName);
  body.set("dewa.purpose", dewaPurpose);
  referenceTxt ? body.set("dewa.reference_txt", referenceTxt.slice(0, 130)) : {}
  if (dewaLogo) body.set("dewa.logo", dewaLogo);

  // Backup in case the server does not echo `state`.
  try {
    window.sessionStorage.setItem(BANK_STORAGE_KEY, bank.id);
    window.sessionStorage.setItem(PURPOSE_STORAGE_KEY, purpose);
  } catch {
    /* sessionStorage unavailable — rely on the state round-trip */
  }

  const res = await fetch(PAR_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const raw = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    const detail =
      (data.error_description as string) ||
      (data.error as string) ||
      raw ||
      `HTTP ${res.status}`;
    throw new Error(`PAR failed (${res.status}): ${detail}`);
  }

  const requestUri = data.request_uri as string | undefined;
  if (!requestUri) {
    throw new Error("PAR succeeded but no request_uri was returned.");
  }

  // Per the PAR spec the authorize call carries only client_id + request_uri.
  const url = new URL(AUTHORIZE_ENDPOINT);
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("request_uri", requestUri);
  window.location.href = url.toString();
}

/** Step 1: log in with the wallet. */
export async function startBankLogin(bank: Bank): Promise<void> {
  // A fresh login starts a new session — nothing is paid yet.
  try {
    window.sessionStorage.removeItem(PAID_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return pushAuthorizationRequest({
    bank,
    purpose: "login",
    serviceName: bank.label,
    scanQrMessage: `Log in to ${bank.label}`,
    dewaName: `Log in to ${bank.label}`,
    dewaPurpose: "Verify your identity to log in",
    referenceTxt: null,
    dewaLogo: bank.logo,
  });
}

/** Step 2 (SCA): approve a payment — a second PAR + authorize round. */
export async function startPaymentApproval(
  bank: Bank,
  payment: PaymentDetails,
  transactionCode: string
): Promise<void> {
  // Remember the code so the post-redirect receipt can show the same value.
  try {
    window.sessionStorage.setItem(TXCODE_STORAGE_KEY, transactionCode);
  } catch {
    /* ignore */
  }
  return pushAuthorizationRequest({
    bank,
    purpose: "payment",
    serviceName: `Payment · ${bank.label}`,
    scanQrMessage: `Approve transfer of ${payment.amount} to ${payment.shortTo}. Transaction code is ${transactionCode}`,
    dewaName: `Nykredit`,
    // purpose is shown on the QR page — amount/from/to plus the transaction code.
    dewaPurpose: `Pay ${payment.amount} from ${payment.shortFrom} to ${payment.shortTo}`,
    // reference_txt carries the code for the user to match in the wallet.
    referenceTxt: `Transaction code is ${transactionCode}`,
    dewaLogo: bank.logo,
  });
}

/**
 * Parse the authorization response the server appended to the callback URL.
 * OpenID4VP responses may arrive in the query string or the fragment, so we
 * read both.
 */
export function parseCallbackParams(): Record<string, string> {
  const out: Record<string, string> = {};
  const collect = (s: string) => {
    const params = new URLSearchParams(s.startsWith("?") || s.startsWith("#") ? s.slice(1) : s);
    for (const [k, v] of params) out[k] = v;
  };
  collect(window.location.search);
  collect(window.location.hash);
  return out;
}

/** Resolve which bank the callback belongs to (state param, then storage). */
export function bankFromCallback(params: Record<string, string>): Bank | undefined {
  const stateBankId = (params.state ?? "").split("::")[0];
  const fromState = getBankById(stateBankId);
  if (fromState) return fromState;
  try {
    return getBankById(window.sessionStorage.getItem(BANK_STORAGE_KEY));
  } catch {
    return undefined;
  }
}

/**
 * Resolve which step the callback belongs to. sessionStorage reflects the round
 * we last started in this tab and is authoritative on the same device; the
 * echoed `state` is only a cross-device fallback. The server can hand back a
 * stale state (…::login) when it reuses a session, which would otherwise strand
 * the completed payment round on the "logged in" view — so storage wins.
 */
export function purposeFromCallback(params: Record<string, string>): FlowPurpose {
  try {
    const stored = window.sessionStorage.getItem(PURPOSE_STORAGE_KEY);
    if (stored === "payment" || stored === "login") return stored;
  } catch {
    /* ignore */
  }
  const fromState = (params.state ?? "").split("::")[1];
  if (fromState === "payment" || fromState === "login") return fromState;
  return "login";
}
