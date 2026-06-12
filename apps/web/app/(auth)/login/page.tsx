"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "../../../lib/api";
import { useSession } from "../../../lib/session";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SHOW_DEV_LOGIN = process.env.NODE_ENV !== "production";

export default function LoginPage() {
  const router = useRouter();
  const session = useSession();
  const [email, setEmail] = useState("player@example.test");
  const [displayName, setDisplayName] = useState("Player");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function devLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api("/api/auth/dev-login", {
        method: "POST",
        body: JSON.stringify({ email, display_name: displayName }),
      });
      await session.refresh();
      router.push("/onboarding");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="loginPage">
      <section className="loginPanel">
        <p className="eyebrow">Selena&apos;s Chase</p>
        <h1>Catch Selena</h1>
        <a className="primaryAction" href={`${API}/api/auth/google`}>
          Sign in with Google
        </a>

        {SHOW_DEV_LOGIN && (
          <form className="devForm" onSubmit={devLogin}>
            <label>
              Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
            </label>
            <label>
              Display name
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </label>
            {error && <p className="error">{error}</p>}
            <button disabled={submitting} type="submit">
              {submitting ? "Signing in" : "Local test sign-in"}
            </button>
          </form>
        )}
      </section>

      <style jsx>{`
        .loginPage {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          padding: var(--sp-5);
          background:
            radial-gradient(circle at center top, var(--map-ocean-2), transparent 34%),
            var(--navy);
        }

        .loginPanel {
          width: min(100%, 420px);
          display: flex;
          flex-direction: column;
          gap: var(--sp-4);
          padding: var(--sp-5);
          border: 1px solid var(--hairline);
          border-radius: var(--r-card);
          background: var(--card);
          box-shadow: var(--shadow-elevated);
        }

        .eyebrow {
          margin: var(--sp-0);
          font-family: var(--font-body);
          font-size: var(--fs-label);
          font-weight: var(--fw-medium);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--blue);
        }

        h1 {
          margin: var(--sp-0);
          font-family: var(--font-display);
          font-size: var(--fs-display);
          line-height: var(--lh-display);
          text-transform: uppercase;
          color: var(--cream);
        }

        .primaryAction,
        button {
          min-height: var(--touch-min);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: var(--r-pill);
          padding: var(--sp-2) var(--sp-4);
          background: var(--blue);
          color: var(--navy);
          font: inherit;
          font-weight: var(--fw-bold);
          cursor: pointer;
        }

        button:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .devForm {
          display: flex;
          flex-direction: column;
          gap: var(--sp-3);
          padding-top: var(--sp-4);
          border-top: 1px solid var(--hairline);
        }

        label {
          display: flex;
          flex-direction: column;
          gap: var(--sp-1);
          color: var(--muted);
          font-size: var(--fs-body-sm);
          font-weight: var(--fw-medium);
        }

        input {
          min-height: var(--touch-min);
          border: 1px solid var(--hairline);
          border-radius: var(--r-card);
          padding: var(--sp-2) var(--sp-3);
          background: var(--navy);
          color: var(--cream);
          font: inherit;
        }

        .error {
          margin: var(--sp-0);
          color: var(--red);
          font-size: var(--fs-body-sm);
        }
      `}</style>
    </main>
  );
}
