"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "../../lib/api";
import { useSession } from "../../lib/session";

export default function OnboardingPage() {
  const router = useRouter();
  const session = useSession();
  const [groupName, setGroupName] = useState("Chicago Chasers");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"create" | "join" | null>(null);

  async function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting("create");
    setError(null);
    try {
      await api("/api/groups", {
        method: "POST",
        body: JSON.stringify({ name: groupName }),
      });
      await session.refresh();
      router.push("/map");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Group creation failed");
    } finally {
      setSubmitting(null);
    }
  }

  async function joinGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting("join");
    setError(null);
    try {
      await api("/api/groups/join", {
        method: "POST",
        body: JSON.stringify({ invite_code: inviteCode.toUpperCase() }),
      });
      await session.refresh();
      router.push("/map");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Join failed");
    } finally {
      setSubmitting(null);
    }
  }

  if (session.loading) {
    return (
      <main className="onboardingPage">
        <section className="onboardingPanel">
          <p className="eyebrow">Loading</p>
        </section>
        <OnboardingStyles />
      </main>
    );
  }

  if (!session.user) {
    return (
      <main className="onboardingPage">
        <section className="onboardingPanel">
          <p className="eyebrow">Selena&apos;s Chase</p>
          <h1>Sign in first</h1>
          <a className="primaryAction" href="/login">
            Continue
          </a>
        </section>
        <OnboardingStyles />
      </main>
    );
  }

  if (session.group) {
    return (
      <main className="onboardingPage">
        <section className="onboardingPanel">
          <p className="eyebrow">You&apos;re in</p>
          <h1>{session.group.name}</h1>
          <a className="primaryAction" href="/map">
            Open map
          </a>
        </section>
        <OnboardingStyles />
      </main>
    );
  }

  return (
    <main className="onboardingPage">
      <section className="onboardingPanel">
        <p className="eyebrow">Welcome, {session.user.display_name}</p>
        <h1>Start the chase</h1>

        <form className="stack" onSubmit={createGroup}>
          <label>
            Group name
            <input value={groupName} onChange={(event) => setGroupName(event.target.value)} />
          </label>
          <button disabled={submitting !== null} type="submit">
            {submitting === "create" ? "Creating" : "Create group"}
          </button>
        </form>

        <form className="stack divider" onSubmit={joinGroup}>
          <label>
            Invite code
            <input
              value={inviteCode}
              maxLength={6}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
            />
          </label>
          <button disabled={submitting !== null} type="submit">
            {submitting === "join" ? "Joining" : "Join group"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </section>
      <OnboardingStyles />
    </main>
  );
}

function OnboardingStyles() {
  return (
    <style jsx global>{`
      .onboardingPage {
        min-height: 100dvh;
        display: grid;
        place-items: center;
        padding: var(--sp-5);
        background:
          radial-gradient(circle at center top, var(--map-land-green), transparent 30%),
          var(--navy);
      }

      .onboardingPanel {
        width: min(100%, 460px);
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
        font-size: var(--fs-h1);
        line-height: var(--lh-heading);
        text-transform: uppercase;
        color: var(--cream);
      }

      .stack {
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
      }

      .divider {
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

      button,
      .primaryAction {
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

      .error {
        margin: var(--sp-0);
        color: var(--red);
        font-size: var(--fs-body-sm);
      }
    `}</style>
  );
}
