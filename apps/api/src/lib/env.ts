// Boot-time environment check. Several security properties hang on
// NODE_ENV === "production" (Secure cookies, /api/auth/dev-login disabled,
// real-vs-mock Health client default). Railway does not set NODE_ENV for you,
// so a forgotten variable used to fail OPEN: the app ran, but anyone could
// sign in as anyone through dev-login. This turns that into a refusal to
// start, with a message that says what to fix.
//
// Never prints a variable's value — names only.

type Env = Record<string, string | undefined>;

const DEPLOY_MARKERS = [
  "RAILWAY_ENVIRONMENT",
  "RAILWAY_ENVIRONMENT_NAME",
  "RAILWAY_PROJECT_ID",
  "RAILWAY_SERVICE_ID",
  "VERCEL",
  "FLY_APP_NAME",
  "RENDER",
] as const;

function isLocalUrl(value: string): boolean {
  try {
    const host = new URL(value).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".local");
  } catch {
    return false;
  }
}

function isHttpsUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Returns human-readable problems; empty = safe to start. */
export function environmentProblems(env: Env = process.env): string[] {
  const problems: string[] = [];
  const mode = env.NODE_ENV;

  if (mode === "test") return problems;

  if (mode !== "production") {
    const marker = DEPLOY_MARKERS.find((name) => env[name]);
    const publicOrigin = [env.WEB_ORIGIN, env.GOOGLE_REDIRECT_URI].some(
      (v) => v !== undefined && isHttpsUrl(v) && !isLocalUrl(v),
    );
    if (marker || publicOrigin) {
      problems.push(
        `NODE_ENV is "${mode ?? "(unset)"}" but this looks like a deployed server ` +
          `(${marker ? `${marker} is set` : "WEB_ORIGIN / GOOGLE_REDIRECT_URI is a public https URL"}). ` +
          `Set NODE_ENV=production — without it the dev-login back door is open and cookies are not Secure.`,
      );
    }
    return problems;
  }

  if (!env.DATABASE_URL) problems.push("DATABASE_URL is required.");
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    problems.push("JWT_SECRET must be at least 32 characters (openssl rand -hex 32).");
  }
  if (!env.TOKEN_ENC_KEY || !/^[0-9a-fA-F]{64}$/.test(env.TOKEN_ENC_KEY)) {
    problems.push("TOKEN_ENC_KEY must be exactly 64 hex characters (openssl rand -hex 32).");
  }
  if (!isHttpsUrl(env.WEB_ORIGIN)) {
    problems.push("WEB_ORIGIN must be the web app's https origin (e.g. https://app.yourdomain.com).");
  } else if (env.WEB_ORIGIN!.endsWith("/")) {
    problems.push("WEB_ORIGIN must not end with a slash (CORS compares it exactly).");
  }
  for (const name of ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] as const) {
    if (!env[name]) problems.push(`${name} is required.`);
  }
  if (!isHttpsUrl(env.GOOGLE_REDIRECT_URI)) {
    problems.push("GOOGLE_REDIRECT_URI must be the https callback URL registered in Google Cloud.");
  }
  if (env.HEALTH_API_MODE !== "mock" && env.HEALTH_API_MODE !== "real") {
    problems.push(
      'HEALTH_API_MODE must be set explicitly to "mock" or "real" (unset would silently mean real).',
    );
  }
  return problems;
}

/** Throws with every problem listed. Call once before listening. */
export function assertSafeEnvironment(env: Env = process.env): void {
  const problems = environmentProblems(env);
  if (problems.length) {
    throw new Error(`Refusing to start — fix these environment variables:\n- ${problems.join("\n- ")}`);
  }
}
