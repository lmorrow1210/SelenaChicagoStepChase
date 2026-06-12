"use client";

import Avatar, {
  COLORWAYS,
  SKIN_TONES,
  HAIR_COLORS,
} from "@selenas-chase/design-system/components/game/Avatar";
import type { ColorwayId } from "@selenas-chase/design-system/components/game/Avatar";
import StatCard from "@selenas-chase/design-system/components/core/StatCard";
import Badge from "@selenas-chase/design-system/components/core/Badge";
import Button from "@selenas-chase/design-system/components/core/Button";
import Slider from "@selenas-chase/design-system/components/forms/Slider";
import Skeleton from "@selenas-chase/design-system/components/feedback/Skeleton";
import Icon from "@selenas-chase/design-system/components/icons/Icon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "../../../lib/api";
import { useSession } from "../../../lib/session";

const COLORWAY_IDS = Object.keys(COLORWAYS) as ColorwayId[];

function colorwayFrom(n: number): ColorwayId {
  return COLORWAY_IDS[((n ?? 1) - 1) % COLORWAY_IDS.length];
}

interface Stats {
  total_steps_alltime: number;
  total_steps_this_week: number;
  city_wins: number;
  bingo_lines_alltime: number;
  current_streak: number;
}

interface EarnedBadge {
  id: string;
  code: string;
  label: string;
  description: string;
  quality: "bronze" | "silver" | "gold" | null;
  city_name: string | null;
  earned_at: string;
}

const QUALITY_COLOR: Record<string, string> = {
  bronze: "var(--bronze)",
  silver: "var(--silver)",
  gold: "var(--gold)",
};

function stepsToKm(steps: number): string {
  return (steps * 0.000762).toLocaleString(undefined, { maximumFractionDigits: 1 });
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--muted)",
  marginBottom: "var(--sp-2)",
};

const card: React.CSSProperties = {
  background: "var(--card)",
  borderRadius: "var(--r-card)",
  border: "1.5px solid var(--hairline)",
  padding: "var(--sp-4)",
};

