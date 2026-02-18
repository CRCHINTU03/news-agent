import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.ADMIN_PORT || 3001);

const mimeByExt = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8"
};

http
  .createServer(async (req, res) => {
    try {
      const urlPath = req.url === "/" ? "/index.html" : req.url || "/index.html";
      const safePath = path.normalize(urlPath).replace(/^\/+/, "");
      const filePath = path.join(publicDir, safePath);
      const content = await readFile(filePath);
      const ext = path.extname(filePath);
      res.setHeader("content-type", mimeByExt[ext] || "application/octet-stream");
      res.statusCode = 200;
      res.end(content);
    } catch {
      res.statusCode = 404;
      res.end("Not Found");
    }
  })
  .listen(port, () => {
    console.log(`Admin app running at http://localhost:${port}`);
  });
