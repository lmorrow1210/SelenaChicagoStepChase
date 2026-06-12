"use client";

import Avatar, {
  COLORWAYS,
  SKIN_TONES,
  HAIR_COLORS,
} from "@selenas-chase/design-system/components/game/Avatar";
import type { ColorwayId } from "@selenas-chase/design-system/components/game/Avatar";
import Button from "@selenas-chase/design-system/components/core/Button";
import Slider from "@selenas-chase/design-system/components/forms/Slider";
import Input from "@selenas-chase/design-system/components/forms/Input";
import Icon from "@selenas-chase/design-system/components/icons/Icon";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError, API_BASE } from "../../../lib/api";
import { useSession } from "../../../lib/session";

const COLORWAY_IDS = Object.keys(COLORWAYS) as ColorwayId[];

function colorwayFrom(n: number): ColorwayId {
  return COLORWAY_IDS[((n ?? 1) - 1) % COLORWAY_IDS.length];
}

const STEPS = ["connect", "target", "avatar", "group"] as const;
type Step = (typeof STEPS)[number];

const STEP_TITLES: Record<Step, string> = {
  connect: "Connect your steps",
  target: "Set your weekly target",
  avatar: "Build your detective",
  group: "Find your crew",
};

const panel: React.CSSProperties = {
  width: "min(100%, 460px)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--sp-4)",
  padding: "var(--sp-5)",
  border: "1px solid var(--hairline)",
  borderRadius: "var(--r-card)",
  background: "var(--card)",
};

const page: React.CSSProperties = {
  minHeight: "100dvh",
  display: "grid",
  placeItems: "center",
  padding: "var(--sp-5)",
  background: "var(--navy)",
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-body)",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--blue)",
};

const heading: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: 28,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--cream)",
};

const bodyText: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-body)",
  fontSize: 14,
  color: "var(--muted)",
  lineHeight: 1.5,
};

function StepDots({ current }: { current: Step }) {
  return (
    <div style={{ display: "flex", gap: "var(--sp-2)" }} aria-label={`Step ${STEPS.indexOf(current) + 1} of ${STEPS.length}`}>
      {STEPS.map((s) => (
        <span
          key={s}
          style={{
            width: STEPS.indexOf(s) === STEPS.indexOf(current) ? 24 : 8,
            height: 8,
            borderRadius: "var(--r-pill)",
            background:
              STEPS.indexOf(s) <= STEPS.indexOf(current) ? "var(--blue)" : "var(--hairline)",
            transition: "width 200ms",
          }}
        />
      ))}
    </div>
  );
}

function ConnectStep({ onNext }: { onNext: () => void }) {
  const { user } = useSession();
  const connected = !!user?.fitbit_connected;
  return (
    <>
      <p style={bodyText}>
        Selena tracks your group by your daily steps. Connect your Google account&apos;s
        health data so your walks count. You can skip this and connect later from your
        profile — until then your steps show as zero.
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sp-3)",
          padding: "var(--sp-3) var(--sp-4)",
          background: connected ? "var(--blue-12)" : "var(--navy)",
          border: `1.5px solid ${connected ? "var(--blue-40)" : "var(--hairline)"}`,
          borderRadius: "var(--r-card)",
        }}
      >
        <span style={{ color: connected ? "var(--blue)" : "var(--muted)" }}>
          <Icon name={connected ? "check" : "sync"} size={24} />
        </span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--cream)" }}>
          {connected ? "Health data connected" : "Not connected yet"}
        </span>
      </div>
      {!connected && (
        <Button
          fullWidth
          icon="sync"
          onClick={() => {
            window.location.href = `${API_BASE}/api/auth/google`;
          }}
        >
          Connect with Google
        </Button>
      )}
      <Button variant={connected ? "primary" : "ghost"} fullWidth onClick={onNext}>
        {connected ? "Continue" : "Skip for now"}
      </Button>
    </>
  );
}

function TargetStep({ onNext }: { onNext: () => void }) {
  const { user, refresh } = useSession();
  const [target, setTarget] = useState(user?.weekly_step_target ?? 70000);
  const save = useMutation({
    mutationFn: () =>
      api("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ weekly_step_target: target }),
      }),
    onSuccess: async () => {
      await refresh();
      onNext();
    },
  });
  return (
    <>
      <p style={bodyText}>
        How many steps will you walk in a week? Your group&apos;s combined target sets the
        pace of the chase — be honest, you can adjust it later.
      </p>
      <Slider
        label="Weekly step target"
        min={35000}
        max={140000}
        step={1000}
        value={target}
        onChange={setTarget}
      />
      <p style={{ ...bodyText, fontFamily: "var(--font-mono)" }}>
        ≈ {Math.round(target / 7).toLocaleString()} steps a day
      </p>
      <Button fullWidth loading={save.isPending} onClick={() => save.mutate()}>
        Continue
      </Button>
    </>
  );
}

