import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ROOT = fileURLToPath(new URL("../apps/web/out/", import.meta.url));
const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".woff2", "font/woff2"],
]);

export function createStaticDemoServer({
  root = DEFAULT_ROOT,
  host = "127.0.0.1",
  port = 4173,
  basePath = "/SelenaChicagoStepChase",
} = {}) {
  const rootPath = resolve(root);
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);
      const filePath = await resolveRequestPath(rootPath, requestUrl.pathname, basePath);
      if (!filePath) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "content-type": MIME_TYPES.get(extname(filePath)) ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      if (request.method === "HEAD") {
        response.end();
        return;
      }
      createReadStream(filePath).pipe(response);
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(error instanceof Error ? error.message : "Server error");
    }
  });

  return {
    server,
    url: `http://${host}:${port}${basePath}`,
    listen() {
      return new Promise((resolveListen) => {
        server.listen(port, host, resolveListen);
      });
    },
    close() {
      return new Promise((resolveClose, rejectClose) => {
        server.close((error) => error ? rejectClose(error) : resolveClose());
      });
    },
  };
}

async function resolveRequestPath(rootPath, pathname, basePath) {
  let demoPath = decodeURIComponent(pathname);
  if (basePath && demoPath.startsWith(basePath)) {
    demoPath = demoPath.slice(basePath.length) || "/";
  }
  if (!demoPath.startsWith("/")) demoPath = `/${demoPath}`;

  const candidates = demoPath.endsWith("/")
    ? [`${demoPath}index.html`]
    : [demoPath, `${demoPath}/index.html`];
  candidates.push("/404.html");

  for (const candidate of candidates) {
    const filePath = resolve(rootPath, `.${candidate}`);
    if (!filePath.startsWith(rootPath)) continue;
    const info = await stat(filePath).catch(() => null);
    if (info?.isFile()) return filePath;
  }
  return null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , rootArg, portArg, basePathArg] = process.argv;
  const app = createStaticDemoServer({
    root: rootArg ? resolve(rootArg) : DEFAULT_ROOT,
    port: portArg ? Number(portArg) : 4173,
    basePath: basePathArg ?? "/SelenaChicagoStepChase",
  });
  await app.listen();
  process.stdout.write(`Static demo serving at ${app.url}\n`);

  const stop = async () => {
    await app.close();
    process.exit(0);
  };
  process.on("SIGINT", () => void stop());
  process.on("SIGTERM", () => void stop());
}
