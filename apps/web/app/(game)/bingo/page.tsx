"use client";

import { BingoTile } from "@selenas-chase/design-system/components/game/BingoTile";
import Avatar from "@selenas-chase/design-system/components/game/Avatar";
import type { ColorwayId } from "@selenas-chase/design-system/components/game/Avatar";
import EmptyState from "@selenas-chase/design-system/components/feedback/EmptyState";
import Skeleton from "@selenas-chase/design-system/components/feedback/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useSession } from "../../../lib/session";

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
  completed_at?: string | null;
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
          state={tile.free ? "free" : (tile.state as any)}
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
          background: "var(--gold-20)",
          borderRadius: "var(--r-card)",
          border: "1.5px solid var(--gold)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--gold)",
          }}
        >
          Blackout!
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
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
          padding: "var(--sp-3) var(--sp-4)",
          background: "var(--blue-20)",
          borderRadius: "var(--r-card)",
          border: "1.5px solid var(--blue-40)",
        }}
      >
        <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--cream)" }}>
          {lines === 1 ? "1 bingo line" : `${lines} bingo lines`}
        </span>
        {frozen && (
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)" }}>
            Card frozen
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "var(--sp-3) var(--sp-4)",
        background: "var(--card)",
        borderRadius: "var(--r-card)",
        border: "1.5px solid var(--hairline)",
      }}
    >
      <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)" }}>
        {frozen
          ? "Card frozen — final state."
          : "Complete a full row, column, or diagonal to get bingo."}
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
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--cream)",
            margin: 0,
          }}
        >
          Bingo
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--muted)",
            margin: "var(--sp-1) 0 0",
          }}
        >
          Complete challenges to fill your card. New card every Monday.
        </p>
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
