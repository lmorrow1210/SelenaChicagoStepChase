"use client";

import { PredictionSection } from "../map/PredictionSection";
import { SundayCountdown } from "../../../lib/SundayCountdown";

/* M10 (addendum §1): Prediction is its own screen again — Map · Field
   Ops · Prediction · Nemesis. Recon intel from Field Ops sharpens the
   forecast (§6): the more landmarks decoded, the better the read. */
export default function PredictionPage() {
  return (
    <main className="predictionPage">
      <header>
        <p className="stamped">[ Intercept forecast ]</p>
        <h1>Prediction</h1>
        <p className="predictionPageSub">
          Call how far the team gets this week. Every landmark the squad decodes on the trail
          sharpens the read on her next move.
        </p>
        <SundayCountdown style={{ marginTop: "var(--sp-2)" }} />
      </header>

      <PredictionSection />

      <style jsx global>{`
        .predictionPage {
          min-height: 100dvh;
          padding: var(--sp-4);
          display: flex;
          flex-direction: column;
          gap: var(--sp-4);
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }
        .predictionPage .stamped {
          margin: 0;
          font-family: var(--font-display);
          font-weight: var(--fw-semibold);
          font-size: var(--fs-label);
          letter-spacing: var(--ls-label);
          text-transform: uppercase;
          color: var(--bone-dim);
        }
        .predictionPage h1 {
          margin: 2px 0 0;
          font-family: var(--font-display);
          font-weight: var(--fw-bold);
          font-size: 30px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--bone);
        }
        .predictionPageSub {
          margin: var(--sp-1) 0 0;
          font-family: var(--font-body);
          font-size: var(--fs-body-sm);
          color: var(--manila);
          max-width: 52ch;
        }
      `}</style>
    </main>
  );
}
