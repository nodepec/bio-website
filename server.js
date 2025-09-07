import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PUB = path.join(__dirname, "public");

app.use(express.static(PUB, { extensions: ["html"] }));

app.get("*", (req, res) => res.sendFile(path.join(PUB, "index.html")));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`▶ Listening on http://localhost:${port}`));