function AvatarStep({ onNext }: { onNext: () => void }) {
  const { user, refresh } = useSession();
  const [skin, setSkin] = useState(user?.avatar_skin ?? 1);
  const [hair, setHair] = useState(user?.avatar_hair ?? 1);
  const [colorway, setColorway] = useState(user?.avatar_colorway ?? 1);
  const save = useMutation({
    mutationFn: () =>
      api("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          avatar_skin: skin,
          avatar_hair: hair,
          avatar_colorway: colorway,
        }),
      }),
    onSuccess: async () => {
      await refresh();
      onNext();
    },
  });

  const swatchRow = (
    label: string,
    options: string[],
    selected: number,
    onPick: (i: number) => void,
  ) => (
    <div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--muted)",
          marginBottom: "var(--sp-2)",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
        {options.map((color, i) => (
          <button
            key={color}
            type="button"
            aria-label={`${label} ${i + 1}`}
            onClick={() => onPick(i + 1)}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: color,
              border: selected === i + 1 ? "2.5px solid var(--blue)" : "2px solid var(--hairline)",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Avatar
          size={120}
          colorway={colorwayFrom(colorway)}
          skinTone={SKIN_TONES[(skin - 1) % SKIN_TONES.length]}
          hairColor={HAIR_COLORS[(hair - 1) % HAIR_COLORS.length]}
        />
      </div>
      {swatchRow("Skin tone", SKIN_TONES, skin, setSkin)}
      {swatchRow("Hair color", HAIR_COLORS, hair, setHair)}
      <div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--muted)",
            marginBottom: "var(--sp-2)",
          }}
        >
          Colorway
        </div>
        <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
          {COLORWAY_IDS.map((id, i) => (
            <button
              key={id}
              type="button"
              aria-label={COLORWAYS[id].label}
              onClick={() => setColorway(i + 1)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: COLORWAYS[id].coat,
                border:
                  colorway === i + 1 ? "2.5px solid var(--blue)" : "2px solid var(--hairline)",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
      <Button fullWidth loading={save.isPending} onClick={() => save.mutate()}>
        Continue
      </Button>
    </>
  );
}

function GroupStep() {
  const router = useRouter();
  const { group, refresh } = useSession();
  const [groupName, setGroupName] = useState("Chicago Chasers");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () =>
      api("/api/groups", { method: "POST", body: JSON.stringify({ name: groupName }) }),
    onSuccess: async () => {
      await refresh();
      router.push("/map");
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Group creation failed"),
  });
  const join = useMutation({
    mutationFn: () =>
      api("/api/groups/join", {
        method: "POST",
        body: JSON.stringify({ invite_code: inviteCode.toUpperCase() }),
      }),
    onSuccess: async () => {
      await refresh();
      router.push("/map");
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Join failed"),
  });

  if (group) {
    return (
      <>
        <p style={bodyText}>You&apos;re already in {group.name}.</p>
        <Button fullWidth onClick={() => router.push("/map")}>
          Open map
        </Button>
      </>
    );
  }

  return (
    <>
      <p style={bodyText}>
        The chase is a team sport — 2 to 8 players. Start a group and share the invite
        code, or enter a code from a friend.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
        <Input
          label="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <Button fullWidth loading={create.isPending} onClick={() => create.mutate()}>
          Create group
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--sp-2)",
          paddingTop: "var(--sp-4)",
          borderTop: "1px solid var(--hairline)",
        }}
      >
        <Input
          label="Invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 6))}
        />
        <Button
          variant="secondary"
          fullWidth
          loading={join.isPending}
          onClick={() => join.mutate()}
        >
          Join group
        </Button>
      </div>
      {error && (
        <p style={{ ...bodyText, color: "var(--red)" }} role="alert">
          {error}
        </p>
      )}
    </>
  );
}

export default function OnboardingStepPage() {
  const router = useRouter();
  const params = useParams<{ step: string }>();
  const session = useSession();

  const step = (STEPS as readonly string[]).includes(params.step)
    ? (params.step as Step)
    : "connect";
  const next = () => {
    const i = STEPS.indexOf(step);
    router.push(`/onboarding/${STEPS[Math.min(i + 1, STEPS.length - 1)]}`);
  };

  if (session.loading) {
    return <main style={page} />;
  }

  if (!session.user) {
    return (
      <main style={page}>
        <section style={panel}>
          <p style={eyebrow}>Selena&apos;s Chase</p>
          <h1 style={heading}>Sign in first</h1>
          <Button fullWidth onClick={() => router.push("/login")}>
            Continue
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main style={page}>
      <section style={panel}>
        <StepDots current={step} />
        <p style={eyebrow}>
          Step {STEPS.indexOf(step) + 1} of {STEPS.length}
        </p>
        <h1 style={heading}>{STEP_TITLES[step]}</h1>
        {step === "connect" && <ConnectStep onNext={next} />}
        {step === "target" && <TargetStep onNext={next} />}
        {step === "avatar" && <AvatarStep onNext={next} />}
        {step === "group" && <GroupStep />}
      </section>
    </main>
  );
}
