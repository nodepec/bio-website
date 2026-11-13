import express    from "express";
import path       from "path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import compression from "compression";
import helmet      from "helmet";
import session from './api/session.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB  = path.join(__dirname, "dist");
const PORT = process.env.PORT || 3000;
if (!existsSync(path.join(PUB, "index.html"))) {
  console.error("Build the site first with npm run build, or use npm run dev for development.");
  process.exit(1);
}

const app = express();

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      workerSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
    },
  },
  // Only force HTTPS when the deployment explicitly runs in production.
  strictTransportSecurity: process.env.NODE_ENV === "production",
}));
app.use(compression());
app.get('/api/session', session);
app.use(express.static(PUB, {
  setHeaders(res, filePath) {
    res.setHeader("Cache-Control", filePath.includes(`${path.sep}assets${path.sep}`)
      ? "public, max-age=31536000, immutable"
      : "no-cache");
  },
}));

app.use((req, res) => {
  res.status(404).type("text").send("Not found");
});

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
