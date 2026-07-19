"use client";

import SelenaMark from "@one-step-ahead/design-system/components/game/SelenaMark";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "../../../lib/api";
import { DEMO } from "../../../lib/demo";
import { withBase } from "../../../lib/links";
import { useSession } from "../../../lib/session";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SHOW_DEV_LOGIN = process.env.NODE_ENV !== "production";

/* Faint phosphor scanlines — same texture the Sidebar CRT well uses */
const SCANLINES =
  "repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.16) 2px, rgba(0,0,0,0.16) 3px)";

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
      {/* The front door is a small field terminal: molded tan case
          housing a phosphor CRT, same fiction as the game chrome. */}
      <section className="case" aria-label="Sign in">
        <div className="crt">
          <p className="eyebrow">[ Loop Bureau · Field Terminal ]</p>
          <div className="wanted" aria-hidden="true">
            <SelenaMark size={72} />
            <span className="wantedStamp">At large</span>
          </div>
          <h1>Catch Selena</h1>
          <p className="brief">
            She&apos;s one step ahead — a new city every week. Connect your step
            tracker, out-walk her with your team, and decode the trail she
            leaves behind.
          </p>
          {DEMO ? (
            <a className="primaryAction" href={withBase("/map")}>
              Enter the demo
            </a>
          ) : (
            <a className="primaryAction" href={`${API}/api/auth/google`}>
              Sign in with Google
            </a>
          )}

          {!DEMO && SHOW_DEV_LOGIN && (
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
          {/* Phosphor vignette — tube falloff, no flicker */}
          <div className="tubeShade" aria-hidden="true" />
        </div>
        <footer className="caseFoot" aria-hidden="true">
          <span className="fastener" />
          <span className="engraving">ONE STEP AHEAD · MODEL OSA/86</span>
          <span className="fastener" />
        </footer>
      </section>

      <style jsx>{`
        .loginPage {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          padding: var(--sp-5);
          background:
            radial-gradient(120% 80% at 50% 0%, rgba(var(--phosphor-glow), 0.05), transparent 62%),
            var(--screen-base);
        }

        .case {
          width: min(100%, 440px);
          padding: 10px 10px 6px;
          background: linear-gradient(180deg, var(--tan-300) 0%, var(--tan-400) 12%, var(--tan-400) 78%, var(--tan-500) 100%);
          border: 1px solid var(--case-shadow);
          box-shadow: var(--bevel-raised-shadow), var(--shadow-modal);
          text-shadow: none; /* the tan chassis is matte */
        }

        .crt {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: var(--sp-4);
          padding: var(--sp-5);
          background: var(--screen-700);
          background-image: ${SCANLINES};
          box-shadow: var(--screen-inset-shadow);
          text-shadow: var(--text-glow); /* the tube glows */
        }

        .tubeShade {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at 50% 40%, transparent 62%, rgba(0, 0, 0, 0.4) 100%);
        }

        .eyebrow {
          margin: var(--sp-0);
          font-family: var(--font-mono);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--phosphor-dim);
        }

        .wanted {
          position: relative;
          align-self: center;
          display: grid;
          place-items: center;
          width: 112px;
          height: 112px;
          background: radial-gradient(circle at 50% 35%, var(--screen-600), var(--screen-base) 85%);
          border: 1px solid var(--grid-line);
        }

        .wantedStamp {
          position: absolute;
          right: -14px;
          bottom: 8px;
          transform: rotate(-8deg);
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--signal-red);
          border: 1.5px solid var(--signal-red);
          padding: 1px 6px;
          background: rgba(0, 0, 0, 0.35);
        }

        h1 {
          margin: var(--sp-0);
          font-family: var(--font-display);
          font-size: var(--fs-display);
          line-height: var(--lh-display);
          text-transform: uppercase;
          text-align: center;
          color: var(--phosphor);
        }

        .brief {
          margin: var(--sp-0);
          text-align: center;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          line-height: 1.5;
          color: var(--phosphor-dim);
        }

        .primaryAction,
        button {
          min-height: var(--touch-min);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          padding: var(--sp-2) var(--sp-4);
          /* lit key: bright top lip over a dark seat, matte label */
          background: linear-gradient(180deg, var(--phosphor-hot), var(--phosphor));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.35),
            inset 0 -2px 0 rgba(0, 0, 0, 0.35),
            var(--shadow-card);
          color: var(--screen-base);
          font: inherit;
          font-weight: var(--fw-bold);
          text-shadow: none;
          cursor: pointer;
          transition: filter var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
        }

        .primaryAction:hover,
        button:hover:not(:disabled) {
          filter: brightness(1.08);
        }

        .primaryAction:active,
        button:active:not(:disabled) {
          transform: translateY(1px);
          box-shadow:
            inset 0 2px 3px rgba(0, 0, 0, 0.4),
            var(--shadow-card);
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
          border-top: 1px solid var(--grid-line);
        }

        label {
          display: flex;
          flex-direction: column;
          gap: var(--sp-1);
          color: var(--phosphor-dim);
          font-size: var(--fs-body-sm);
          font-weight: var(--fw-medium);
        }

        input {
          min-height: var(--touch-min);
          border: 1px solid var(--grid-line);
          padding: var(--sp-2) var(--sp-3);
          background: var(--screen-base);
          color: var(--phosphor);
          font: inherit;
        }

        .error {
          margin: var(--sp-0);
          color: var(--signal-red);
          font-size: var(--fs-body-sm);
        }

        .caseFoot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--sp-2);
          padding: 4px 2px 0;
        }

        .fastener {
          width: 5px;
          height: 5px;
          flex: none;
          background: var(--tan-500);
          box-shadow: inset 0.5px 0.5px 1px var(--case-shadow), 0 1px 0 rgba(241, 231, 204, 0.4);
        }

        .engraving {
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 0.22em;
          white-space: nowrap;
          color: var(--case-700);
          text-shadow: 0 1px 0 rgba(241, 231, 204, 0.45);
        }
      `}</style>
    </main>
  );
}
