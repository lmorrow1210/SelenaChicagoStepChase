"use client";

import { BingoTile } from "@one-step-ahead/design-system/components/game/BingoTile";
import Avatar from "@one-step-ahead/design-system/components/game/Avatar";
import type { ColorwayId } from "@one-step-ahead/design-system/components/game/Avatar";
import EmptyState from "@one-step-ahead/design-system/components/feedback/EmptyState";
import Skeleton from "@one-step-ahead/design-system/components/feedback/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useSession } from "../../../lib/session";
import { SundayCountdown } from "../../../lib/SundayCountdown";

const COLORWAYS: ColorwayId[] = ["chicago", "midnight", "emerald", "crimson", "desert", "violet"];

function colorwayFrom(n: number): ColorwayId {
  return COLORWAYS[((n ?? 1) - 1) % COLORWAYS.length];
}

type TileState = "incomplete" | "in_progress" | "complete";

interface EnrichedTile {
  challenge_id?: number;
  free?: true;
  state: TileState;
  label: string;
  icon: string;
  category?: string;
  completed_at?: string | null;
}

/* Map challenge categories onto the three operational vectors (§9D). */
function vectorTint(category?: string): "step" | "routine" | "biometric" | undefined {
  if (!category) return undefined;
  if (category === "steps" || category === "wildcard") return "step";
  if (category === "workout" || category === "social") return "routine";
  if (category === "sleep" || category === "heart") return "biometric";
  return undefined;
}

/* All 12 bingo lines on a 5×5 card (rows, cols, 2 diagonals). */
const LINES: number[][] = [
  ...Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => r * 5 + c)),
  ...Array.from({ length: 5 }, (_, c) => Array.from({ length: 5 }, (_, r) => r * 5 + c)),
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

/* Indices of incomplete tiles that are the LAST missing tile in some line —
   these glow (§9D: "Glow any line one tile from completion"). */
function nearWinTiles(tiles: EnrichedTile[]): Set<number> {
  const isDone = (i: number) => tiles[i]?.free || tiles[i]?.state === "complete";
  const hot = new Set<number>();
  for (const line of LINES) {
    const missing = line.filter((i) => !isDone(i));
    if (missing.length === 1) hot.add(missing[0]);
  }
  return hot;
}

interface BingoPayload {
  card: {
    id: string;
    tiles: EnrichedTile[];
    bingo_lines: number;
    blackout: boolean;
    frozen: boolean;
  };
  friends: {
    id: string;
    display_name: string;
    avatar_skin: number;
    avatar_hair: number;
    avatar_colorway: number;
    bingo_lines: number;
    blackout: boolean;
  }[];
}

function useBingoData(enabled: boolean) {
  return useQuery<BingoPayload>({
    queryKey: ["bingo", "current"],
    queryFn: () => api<BingoPayload>("/api/bingo/current"),
    enabled,
    staleTime: 60_000,
  });
}

function BingoGrid({ tiles, frozen }: { tiles: EnrichedTile[]; frozen: boolean }) {
  const hot = nearWinTiles(tiles);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "var(--sp-2)",
        opacity: frozen ? 0.7 : 1,
      }}
    >
      {tiles.map((tile, idx) => (
        <BingoTile
          key={tile.free ? "free" : (tile.challenge_id ?? idx)}
          label={tile.label}
          icon={tile.icon as any}
          state={tile.free ? "free" : tile.state === "in_progress" ? "progress" : (tile.state as any)}
          tint={vectorTint(tile.category)}
          highlight={!frozen && hot.has(idx)}
        />
      ))}
    </div>
  );
}

function BingoStatus({
  lines,
  blackout,
  frozen,
}: {
  lines: number;
  blackout: boolean;
  frozen: boolean;
}) {
  if (blackout) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "var(--sp-3) var(--sp-4)",
          background: "var(--amber-20)",
          borderRadius: "var(--r-card)",
          border: "1px solid var(--amber)",
          boxShadow: "var(--glow-live)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 22,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--amber)",
          }}
        >
          Blackout!
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--manila)", marginTop: 4 }}>
          All 25 tiles complete — legendary week.
        </div>
      </div>
    );
  }

  if (lines > 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--sp-2) var(--sp-3)",
          background: "var(--amber-12)",
          borderRadius: "var(--r-tight)",
          border: "1px solid var(--amber-40)",
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--amber)" }}>
          {lines === 1 ? "1 line cleared" : `${lines} lines cleared`}
        </span>
        {frozen && (
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--bone-dim)" }}>
            Card frozen
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "var(--sp-2) var(--sp-3)",
        background: "var(--ink-800)",
        borderRadius: "var(--r-tight)",
        boxShadow: "var(--screen-inset-shadow)",
      }}
    >
      <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--bone-dim)" }}>
        {frozen
          ? "Card frozen — final state."
          : "Clear a full row, column, or diagonal to report a line."}
      </span>
    </div>
  );
}

function FriendRow({ friend }: { friend: BingoPayload["friends"][number] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sp-3)",
        padding: "var(--sp-2) 0",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <Avatar size={32} colorway={colorwayFrom(friend.avatar_colorway)} />
      <span
        style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--cream)" }}
      >
        {friend.display_name}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: friend.bingo_lines > 0 ? "var(--blue)" : "var(--muted)",
        }}
      >
        {friend.blackout
          ? "BLACKOUT"
          : friend.bingo_lines > 0
            ? `${friend.bingo_lines}× bingo`
            : "—"}
      </span>
    </div>
  );
}

export default function BingoPage() {
  const { user } = useSession();
  const { data, isLoading, error } = useBingoData(!!user?.group_id);

  if (!user?.group_id) {
    return (
      <div style={{ padding: "var(--sp-6)" }}>
        <EmptyState
          icon="globe"
          title="No group yet"
          body="Join or create a group to get your bingo card."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          padding: "var(--sp-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--sp-4)",
        }}
      >
        <Skeleton preset="block" style={{ height: 28, width: 140 }} />
        <Skeleton preset="bingo" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "var(--sp-6)" }}>
        <EmptyState
          icon="globe"
          title="Couldn't load your card"
          body="Try syncing your steps first."
        />
      </div>
    );
  }

  const { card, friends } = data;

  return (
    <div
      style={{
        padding: "var(--sp-4) var(--sp-4) var(--sp-8)",
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sp-4)",
      }}
    >
      <div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "var(--fs-label)",
            letterSpacing: "var(--ls-label)",
            textTransform: "uppercase",
            color: "var(--bone-dim)",
            margin: 0,
          }}
        >
          [ Operational matrix ]
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 30,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            color: "var(--bone)",
            margin: "2px 0 0",
          }}
        >
          Bingo
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--bone-dim)",
            margin: "var(--sp-1) 0 0",
          }}
        >
          Clear field objectives to fill the card. New card every Monday.
        </p>
        <SundayCountdown style={{ marginTop: "var(--sp-2)" }} />
      </div>

      <BingoStatus lines={card.bingo_lines} blackout={card.blackout} frozen={card.frozen} />

      <BingoGrid tiles={card.tiles} frozen={card.frozen} />

      {friends.length > 0 && (
        <div
          style={{
            background: "var(--card)",
            borderRadius: "var(--r-card)",
            border: "1.5px solid var(--hairline)",
            padding: "var(--sp-3) var(--sp-4)",
          }}
        >
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
            Group
          </div>
          {friends.map((friend) => (
            <FriendRow key={friend.id} friend={friend} />
          ))}
        </div>
      )}
    </div>
  );
}
