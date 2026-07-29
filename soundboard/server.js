// Zero-dependency MVP server for the sound/voice clip library.
// Uses Node's built-in http + node:sqlite (Node >=22) so `npm install` is optional.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "soundboard.db");
const PUBLIC_DIR = path.join(__dirname, "public");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS clips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    quote_text TEXT NOT NULL,
    speaker_name TEXT NOT NULL,
    source_name TEXT,
    audio_url TEXT,
    category TEXT,
    tags TEXT,
    status TEXT NOT NULL DEFAULT 'approved',
    play_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function seedIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM clips").get();
  if (count > 0) return;

  const seed = [
    ["Sample Air Horn", "MEHHHH", "Sound FX Library", "Public domain SFX", null, "sfx", "airhorn,meme,reaction"],
    ["Sample Wilhelm Scream", "Aaaaahhh!", "Sound FX Library", "Public domain SFX", null, "sfx", "scream,classic,movie"],
    ["Sample Drum Sting", "Ba dum tss", "Sound FX Library", "Public domain SFX", null, "sfx", "rimshot,joke,reaction"],
    ["Sample Applause", "Clap clap clap", "Sound FX Library", "Public domain SFX", null, "sfx", "applause,crowd,win"],
    ["Sample Record Scratch", "Screeetch", "Sound FX Library", "Public domain SFX", null, "sfx", "scratch,pause,meme"],
    ["Placeholder Quote One", "That's exactly what I'm talking about", "Demo Speaker A", "Demo Show", null, "quote", "demo,speakerA"],
    ["Placeholder Quote Two", "That's exactly what I'm talking about", "Demo Speaker B", "Demo Show", null, "quote", "demo,speakerB"],
  ];

  const insert = db.prepare(`
    INSERT INTO clips (title, quote_text, speaker_name, source_name, audio_url, category, tags, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')
  `);
  for (const row of seed) insert.run(...row);

  console.log(`Seeded ${seed.length} demo clips (replace with real uploads via /#/submit).`);
}
seedIfEmpty();

// Demonstrates why `speakers` exist as first-class metadata: two people can
// say the same quote_text, and browse/search still needs to tell them apart.
function matchesQuery(clip, q) {
  const haystack = [clip.title, clip.quote_text, clip.speaker_name, clip.source_name, clip.tags]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("invalid json"));
      }
    });
    req.on("error", reject);
  });
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

function serveStatic(req, res, pathname) {
  const rel = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.join(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  try {
    // GET /api/clips?q=search+text  (approved only)
    if (req.method === "GET" && pathname === "/api/clips") {
      const q = url.searchParams.get("q") || "";
      const speaker = url.searchParams.get("speaker");
      let rows = db.prepare("SELECT * FROM clips WHERE status = 'approved' ORDER BY play_count DESC, id DESC").all();
      if (speaker) rows = rows.filter((c) => c.speaker_name.toLowerCase() === speaker.toLowerCase());
      if (q) rows = rows.filter((c) => matchesQuery(c, q));
      return sendJson(res, 200, rows);
    }

    // GET /api/clips/:id
    const clipMatch = pathname.match(/^\/api\/clips\/(\d+)$/);
    if (req.method === "GET" && clipMatch) {
      const clip = db.prepare("SELECT * FROM clips WHERE id = ?").get(Number(clipMatch[1]));
      if (!clip) return sendJson(res, 404, { error: "not found" });
      return sendJson(res, 200, clip);
    }

    // POST /api/clips/:id/play  (increment play count)
    const playMatch = pathname.match(/^\/api\/clips\/(\d+)\/play$/);
    if (req.method === "POST" && playMatch) {
      db.prepare("UPDATE clips SET play_count = play_count + 1 WHERE id = ?").run(Number(playMatch[1]));
      return sendJson(res, 200, { ok: true });
    }

    // POST /api/submissions  (new clip -> status pending)
    if (req.method === "POST" && pathname === "/api/submissions") {
      const body = await readBody(req);
      const { title, quote_text, speaker_name, source_name, audio_url, category, tags } = body;
      if (!title || !quote_text || !speaker_name) {
        return sendJson(res, 400, { error: "title, quote_text, and speaker_name are required" });
      }
      const info = db
        .prepare(`
          INSERT INTO clips (title, quote_text, speaker_name, source_name, audio_url, category, tags, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `)
        .run(title, quote_text, speaker_name, source_name || null, audio_url || null, category || null, tags || null);
      return sendJson(res, 201, { id: Number(info.lastInsertRowid), status: "pending" });
    }

    // GET /api/admin/pending
    if (req.method === "GET" && pathname === "/api/admin/pending") {
      const rows = db.prepare("SELECT * FROM clips WHERE status = 'pending' ORDER BY id DESC").all();
      return sendJson(res, 200, rows);
    }

    // POST /api/admin/clips/:id/approve
    const approveMatch = pathname.match(/^\/api\/admin\/clips\/(\d+)\/approve$/);
    if (req.method === "POST" && approveMatch) {
      db.prepare("UPDATE clips SET status = 'approved' WHERE id = ?").run(Number(approveMatch[1]));
      return sendJson(res, 200, { ok: true });
    }

    // POST /api/admin/clips/:id/reject
    const rejectMatch = pathname.match(/^\/api\/admin\/clips\/(\d+)\/reject$/);
    if (req.method === "POST" && rejectMatch) {
      db.prepare("DELETE FROM clips WHERE id = ?").run(Number(rejectMatch[1]));
      return sendJson(res, 200, { ok: true });
    }

    if (pathname.startsWith("/api/")) {
      return sendJson(res, 404, { error: "unknown endpoint" });
    }

    return serveStatic(req, res, pathname);
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { error: "internal error" });
  }
});

server.listen(PORT, () => {
  console.log(`Soundboard MVP running at http://localhost:${PORT}`);
});
