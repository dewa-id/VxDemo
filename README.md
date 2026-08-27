# Verifier Demo

A demo application showing how to interact with the Verifier API.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm

### Installation

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
pnpm build
```

## Login flows

The login page offers two ways to start the same authorization code flow:

| Button | Flow |
| --- | --- |
| **Sign in with e-Boks ID** | Plain code flow — all request parameters travel in the redirect URL. |
| **Sign in with PAR** | Pushed Authorization Request ([RFC 9126](https://www.rfc-editor.org/rfc/rfc9126.html)) — parameters are POSTed to the authority first, and the redirect carries only `client_id` and `request_uri`. |

### How the PAR flow is wired

`oidc-client-ts` has no built-in PAR support, so [`ParUserManager`](src/ParUserManager.ts)
subclasses `UserManager` and adds `signinRedirectWithPar`. It:

1. builds the authorization request the library would normally redirect to —
   which also persists the signin state (`state`, `nonce`, PKCE `code_verifier`);
2. POSTs that request's parameters, plus the client assertion, to the
   `pushed_authorization_request_endpoint` from the authority's discovery
   document;
3. redirects to the authorization endpoint with only `client_id` and the
   returned `request_uri`.

Because the pushed parameters are the ones the library generated itself,
everything after the redirect — state lookup, PKCE, nonce validation and the
code exchange — keeps working unchanged. The client assertion is also sent with
the code exchange, since the authority requires client authentication at both
endpoints.

The parameters that only the PAR flow sends live in
[`src/parConfig.ts`](src/parConfig.ts).

### Client authentication

The PAR endpoint rejects unauthenticated pushes, so the flow needs a
`client_assertion` (`private_key_jwt`) that is valid for the configured
`client_id`. Per [RFC 7523 §3](https://www.rfc-editor.org/rfc/rfc7523.html#section-3)
the assertion must be signed with the private key registered for that client and
carry these claims:

```jsonc
{
  "iss": "<client_id>",             // both iss and sub are the client_id
  "sub": "<client_id>",
  "aud": "https://pp.verify-id.eu",    // the authority's issuer
  "jti": "<unique id>",             // replay protection
  "iat": 1700000000,
  "exp": 1700000300
}
```

Get any of these wrong and the authority answers a bare `invalid_client` for all
of them alike, so `ParUserManager` decodes the assertion on rejection and says
which claim is at fault.

The assertion is a literal in [`src/parConfig.ts`](src/parConfig.ts), overridable
per environment with `VITE_CLIENT_ASSERTION` in a git-ignored `.env.local`.

⚠️ **A literal assertion is a long-lived credential in a public bundle.** Anyone
who loads the page can authenticate as this client until it expires, so keep this
to a throwaway demo client. A production client signs a short-lived assertion per
request, server-side — which also means it pushes server-side, and the browser
never sees a credential at all.

Two consequences of hardcoding worth knowing: the same assertion is reused for
the push and the code exchange, so an authority that enforces one-time `jti`
would reject the second call; and the assertion has to be replaced by hand when
it expires.

Note that `client_id` in [`src/auth.ts`](src/auth.ts) is shared by both buttons,
so it has to be a client that is registered for the standard flow *and* whose
assertion the PAR endpoint accepts.
