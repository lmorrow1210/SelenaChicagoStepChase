"use client";

import { BingoTile } from "@one-step-ahead/design-system/components/game/BingoTile";
import Avatar from "@one-step-ahead/design-system/components/game/Avatar";
import type { ColorwayId } from "@one-step-ahead/design-system/components/game/Avatar";
import Icon from "@one-step-ahead/design-system/components/icons/Icon";
import EmptyState from "@one-step-ahead/design-system/components/feedback/EmptyState";
import Skeleton from "@one-step-ahead/design-system/components/feedback/Skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "../../../lib/api";
import { useSession } from "../../../lib/session";
import { SundayCountdown } from "../../../lib/SundayCountdown";

/* ============================================================
   FIELD OPS (M10, addendum §1) — one screen, two linked panels.
   The Ops Board (bingo matrix) is the CAUSE; the Trail (recon
   dossiers for the city ONE AHEAD) is the EFFECT. A bingo line
   launches a scout drone from the board to the trail and
   decrypts the next landmark.
   ============================================================ */

const COLORWAYS: ColorwayId[] = ["chicago", "midnight", "emerald", "crimson", "desert", "violet"];

function colorwayFrom(n: number): ColorwayId {
  return COLORWAYS[((n ?? 1) - 1) % COLORWAYS.length];
}

type TileState = "incomplete" | "in_progress" | "complete";

interface OpsTile {
  challenge_id?: number;
  free?: true;
  state: TileState;
  label: string;
  icon: string;
  category?: string;
  source?: "auto" | "honor";
  gifted_by?: string | null;
}

interface TrailNode {
  id: number;
  day: number;
  name: string;
  fun_fact: string | null;
  unlocked: boolean;
  unlock_date: string | null;
  scouted_by: string | null;
}

interface FieldOpsPayload {
  card: { id: string; tiles: OpsTile[]; bingo_lines: number; blackout: boolean; frozen: boolean };
  scout: {
    reconCity: { id: number; name: string; country: string } | null;
    teamTokens: number;
    unlockedCount: number;
    overflowBonus: number;
    unlockedToday: boolean;
  };
  reconCity: { id: number; name: string; country: string } | null;
  trail: TrailNode[];
  assists: { remaining: number };
  teammates: {
    id: string;
    display_name: string;
    avatar_colorway: number;
    bingo_lines: number;
    blackout: boolean;
  }[];
}

function vectorTint(category?: string): "step" | "routine" | "biometric" | undefined {
  if (!category) return undefined;
  if (["steps", "wildcard"].includes(category)) return "step";
  if (["workout", "social", "strength", "cardio", "hydration"].includes(category)) return "routine";
  if (["sleep", "heart", "recovery"].includes(category)) return "biometric";
  return undefined;
}

const LINES: number[][] = [
  ...Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => r * 5 + c)),
  ...Array.from({ length: 5 }, (_, c) => Array.from({ length: 5 }, (_, r) => r * 5 + c)),
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

function nearWinTiles(tiles: OpsTile[]): Set<number> {
  const isDone = (i: number) => tiles[i]?.free || tiles[i]?.state === "complete";
  const hot = new Set<number>();
  for (const line of LINES) {
    const missing = line.filter((i) => !isDone(i));
    if (missing.length === 1) hot.add(missing[0]);
  }
  return hot;
}

