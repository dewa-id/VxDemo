import {
  UserManager,
  type OidcMetadata,
  type SigninRedirectArgs,
} from "oidc-client-ts";
import { CLIENT_ASSERTION, CLIENT_ASSERTION_TYPE } from "./parConfig";

/** RFC 9126 §2.2 success response. */
interface ParResponse {
  request_uri: string;
  expires_in: number;
}

/**
 * A `UserManager` that starts the authorization code flow with a Pushed
 * Authorization Request (RFC 9126) instead of putting the request parameters in
 * the front-channel redirect.
 *
 * oidc-client-ts has no built-in PAR support, so `signinRedirectWithPar` reuses
 * the request the library would normally redirect to: it POSTs that request's
 * parameters to the PAR endpoint, then redirects with nothing but `client_id`
 * and the returned `request_uri`. Everything after the redirect — state lookup,
 * PKCE, nonce validation, code exchange — keeps working unchanged, because the
 * parameters that were pushed are the ones the library itself generated.
 */
export class ParUserManager extends UserManager {
  /** Like `signinRedirect`, but pushes the request first. */
  async signinRedirectWithPar(args: SigninRedirectArgs = {}): Promise<void> {
    const { redirectMethod, ...requestArgs } = args;
    const handle = await this._redirectNavigator.prepare({ redirectMethod });

    try {
      // Building the request also persists the signin state (state id, nonce,
      // PKCE code_verifier) that signinCallback needs on the way back.
      const signinRequest = await this._client.createSigninRequest({
        request_type: "si:r",
        ...requestArgs,
        // The client authenticates at the token endpoint too, not just at PAR.
        extraTokenParams: {
          client_assertion_type: CLIENT_ASSERTION_TYPE,
          client_assertion: CLIENT_ASSERTION,
          ...requestArgs.extraTokenParams,
        },
      });

      const authorizeUrl = new URL(signinRequest.url);
      const requestUri = await this.pushAuthorizationRequest(
        authorizeUrl.searchParams,
        CLIENT_ASSERTION
      );

      // RFC 9126 §4: the front-channel request carries client_id and
      // request_uri only — every other parameter came from the push.
      const redirectUrl = new URL(authorizeUrl);
      redirectUrl.search = "";
      redirectUrl.searchParams.set("client_id", this.settings.client_id);
      redirectUrl.searchParams.set("request_uri", requestUri);
      console.log("client_id: ", this.settings.client_id)

      await handle.navigate({
        url: redirectUrl.href,
        state: signinRequest.state.id,
        response_mode: signinRequest.state.response_mode,
      });
    } catch (err) {
      handle.close();
      throw err;
    }
  }

  /**
   * Pushes the authorization request parameters to the PAR endpoint and returns
   * the `request_uri` standing in for them.
   */
  private async pushAuthorizationRequest(
    authorizeParams: URLSearchParams,
    clientAssertion: string
  ): Promise<string> {
    const endpoint = await this.getParEndpoint();

    const body = new URLSearchParams(authorizeParams);
    body.set("client_assertion_type", CLIENT_ASSERTION_TYPE);
    body.set("client_assertion", clientAssertion);

    console.debug("PAR request", endpoint, {
      ...Object.fromEntries(body),
      client_assertion: "<redacted>",
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const raw = await response.text();
    if (!response.ok) {
      let detail = describeError(raw);
      if (detail.includes("invalid_client")) {
        detail += `. ${explainClientAuthFailure(
          clientAssertion,
          this.settings.client_id
        )}`;
      }
      throw new Error(`PAR request failed (${response.status}): ${detail}`);
    }

    const { request_uri, expires_in } = JSON.parse(raw) as ParResponse;
    if (!request_uri) {
      throw new Error("PAR response contained no request_uri");
    }
    console.debug("PAR request_uri", request_uri, "expires_in", expires_in);

    return request_uri;
  }

  private async getParEndpoint(): Promise<string> {
    // oidc-client-ts's metadata typings predate RFC 9126, hence the cast.
    const metadata = (await this.metadataService.getMetadata()) as Partial<
      OidcMetadata
    > & { pushed_authorization_request_endpoint?: string };

    const endpoint = metadata.pushed_authorization_request_endpoint;
    if (!endpoint) {
      throw new Error(
        `${this.settings.authority} does not advertise a pushed_authorization_request_endpoint`
      );
    }
    return endpoint;
  }
}

/**
 * Explains an `invalid_client` rejection by checking the assertion against what
 * RFC 7523 §3 requires of a `private_key_jwt`. The authority reports only
 * "invalid_client" whether the claims are wrong or the signature does not verify
 * — but the claims can at least be checked here.
 */
function explainClientAuthFailure(assertion: string, clientId: string): string {
  const claims = decodeJwtPayload(assertion);
  if (!claims) {
    return "The client_assertion is not a well-formed JWT.";
  }

  // Claims RFC 7523 §3 requires outright.
  const violations: string[] = [];
  for (const claim of ["iss", "sub"]) {
    const value = claims[claim];
    if (value == null) {
      violations.push(`"${claim}" is missing (it must be "${clientId}")`);
    } else if (value !== clientId) {
      violations.push(`"${claim}" is "${String(value)}", not "${clientId}"`);
    }
  }
  if (claims.jti == null) violations.push('"jti" is missing');

  const now = Date.now();
  const iat = typeof claims.iat === "number" ? claims.iat * 1000 : undefined;
  const exp = typeof claims.exp === "number" ? claims.exp * 1000 : undefined;
  if (exp == null) violations.push('"exp" is missing');
  else if (exp <= now) violations.push('"exp" has passed');

  if (violations.length > 0) {
    return `The client_assertion does not meet RFC 7523 §3: ${violations.join(
      ", "
    )}.`;
  }

  // Claims that are technically present but that authorities commonly reject on
  // policy: an assertion is meant to be minted per request and live for minutes.
  const concerns: string[] = [];
  if (iat != null && now - iat > 10 * 60 * 1000) {
    concerns.push(`it was issued ${formatDuration(now - iat)} ago`);
  }
  if (iat != null && exp != null && exp - iat > 60 * 60 * 1000) {
    concerns.push(`it stays valid for ${formatDuration(exp - iat)}`);
  }
  if (concerns.length > 0) {
    return (
      `Every required claim is present, but ${concerns.join(" and ")}. ` +
      "Authorities routinely reject stale or long-lived assertions — mint a " +
      "fresh one per request with iat=now and exp a few minutes out."
    );
  }

  return (
    "The claims and timestamps all look right, so the authority most likely " +
    "could not verify the signature against the key registered for " +
    `"${clientId}".`
  );
}

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 90) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hours`;
  const days = Math.round(hours / 24);
  if (days < 730) return `${days} days`;
  return `${Math.round(days / 365)} years`;
}

/** Reads a JWT's claims without verifying it. Returns null if unreadable. */
function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  const segment = jwt.split(".")[1];
  if (!segment) return null;
  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

/**
 * Pulls the useful line out of an error body. The authority answers with
 * `application/problem+json` carrying a full server stack trace, which is not
 * something to put in front of a user.
 */
function describeError(body: string): string {
  try {
    const problem = JSON.parse(body) as Record<string, unknown>;
    for (const key of ["error_description", "error", "detail", "title"]) {
      const value = problem[key];
      if (typeof value === "string" && value) return value;
    }
  } catch {
    // Not JSON — fall through to the raw body.
  }
  return body.slice(0, 500);
}