function BadgeGrid({ badges }: { badges: EarnedBadge[] }) {
  if (!badges.length) {
    return (
      <div style={card}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)" }}>
          No badges yet — win a week, a bingo line, or a nemesis duel.
        </span>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--sp-2)" }}>
      {badges.map((b) => {
        const border = b.quality ? QUALITY_COLOR[b.quality] : "var(--hairline)";
        return (
          <div
            key={b.id}
            title={`${b.description}${b.city_name ? ` — ${b.city_name}` : ""}`}
            style={{
              ...card,
              border: `1.5px solid ${border}`,
              padding: "var(--sp-3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--sp-1)",
              textAlign: "center",
            }}
          >
            <span style={{ color: b.quality ? border : "var(--blue)" }}>
              <Icon name="badge" size={28} />
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--cream)" }}>
              {b.label}
            </span>
            {b.quality && (
              <Badge tone={b.quality === "gold" ? "gold" : b.quality}>{b.quality}</Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AvatarEditor({ onClose }: { onClose: () => void }) {
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
      onClose();
    },
  });

  const swatchRow = (
    label: string,
    options: string[],
    selected: number,
    onPick: (i: number) => void,
  ) => (
    <div>
      <div style={sectionTitle}>{label}</div>
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
              border:
                selected === i + 1 ? "2.5px solid var(--blue)" : "2px solid var(--hairline)",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit avatar"
      style={{
        position: "fixed",
        inset: 0,
        background: "color-mix(in srgb, var(--navy) 70%, transparent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "var(--z-overlay)" as unknown as number,
        padding: "var(--sp-4)",
      }}
      onClick={onClose}
    >
      <div
        style={{ ...card, maxWidth: 380, width: "100%", background: "var(--card-elevated)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--sp-4)" }}>
          <Avatar
            size={120}
            colorway={colorwayFrom(colorway)}
            skinTone={SKIN_TONES[(skin - 1) % SKIN_TONES.length]}
            hairColor={HAIR_COLORS[(hair - 1) % HAIR_COLORS.length]}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          {swatchRow("Skin tone", SKIN_TONES, skin, setSkin)}
          {swatchRow("Hair color", HAIR_COLORS, hair, setHair)}
          <div>
            <div style={sectionTitle}>Colorway</div>
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
                      colorway === i + 1
                        ? "2.5px solid var(--blue)"
                        : "2px solid var(--hairline)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
            <Button variant="ghost" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button fullWidth loading={save.isPending} onClick={() => save.mutate()}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, refresh } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState<number | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const stats = useQuery<Stats>({
    queryKey: ["users", "me", "stats"],
    queryFn: () => api<Stats>("/api/users/me/stats"),
    enabled: !!user,
    staleTime: 60_000,
  });
  const badges = useQuery<{ badges: EarnedBadge[] }>({
    queryKey: ["badges"],
    queryFn: () => api<{ badges: EarnedBadge[] }>("/api/badges"),
    enabled: !!user,
    staleTime: 60_000,
  });

  const saveTarget = useMutation({
    mutationFn: (weekly_step_target: number) =>
      api("/api/users/me", { method: "PATCH", body: JSON.stringify({ weekly_step_target }) }),
    onSuccess: async () => {
      await refresh();
      setTarget(null);
    },
  });

  const syncNow = useMutation({
    mutationFn: () => api("/api/sync/run", { method: "POST" }),
    onSuccess: async () => {
      setSyncMessage("Synced just now");
      await refresh();
      queryClient.invalidateQueries();
    },
    onError: (e) => {
      setSyncMessage(
        e instanceof ApiError && e.status === 429
          ? "Already synced recently — try again in a few minutes."
          : "Sync failed — try again.",
      );
    },
  });

  const disconnect = useMutation({
    mutationFn: () => api("/api/auth/fitbit", { method: "DELETE" }),
    onSuccess: () => refresh(),
  });

  const signOut = useMutation({
    mutationFn: () => api("/api/auth/logout", { method: "POST" }),
    onSuccess: async () => {
      await refresh();
      router.push("/login");
    },
  });

  if (!user) {
    return (
      <div style={{ padding: "var(--sp-6)" }}>
        <Skeleton preset="block" style={{ height: 120 }} />
      </div>
    );
  }

  const sliderValue = target ?? user.weekly_step_target;
  const targetDirty = target !== null && target !== user.weekly_step_target;

  return (
    <div
      style={{
        padding: "var(--sp-4) var(--sp-4) var(--sp-8)",
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sp-5)",
      }}
    >
      {/* Avatar showcase */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--sp-2)",
        }}
      >
        <Avatar
          size={120}
          colorway={colorwayFrom(user.avatar_colorway)}
          skinTone={SKIN_TONES[(user.avatar_skin - 1) % SKIN_TONES.length]}
          hairColor={HAIR_COLORS[(user.avatar_hair - 1) % HAIR_COLORS.length]}
        />
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--cream)",
            margin: 0,
          }}
        >
          {user.display_name}
        </h1>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          Edit avatar
        </Button>
      </div>

      {/* Stats row */}
      {stats.isLoading ? (
        <Skeleton preset="block" style={{ height: 88 }} />
      ) : stats.data ? (
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--sp-2)" }}
        >
          <StatCard
            icon="step"
            label="All-time"
            value={stepsToKm(stats.data.total_steps_alltime)}
            unit="km"
          />
          <StatCard
            icon="trophy"
            label="City wins"
            value={stats.data.city_wins}
            accent="var(--gold)"
          />
          <StatCard icon="bingo" label="Bingo lines" value={stats.data.bingo_lines_alltime} />
        </div>
      ) : null}

      {/* Badges */}
      <div>
        <div style={sectionTitle}>Badges</div>
        {badges.isLoading ? (
          <Skeleton preset="block" style={{ height: 100 }} />
        ) : (
          <BadgeGrid badges={badges.data?.badges ?? []} />
        )}
      </div>

      {/* Settings */}
      <div>
        <div style={sectionTitle}>Settings</div>
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <div>
            <Slider
              label="Weekly step target"
              min={35000}
              max={140000}
              step={1000}
              value={sliderValue}
              onChange={setTarget}
            />
            {targetDirty && (
              <Button
                size="sm"
                style={{ marginTop: "var(--sp-2)" }}
                loading={saveTarget.isPending}
                onClick={() => saveTarget.mutate(sliderValue)}
              >
                Save target
              </Button>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--sp-2)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--cream)" }}>
                Step sync
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>
                {syncMessage ??
                  (user.last_synced_at
                    ? `Last synced ${new Date(user.last_synced_at).toLocaleString()}`
                    : "Never synced")}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon="sync"
              loading={syncNow.isPending}
              onClick={() => syncNow.mutate()}
            >
              Sync now
            </Button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--sp-2)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--cream)" }}>
                Fitbit
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>
                {user.fitbit_connected ? "Connected" : "Not connected"}
              </span>
            </div>
            {user.fitbit_connected && (
              <Button
                variant="danger"
                size="sm"
                loading={disconnect.isPending}
                onClick={() => disconnect.mutate()}
              >
                Disconnect
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            fullWidth
            loading={signOut.isPending}
            onClick={() => signOut.mutate()}
          >
            Sign out
          </Button>
        </div>
      </div>

      {editing && <AvatarEditor onClose={() => setEditing(false)} />}
    </div>
  );
}
