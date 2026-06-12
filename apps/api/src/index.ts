import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";

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

// TODO(M1+): mount routes/auth, routes/users, routes/groups, routes/weeks,
// routes/sync, routes/predictions, routes/nemesis, routes/bingo,
// routes/cities, routes/badges — see docs/implementation-plan §3.

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`api listening on :${port}`));
