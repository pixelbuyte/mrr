# SoundBoard Search — MVP

A "Shazam for meme/voice clips" MVP: type a quote, name, or tag and get back
matching sound clips with who said it and where it's from. This is the **v1
text-search MVP** described in the product plan — no audio fingerprinting or
speaker voice-ID yet (see "Roadmap" below for that).

## Why it's zero-dependency

The server uses only Node's built-in `http` and `node:sqlite` (Node 22+) —
no `npm install` required to run it locally. This mirrors the intended
production stack conceptually (Postgres full-text search + object storage)
without needing any external service to try it out.

## Run it

```bash
node server.js
# → Soundboard MVP running at http://localhost:3000
```

Open `http://localhost:3000`. A handful of demo clips are seeded
automatically on first run (`soundboard/data/soundboard.db`, gitignored).

## What's implemented

- **Search** (`GET /api/clips?q=`) — matches quote text, speaker, source, and
  tags.
- **Browse by person** (`GET /api/clips?speaker=`).
- **Clip page** with player + embed snippet (`#/clip/:id`).
- **Submit a sound** (`#/submit`) → goes into a `pending` moderation queue.
- **Admin queue** (`#/admin`) → approve/reject pending submissions.
- **Play counts**, used to rank search results and power a future
  "trending" view.

## Data model

Single `clips` table (see `server.js`): title, quote_text, speaker_name,
source_name, audio_url, category, tags, status (`pending`/`approved`),
play_count. `speaker_name` is deliberately a first-class column (not buried
in tags) — that's what lets two different people who said the *same* quote
show up as distinct results, and it's the hook a future speaker-voice-ID
phase would attach enrolled voice-prints to.

## Production path (still ~$0/month)

Swap this reference implementation's SQLite file for a real host without
changing the shape of the API:
- Frontend + API: Vercel/Netlify/Cloudflare Pages free tier.
- Database: Supabase (Postgres) free tier — gives full-text search for free.
- Audio storage: Cloudflare R2 free tier (10GB, no egress fees) or Supabase
  Storage.

## Roadmap (deliberately deferred, cost noted)

- **v2 — audio fingerprinting** ("upload a clip, tell me what it is"):
  Chromaprint/`dejavu`-style landmark hashing over the same clip library.
  Mostly free — CPU-bound, runs on the same free-tier compute until volume
  outgrows it (~$5–20/month for a small always-on worker at that point).
- **v3 — speaker voice-ID** (recognize *whose* voice is talking, so the same
  quote said by person A vs. person B resolves to the right speaker
  automatically): voice-embedding model (e.g. `pyannote.audio`,
  Resemblyzer) comparing an incoming clip's embedding against enrolled
  speaker voice-prints. First phase that meaningfully costs money — needs
  GPU inference, ~$20–100/month on pay-per-second serverless GPU
  (Modal/Replicate/RunPod) at low-to-moderate volume.
- **v4 — chat assistant**: LLM with function-calling into this same
  `/api/clips` search endpoint — usage-based, roughly $5–50/month at
  early-stage traffic.

Full cost/marketing/build breakdown: see the plan this was scaffolded from.
