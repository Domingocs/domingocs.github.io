import { DATA_URL } from './config.js';

let _raw = null;       // raw JSON from /data/tumblr.json
let _posts = null;     // normalized posts array

/* ===================== Public API ===================== */

export async function ensureLoaded() {
  if (_posts) return;
  const res = await fetch(DATA_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ${DATA_URL}: ${res.status}`);
  _raw = await res.json();

  const posts = Array.isArray(_raw?.response?.posts) ? _raw.response.posts : [];
  _posts = posts.map(normalizePost);
}

export function allPosts() {
  return _posts || [];
}

export function totalPostsCount() {
  const apiTotal = Number(_raw?.response?.total_posts ?? 0);
  return apiTotal > 0 ? apiTotal : (Array.isArray(_posts) ? _posts.length : 0);
}

/** Optional helpers (for posible menus; not implemented yet) */
export function uniqueTags() {
  const s = new Set();
  for (const p of allPosts()) for (const t of p.tags) s.add(t);
  return Array.from(s).sort();
}
export function availableLanguages() {
  const langs = new Set();
  for (const p of allPosts()) for (const t of p.tags) if (t === 'en' || t === 'es') langs.add(t);
  return Array.from(langs).sort();
}

/* ===================== Normalization ===================== */

function normalizePost(p) {
  // post metadata
  const id   = p.id_string ?? String(p.id);
  const slug = p.slug ?? null;
  const tags = Array.isArray(p.tags) ? p.tags.map(String) : [];
  const dateIso = p.date || (p.timestamp ? new Date(p.timestamp * 1000).toISOString() : '');

  // raw content array
  const content = Array.isArray(p.content) ? p.content : [];
  const layout  = Array.isArray(p.layout)  ? p.layout  : null;

  // block pieces
  const texts  = extractTextBlocks(content);    // [{ html, subtype }]
  const images = extractImageBlocks(content);   // [{ variants[], primary, srcset, sizes, palette?, exifTime? }]
  const videos = extractVideoBlocks(content);   // [{ url, poster, posterSet, posterSizes }]

  const hasImages = images.length > 0;
  const hasVideos = videos.length > 0;

  // List-view hint (detail view should iterate blocks in order)
  const displayType = hasVideos ? 'video' : (hasImages ? 'photo' : 'text');

  // Concise text to show in list views if needed
  const textHtml = texts.length ? joinTextHtml(texts) : (p.summary ?? '');

  return {
    id, slug, tags, dateIso,
    content, layout,
    // Derived, per-type collections
    texts, images, videos,
    // Useful flags + list view hint
    hasImages, hasVideos, displayType,
    // Fallback text for list cards
    textHtml,
    // Keep original for edge-cases if a renderer needs it
    _raw: p
  };
}

/* ===================== Block extractors ===================== */

/** TEXT: convert NPF text blocks (with formatting) to HTML, respect subtypes (heading1, quote, etc.) */
function extractTextBlocks(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b?.type !== 'text' || typeof b.text !== 'string') continue;

    const html = textBlockToHtml(b.text, Array.isArray(b.formatting) ? b.formatting : []);
    const subtype = b.subtype || 'paragraph'; // heading1, heading2, quote, etc.

    // Wrap based on subtype
    let wrapped;
    switch (subtype) {
      case 'heading1': wrapped = `<h1>${html}</h1>`; break;
      case 'heading2': wrapped = `<h2>${html}</h2>`; break;
      case 'heading3': wrapped = `<h3>${html}</h3>`; break;
      case 'quote':    wrapped = `<blockquote>${html}</blockquote>`; break;
      case 'ordered-list-item':   wrapped = `<li class="ol">${html}</li>`; break;
      case 'unordered-list-item': wrapped = `<li class="ul">${html}</li>`; break;
      default:         wrapped = `<p>${html}</p>`;
    }

    out.push({ html: wrapped, subtype });
  }
  return out;
}

/** IMAGES: each image block yields one gallery item with responsive variants and metadata */
function extractImageBlocks(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b?.type !== 'image' || !Array.isArray(b.media)) continue;

    const variants = mediaToVariants(b.media);              // [{url,width,height}, ...] (deduped by width)
    if (!variants.length) continue;

    const primary = pickPrimaryVariant(variants);           // the largest (or near) for simple <img src="">
    const srcset  = makeSrcset(variants);                   // "url 320w, url 640w, ..."
    const sizes   = '(max-width: 900px) 100vw, 900px';      // tune per layout as needed

    // Optional extras
    const palette = b.colors ? pickPalette(b.colors) : null;
    const exifTime = b.exif?.Time ?? null;

    out.push({ variants, primary, srcset, sizes, palette, exifTime });
  }
  return out;
}

/** VIDEOS: extract mp4 url and poster (with variants for responsive poster) */
function extractVideoBlocks(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b?.type !== 'video' || !b.media) continue;
    const url = b.media.url || null;

    // Poster can be array of variants similar to images
    let poster = null, posterSet = '', posterSizes = '(max-width: 900px) 100vw, 900px';
    if (Array.isArray(b.poster) && b.poster.length) {
      const v = mediaToVariants(b.poster);
      poster = pickPrimaryVariant(v) || null;
      posterSet = makeSrcset(v);
    }

    if (url) out.push({ url, poster, posterSet, posterSizes });
  }
  return out;
}

/* ===================== Helpers ===================== */

/** Convert text + formatting ranges to safe HTML (links, bold, italic; basic coverage) */
function textBlockToHtml(text, ranges) {
  // Escape once
  let out = esc(text);

  // Apply ranges from END to START to avoid messing up indices
  // Supported: link, bold, italic. (Extend as needed: underline, strikethrough, mention, tag, etc.)
  const sorted = [...ranges].sort((a, b) => (b.start ?? 0) - (a.start ?? 0));

  for (const r of sorted) {
    const start = r.start ?? 0;
    const end   = r.end ?? start;
    if (start >= end || start < 0 || end > out.length) continue;

    const before = out.slice(0, start);
    const mid    = out.slice(start, end);
    const after  = out.slice(end);

    if (r.type === 'link' && r.url) {
      out = `${before}<a href="${escAttr(r.url)}" target="_blank" rel="noopener noreferrer">${mid}</a>${after}`;
    } else if (r.type === 'bold') {
      out = `${before}<strong>${mid}</strong>${after}`;
    } else if (r.type === 'italic') {
      out = `${before}<em>${mid}</em>${after}`;
    } else {
      // Unknown formatting → leave text as-is
      out = `${before}${mid}${after}`;
    }
  }
  return out;
}

/** Map Tumblr media objects to width-keyed unique variants */
function mediaToVariants(mediaArr) {
  // Deduplicate by width (keep first seen). Prefer common image types (jpg/png/webp) as they come.
  const byW = new Map();
  for (const m of mediaArr) {
    const url = m?.url;
    const w   = m?.width;
    const h   = m?.height;
    if (!url || !Number.isFinite(w) || !Number.isFinite(h)) continue;
    if (!byW.has(w)) byW.set(w, { url, width: w, height: h });
  }
  // Sort ascending by width
  return Array.from(byW.values()).sort((a, b) => a.width - b.width);
}

function pickPrimaryVariant(variants) {
  if (!variants.length) return null;
  // Choose the largest; easy to change if you want a max-width cap
  return variants[variants.length - 1];
}

function makeSrcset(variants) {
  // "url 320w, url 640w, url 1280w"
  return variants.map(v => `${v.url} ${v.width}w`).join(', ');
}

function pickPalette(colors) {
  // Tumblr may provide an array of {hex:string, ...}. Keep first few as a flat palette.
  const hexes = colors
    .map(c => (typeof c?.hex === 'string' ? c.hex : null))
    .filter(Boolean)
    .slice(0, 5);
  if (!hexes.length) return null;
  const obj = {};
  hexes.forEach((hex, i) => obj[`c${i}`] = hex);
  return obj;
}

/** Utilities */
function esc(s='') {
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function escAttr(s='') {
  // conservative attribute escaping
  return esc(String(s)).replace(/`/g, '&#96;');
}
function joinTextHtml(items) {
  return items.map(x => x.html).join('\n');
}
