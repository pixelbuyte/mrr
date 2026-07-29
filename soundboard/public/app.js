const app = document.getElementById("app");

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

function clipCard(clip) {
  const tags = (clip.tags || "").split(",").filter(Boolean).map((t) => `<span class="tag">${esc(t)}</span>`).join(" ");
  return `
    <div class="card">
      <p class="quote">&ldquo;${esc(clip.quote_text)}&rdquo;</p>
      <p class="meta">
        <a href="#/person/${encodeURIComponent(clip.speaker_name)}">${esc(clip.speaker_name)}</a>
        ${clip.source_name ? ` · ${esc(clip.source_name)}` : ""} · ${clip.play_count} plays
      </p>
      <div class="row">
        <button onclick="playClip(${clip.id})">▶ Play</button>
        <a class="back-link" href="#/clip/${clip.id}">Open</a>
        ${tags}
      </div>
    </div>`;
}

async function playClip(id) {
  try {
    await api(`/api/clips/${id}/play`, { method: "POST" });
  } catch (e) { /* non-fatal for the demo */ }
  const clip = await api(`/api/clips/${id}`);
  if (clip.audio_url) {
    new Audio(clip.audio_url).play().catch(() => alert("Couldn't play audio_url — add a real file URL when submitting."));
  } else {
    alert(`(Demo record — no audio file attached)\n\n"${clip.quote_text}" — ${clip.speaker_name}`);
  }
}
window.playClip = playClip;

async function renderHome(query) {
  app.innerHTML = `
    <h1>Find a sound or voice line</h1>
    <input id="q" type="search" placeholder="Type a quote, name, or tag…" value="${esc(query || "")}" />
    <div id="results" class="empty">Loading…</div>
  `;
  const input = document.getElementById("q");
  input.focus();
  input.addEventListener("input", debounce(() => {
    location.hash = `#/?q=${encodeURIComponent(input.value)}`;
  }, 250));

  const rows = await api(`/api/clips${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  const results = document.getElementById("results");
  results.className = "";
  results.innerHTML = rows.length
    ? rows.map(clipCard).join("")
    : `<p class="empty">No matches. Try a different word, or <a href="#/submit">submit a sound</a>.</p>`;
}

async function renderClip(id) {
  app.innerHTML = `<p class="empty">Loading…</p>`;
  try {
    const clip = await api(`/api/clips/${id}`);
    const embed = `<audio controls src="${esc(clip.audio_url || "")}"></audio>`;
    app.innerHTML = `
      <a class="back-link" href="#/">&larr; back to search</a>
      <h1>${esc(clip.title)}</h1>
      <p class="quote">&ldquo;${esc(clip.quote_text)}&rdquo;</p>
      <p class="meta">Said by <a href="#/person/${encodeURIComponent(clip.speaker_name)}">${esc(clip.speaker_name)}</a>
        ${clip.source_name ? ` · ${esc(clip.source_name)}` : ""}</p>
      ${clip.audio_url ? embed : `<p class="notice">Demo record — no audio file attached yet.</p>`}
      <p class="meta">${clip.play_count} plays</p>
      <p class="field-label">Embed:</p>
      <textarea readonly rows="2">&lt;audio controls src="${esc(clip.audio_url || "")}"&gt;&lt;/audio&gt;</textarea>
    `;
  } catch (e) {
    app.innerHTML = `<p class="empty">Clip not found. <a href="#/">Back to search</a></p>`;
  }
}

async function renderPerson(name) {
  app.innerHTML = `<a class="back-link" href="#/">&larr; back to search</a><h1>Clips by ${esc(name)}</h1><p class="empty">Loading…</p>`;
  const rows = await api(`/api/clips?speaker=${encodeURIComponent(name)}`);
  app.innerHTML = `
    <a class="back-link" href="#/">&larr; back to search</a>
    <h1>Clips by ${esc(name)}</h1>
    ${rows.length ? rows.map(clipCard).join("") : `<p class="empty">No approved clips yet.</p>`}
  `;
}

function renderSubmit() {
  app.innerHTML = `
    <a class="back-link" href="#/">&larr; back to search</a>
    <h1>Submit a sound</h1>
    <p class="meta">New submissions go into a moderation queue before they appear in public search.</p>
    <form id="submit-form">
      <label class="field-label">Title</label>
      <input name="title" type="text" required />
      <label class="field-label">Quote / what's said</label>
      <input name="quote_text" type="text" required />
      <label class="field-label">Speaker name</label>
      <input name="speaker_name" type="text" required />
      <label class="field-label">Source / show</label>
      <input name="source_name" type="text" />
      <label class="field-label">Audio file URL</label>
      <input name="audio_url" type="text" placeholder="https://…mp3" />
      <label class="field-label">Category</label>
      <input name="category" type="text" placeholder="meme, quote, sfx…" />
      <label class="field-label">Tags (comma separated)</label>
      <input name="tags" type="text" />
      <button type="submit">Submit for review</button>
    </form>
    <div id="submit-status"></div>
  `;
  document.getElementById("submit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const status = document.getElementById("submit-status");
    try {
      await api("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      status.innerHTML = `<p class="notice">Thanks! Your sound is pending approval.</p>`;
      e.target.reset();
    } catch (err) {
      status.innerHTML = `<p class="notice">${esc(err.message)}</p>`;
    }
  });
}

async function renderAdmin() {
  app.innerHTML = `<h1>Moderation queue</h1><p class="empty">Loading…</p>`;
  const rows = await api("/api/admin/pending");
  app.innerHTML = `
    <h1>Moderation queue</h1>
    ${rows.length ? rows.map(pendingCard).join("") : `<p class="empty">Nothing pending.</p>`}
  `;
}

function pendingCard(clip) {
  return `
    <div class="card">
      <p class="quote">&ldquo;${esc(clip.quote_text)}&rdquo;</p>
      <p class="meta">${esc(clip.speaker_name)} ${clip.source_name ? `· ${esc(clip.source_name)}` : ""}</p>
      <div class="row">
        <button onclick="moderate(${clip.id}, 'approve')">Approve</button>
        <button class="danger" onclick="moderate(${clip.id}, 'reject')">Reject</button>
      </div>
    </div>`;
}

async function moderate(id, action) {
  await api(`/api/admin/clips/${id}/${action}`, { method: "POST" });
  renderAdmin();
}
window.moderate = moderate;

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function router() {
  const hash = location.hash.slice(1) || "/";
  const [path, queryString] = hash.split("?");
  const params = new URLSearchParams(queryString || "");

  if (path === "/" || path === "") return renderHome(params.get("q"));
  if (path === "/submit") return renderSubmit();
  if (path === "/admin") return renderAdmin();

  const clipMatch = path.match(/^\/clip\/(\d+)$/);
  if (clipMatch) return renderClip(clipMatch[1]);

  const personMatch = path.match(/^\/person\/(.+)$/);
  if (personMatch) return renderPerson(decodeURIComponent(personMatch[1]));

  app.innerHTML = `<p class="empty">Page not found. <a href="#/">Back to search</a></p>`;
}

window.addEventListener("hashchange", router);
router();