export default function FieldOpsPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<FieldOpsPayload>({
    queryKey: ["fieldops"],
    queryFn: () => api<FieldOpsPayload>("/api/fieldops"),
    enabled: !!user?.group_id,
    staleTime: 30_000,
  });

  // Drone launch: fires when the player's line count increases.
  const prevLines = useRef<number | null>(null);
  const [droneFlying, setDroneFlying] = useState(false);
  useEffect(() => {
    const lines = data?.card.bingo_lines;
    if (lines == null) return;
    if (prevLines.current != null && lines > prevLines.current) {
      setDroneFlying(true);
      const t = setTimeout(() => setDroneFlying(false), 1900);
      return () => clearTimeout(t);
    }
    prevLines.current = lines;
  }, [data?.card.bingo_lines]);

  const [giftMode, setGiftMode] = useState(false);
  const [giftTarget, setGiftTarget] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const honor = useMutation({
    mutationFn: (challenge_id: number) =>
      api("/api/fieldops/honor", { method: "POST", body: JSON.stringify({ challenge_id }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fieldops"] }),
    onError: (e) => setActionError(e instanceof ApiError ? e.message : "Couldn't report that"),
  });

  const gift = useMutation({
    mutationFn: (input: { to_user_id: string; challenge_id: number }) =>
      api("/api/fieldops/gift", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      setGiftMode(false);
      setGiftTarget(null);
      queryClient.invalidateQueries({ queryKey: ["fieldops"] });
    },
    onError: (e) => setActionError(e instanceof ApiError ? e.message : "Assist failed"),
  });

  if (!user?.group_id) {
    return (
      <main className="opsPage">
        <EmptyState icon="globe" title="No group yet" body="Join a squad to open the ops board." />
        <OpsStyles />
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="opsPage" aria-busy="true">
        <Skeleton preset="block" style={{ height: 60 }} />
        <Skeleton preset="bingo" />
        <OpsStyles />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="opsPage">
        <EmptyState icon="sync" title="Ops board unavailable" body="Try syncing your steps first." />
        <OpsStyles />
      </main>
    );
  }

  const { card, scout, trail, assists, teammates } = data;
  const hot = nearWinTiles(card.tiles);
  const recon = scout.reconCity?.name ?? "the next city";
  const nextNode = trail.find((n) => !n.unlocked);

  return (
    <main className="opsPage">
      {/* ── Header ── */}
      <header className="opsHeader">
        <div>
          <p className="stamped">[ Field ops ]</p>
          <h1>Scouting ahead: {recon}</h1>
          <p className="opsSub">
            Lines on the board send a drone one city ahead. She&apos;s heading there — decode it first.
          </p>
          <SundayCountdown style={{ marginTop: "var(--sp-2)" }} />
        </div>
        {/* Scout token meter — X/5 landmarks */}
        <div className="tokenPanel" role="status" aria-label={`${scout.unlockedCount} of 5 landmarks decoded`}>
          <span className="stamped">{scout.unlockedCount}/5 decoded</span>
          <div className="tokenMeter" aria-hidden="true">
            {trail.map((n) => (
              <span key={n.id} className="tokenSeg" data-lit={n.unlocked ? "true" : "false"} />
            ))}
          </div>
          <span className="tokenCaption">
            {scout.teamTokens} scout token{scout.teamTokens === 1 ? "" : "s"} earned
            {scout.overflowBonus > 0 && ` · +${scout.overflowBonus} overflow → forecast edge`}
          </span>
          {scout.unlockedToday && nextNode && (
            <span className="tokenCaption">Next decrypt available tomorrow — the trail unspools daily.</span>
          )}
        </div>
      </header>

      {actionError && (
        <p className="opsError" role="alert">
          {actionError}
          <button onClick={() => setActionError(null)} aria-label="Dismiss">×</button>
        </p>
      )}

      <div className="opsPanels">
        {/* ── Panel 1: The Ops Board (cause) ── */}
        <section className="board" aria-label="Ops board">
          <div className="panelHeader">
            <h2>[ The ops board ]</h2>
            <span className="panelMeta">
              {card.bingo_lines} line{card.bingo_lines === 1 ? "" : "s"} · {card.blackout ? "BLACKOUT" : "cause"}
            </span>
          </div>

          <div className="boardGrid" data-frozen={card.frozen ? "true" : "false"}>
            {card.tiles.map((tile, idx) => {
              const isHonor = tile.source === "honor" && !tile.free;
              const clickable =
                !card.frozen &&
                ((giftMode && tile.state === "complete" && !tile.free) ||
                  (!giftMode && isHonor && tile.state !== "complete"));
              return (
                <div
                  key={tile.free ? "free" : (tile.challenge_id ?? idx)}
                  className="tileWrap"
                  data-clickable={clickable ? "true" : "false"}
                  onClick={() => {
                    if (!clickable) return;
                    if (giftMode && giftTarget && tile.challenge_id != null) {
                      gift.mutate({ to_user_id: giftTarget, challenge_id: tile.challenge_id });
                    } else if (!giftMode && tile.challenge_id != null) {
                      honor.mutate(tile.challenge_id);
                    }
                  }}
                >
                  <BingoTile
                    label={tile.label}
                    icon={tile.icon as any}
                    state={tile.free ? "free" : tile.state === "in_progress" ? "progress" : (tile.state as any)}
                    tint={vectorTint(tile.category)}
                    highlight={!card.frozen && hot.has(idx)}
                  />
                  {/* Honor-system mark — self-reported objective */}
                  {isHonor && (
                    <span
                      className="honorMark"
                      title={tile.state === "complete" ? "Self-reported" : "Honor system — tap to mark complete"}
                    >
                      <Icon name="check" size={8} strokeWidth={3} />
                    </span>
                  )}
                  {/* Gift provenance */}
                  {tile.gifted_by && (
                    <span className="giftMark" title="Covered by a teammate">
                      <Icon name="nemesis" size={8} strokeWidth={2.6} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Assist controls */}
          <div className="assistRow">
            {!giftMode ? (
              <button
                className="assistButton"
                disabled={assists.remaining === 0 || card.frozen}
                onClick={() => setGiftMode(true)}
              >
                Cover a tile for a teammate ({assists.remaining} assist{assists.remaining === 1 ? "" : "s"} left)
              </button>
            ) : (
              <div className="giftPicker">
                <span className="stamped">Cover for:</span>
                {teammates.map((t) => (
                  <button
                    key={t.id}
                    className="giftTeammate"
                    data-selected={giftTarget === t.id ? "true" : "false"}
                    onClick={() => setGiftTarget(t.id)}
                  >
                    <Avatar size={22} colorway={colorwayFrom(t.avatar_colorway)} />
                    {t.display_name}
                  </button>
                ))}
                <span className="tokenCaption">
                  {giftTarget ? "now tap one of YOUR completed tiles" : "pick a teammate"}
                </span>
                <button className="giftCancel" onClick={() => { setGiftMode(false); setGiftTarget(null); }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Drone flight path — board → trail */}
        <div className="droneLane" aria-hidden="true">
          {droneFlying && (
            <span className="drone">
              <Icon name="sync" size={16} strokeWidth={2.4} />
            </span>
          )}
        </div>

        {/* ── Panel 2: The Trail (effect) ── */}
        <section className="trail" aria-label="Recon trail">
          <div className="panelHeader">
            <h2>[ The trail — {recon} ]</h2>
            <span className="panelMeta">effect</span>
          </div>
          <div className="trailList">
            {trail.map((node) => (
              <article
                key={node.id}
                className="dossier"
                data-unlocked={node.unlocked ? "true" : "false"}
                data-decrypting={droneFlying && node.id === nextNode?.id ? "true" : "false"}
              >
                {node.unlocked ? (
                  <>
                    <div className="dossierName">{node.name}</div>
                    {node.fun_fact && (
                      <p className="dossierIntel">
                        <span className="intelTag">Intercept:</span> {node.fun_fact}
                      </p>
                    )}
                    <p className="dossierMeta">
                      Scouted by {node.scouted_by ?? "the Bureau"}
                      {node.unlock_date ? ` · ${node.unlock_date}` : ""}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="dossierEncrypted" aria-hidden="true">
                      ▮▮▮▮▮ ▮▮▮▮▮▮▮▮ ▮▮▮
                    </div>
                    <span className="encryptedStamp">Encrypted</span>
                    <p className="dossierMeta">
                      {node.id === nextNode?.id
                        ? "Next decrypt — land a bingo line to launch the drone."
                        : "Deeper in the file — keep the lines coming."}
                    </p>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>

      <OpsStyles />
    </main>
  );
}

function OpsStyles() {
  return (
    <style jsx global>{`
      .opsPage {
        min-height: 100dvh;
        padding: var(--sp-4);
        display: flex;
        flex-direction: column;
        gap: var(--sp-4);
        max-width: 1080px;
        margin: 0 auto;
        width: 100%;
      }
      .opsPage .stamped {
        margin: 0;
        font-family: var(--font-display);
        font-weight: var(--fw-semibold);
        font-size: var(--fs-label);
        letter-spacing: var(--ls-label);
        text-transform: uppercase;
        color: var(--bone-dim);
      }
      .opsHeader {
        display: flex;
        justify-content: space-between;
        gap: var(--sp-4);
        align-items: flex-start;
        flex-wrap: wrap;
      }
      .opsHeader h1 {
        margin: 2px 0 0;
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        font-size: clamp(28px, 4.5vw, 40px);
        line-height: var(--lh-display);
        text-transform: uppercase;
        color: var(--bone);
      }
      .opsSub {
        margin: var(--sp-1) 0 0;
        font-family: var(--font-body);
        font-size: var(--fs-body-sm);
        color: var(--manila);
        max-width: 48ch;
      }
      .tokenPanel {
        display: flex;
        flex-direction: column;
        gap: var(--sp-1);
        align-items: flex-end;
        min-width: 180px;
      }
      .tokenMeter {
        display: flex;
        gap: 3px;
        padding: 4px;
        border-radius: var(--r-tight);
        background: var(--ink-800);
        box-shadow: var(--screen-inset-shadow);
      }
      .tokenSeg {
        width: 22px;
        height: 8px;
        border-radius: 2px;
        background: var(--ink-600);
      }
      .tokenSeg[data-lit="true"] {
        background: var(--amber);
        box-shadow: 0 0 6px rgba(255, 176, 32, 0.45);
      }
      .tokenCaption {
        font-family: var(--font-body);
        font-size: var(--fs-caption);
        color: var(--bone-dim);
        text-align: right;
      }
      .opsError {
        display: flex;
        justify-content: space-between;
        gap: var(--sp-2);
        margin: 0;
        padding: var(--sp-2) var(--sp-3);
        border-radius: var(--r-tight);
        border: 1px solid var(--signal-red);
        background: var(--signal-red-12);
        color: var(--bone);
        font-size: var(--fs-body-sm);
      }
      .opsError button {
        border: none;
        background: transparent;
        color: var(--bone-dim);
        cursor: pointer;
        font-size: 15px;
      }

      /* Two linked panels + the drone lane between them */
      .opsPanels {
        position: relative;
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--sp-4);
      }
      @media (min-width: 1024px) {
        .opsPanels {
          grid-template-columns: minmax(0, 11fr) 34px minmax(0, 9fr);
          gap: 0;
          align-items: start;
        }
      }
      .board,
      .trail {
        border: 1px solid var(--hairline);
        border-radius: var(--r-card);
        background: var(--ink-700);
        box-shadow: var(--bevel-raised-shadow), var(--shadow-card);
        padding: var(--sp-3);
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
      }
      .panelHeader {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: var(--sp-2);
        border-bottom: 1px solid var(--hairline);
        padding-bottom: var(--sp-2);
      }
      .panelHeader h2 {
        margin: 0;
        font-family: var(--font-display);
        font-weight: var(--fw-semibold);
        font-size: var(--fs-label);
        letter-spacing: var(--ls-label);
        text-transform: uppercase;
        color: var(--bone-dim);
      }
      .panelMeta {
        font-family: var(--font-mono);
        font-size: var(--fs-caption);
        color: var(--amber);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .boardGrid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: var(--sp-2);
      }
      .boardGrid[data-frozen="true"] {
        opacity: 0.7;
      }
      .tileWrap {
        position: relative;
      }
      .tileWrap[data-clickable="true"] {
        cursor: pointer;
      }
      .tileWrap[data-clickable="true"]:hover {
        transform: translateY(-1px);
      }
      /* Honor-system mark — hollow ring bottom-left; auto tiles have none */
      .honorMark {
        position: absolute;
        bottom: 3px;
        left: 3px;
        display: grid;
        place-items: center;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        border: 1.5px dashed var(--bone-dim);
        color: var(--bone-dim);
        background: var(--ink-800);
        pointer-events: none;
      }
      .giftMark {
        position: absolute;
        bottom: 3px;
        right: 3px;
        display: grid;
        place-items: center;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: var(--vector-12);
        border: 1px solid var(--vector);
        color: var(--vector);
        pointer-events: none;
      }
      .assistRow {
        border-top: 1px solid var(--hairline);
        padding-top: var(--sp-2);
      }
      .assistButton {
        width: 100%;
        min-height: var(--touch-min);
        border: 1px solid var(--hairline);
        border-radius: var(--r-tight);
        background: var(--ink-800);
        box-shadow: var(--screen-inset-shadow);
        color: var(--vector);
        font-family: var(--font-body);
        font-weight: 600;
        font-size: var(--fs-body-sm);
        cursor: pointer;
      }
      .assistButton:disabled {
        color: var(--bone-dim);
        cursor: not-allowed;
      }
      .giftPicker {
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-2);
        align-items: center;
      }
      .giftTeammate {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: var(--sp-1) var(--sp-2);
        border-radius: var(--r-tight);
        border: 1px solid var(--hairline);
        background: transparent;
        color: var(--bone);
        font-family: var(--font-body);
        font-size: var(--fs-body-sm);
        cursor: pointer;
      }
      .giftTeammate[data-selected="true"] {
        border-color: var(--vector);
        background: var(--vector-12);
      }
      .giftCancel {
        border: none;
        background: transparent;
        color: var(--bone-dim);
        font-size: var(--fs-caption);
        cursor: pointer;
        text-decoration: underline;
      }

      /* Drone lane + flight */
      .droneLane {
        position: relative;
        min-height: 24px;
      }
      .drone {
        position: absolute;
        top: 40%;
        left: -20px;
        color: var(--amber);
        filter: drop-shadow(0 0 8px rgba(255, 176, 32, 0.6));
        animation: osa-drone-fly 1.8s var(--ease-in-out) both;
      }
      @keyframes osa-drone-fly {
        0%   { transform: translateX(-160px) translateY(30px) rotate(-20deg); opacity: 0; }
        25%  { opacity: 1; }
        100% { transform: translateX(200px) translateY(120px) rotate(15deg); opacity: 0; }
      }
      @media (max-width: 1023px) {
        .droneLane { min-height: 0; }
        .drone {
          animation: osa-drone-fly-down 1.8s var(--ease-in-out) both;
        }
        @keyframes osa-drone-fly-down {
          0%   { transform: translateY(-120px); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: translateY(60px); opacity: 0; }
        }
      }

      /* Trail dossiers */
      .trailList {
        display: flex;
        flex-direction: column;
        gap: var(--sp-2);
      }
      .dossier {
        position: relative;
        border-radius: var(--r-tight);
        padding: var(--sp-2) var(--sp-3);
        border: 1px solid var(--hairline);
      }
      .dossier[data-unlocked="true"] {
        background: var(--manila);
        border-color: transparent;
        box-shadow: var(--shadow-card);
      }
      .dossier[data-unlocked="false"] {
        background: var(--ink-800);
        box-shadow: var(--screen-inset-shadow);
      }
      .dossier[data-decrypting="true"] {
        animation: sc-pulse-amber 0.9s var(--ease-in-out) 2;
      }
      .dossierName {
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        font-size: 16px;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: var(--ink-900);
      }
      .dossierIntel {
        margin: 2px 0 0;
        font-family: var(--font-body);
        font-size: var(--fs-body-sm);
        color: rgba(12, 15, 20, 0.75);
        line-height: 1.45;
      }
      .intelTag {
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--stamp-red);
        margin-right: 4px;
      }
      .dossier[data-unlocked="true"] .dossierMeta {
        margin: var(--sp-1) 0 0;
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: rgba(12, 15, 20, 0.55);
      }
      .dossierEncrypted {
        font-family: var(--font-mono);
        font-size: 14px;
        letter-spacing: 0.2em;
        color: var(--ink-600);
        user-select: none;
      }
      .encryptedStamp {
        position: absolute;
        top: var(--sp-2);
        right: var(--sp-3);
        transform: rotate(-8deg);
        font-family: var(--font-display);
        font-weight: var(--fw-bold);
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--signal-red);
        border: 1.5px solid var(--signal-red);
        border-radius: 2px;
        padding: 0 5px;
        opacity: 0.85;
      }
      .dossier[data-unlocked="false"] .dossierMeta {
        margin: var(--sp-1) 0 0;
        font-family: var(--font-body);
        font-size: var(--fs-caption);
        color: var(--bone-dim);
      }

      @media (prefers-reduced-motion: reduce) {
        .drone { display: none; }
      }
    `}</style>
  );
}
