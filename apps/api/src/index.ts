import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.js";
import { groupsRouter } from "./routes/groups.js";
import { usersRouter } from "./routes/users.js";
import { syncRouter } from "./routes/sync.js";
import { weeksRouter } from "./routes/weeks.js";
import { citiesRouter } from "./routes/cities.js";
import { predictionsRouter } from "./routes/predictions.js";
import { errorHandler } from "./middleware/errors.js";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS: allow only WEB_ORIGIN with credentials
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", webOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sync", syncRouter);
app.use("/api/weeks", weeksRouter);
app.use("/api/cities", citiesRouter);
app.use("/api/predictions", predictionsRouter);
// TODO(M5+): routes/nemesis, bingo, badges — see
// docs/implementation-plan.md §3.

app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log(`api listening on :${port}`));
}

export { app };
