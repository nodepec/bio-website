import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB  = path.join(__dirname, "public");
const PORT = process.env.PORT || 3000;
const DEV  = process.env.NODE_ENV === "development";

const app = express();

app.use(express.static(PUB, { extensions: ["html"] }));

app.use((req, res) => {
  if (DEV) console.warn(`404 ${req.method} ${req.url}`);
  res.status(404).sendFile(path.join(PUB, "index.html"));
});

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}${DEV ? " (dev)" : ""}`);
});
