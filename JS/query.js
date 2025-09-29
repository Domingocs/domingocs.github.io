const LS_LANG_KEY = 'site.lang'; // remember the user's last choice

export function getQuery() {
  const u = new URL(location.href);

  // page → default 1
  const rawPage = u.searchParams.get('page');
  let page = Number.parseInt(rawPage ?? '1', 10);
  if (!Number.isFinite(page) || page < 1) page = 1;

  // lang/tag from URL (may be empty)
  const tag  = (u.searchParams.get('tag')  || '').trim();
  let lang   = (u.searchParams.get('lang') || '').trim();
  const post  = (u.searchParams.get('post') || '').trim();   // NEW: single-post slug

  return { page, tag, lang, post };
}

/**
 * Ensure sensible defaults only when URL params are missing.
 * - If ?lang is missing, prefer: localStorage → navigator.language(s) → <html lang>.
 * - If ?page is missing/invalid, normalize to page=1 (done in getQuery()).
 * Call this once at startup (before first render).
 */
export function ensureDefaults() {
  const u = new URL(location.href);
  let changed = false;

  // LANG defaulting logic
  if (!u.searchParams.has('lang')) {
    const saved = tryGetSavedLang();
    const fromBrowser = pickLangFromNavigator();
    const fromHtml = pickLangFromHtml();
    const lang = saved || fromBrowser || fromHtml || 'en';

    if (lang) {
      u.searchParams.set('lang', lang);
      changed = true;
    }
  }

  if (changed) {
    history.replaceState({}, '', u); // do not create a new history entry
  }
}

export function setQuery(updates) {
  const u = new URL(location.href);
  for (const [k, v] of Object.entries(updates)) {
    if (v === '' || v == null) u.searchParams.delete(k);
    else u.searchParams.set(k, String(v));
  }
  history.pushState({}, '', u);
}

export function buildUrl(updates) {
  const u = new URL(location.href);
  for (const [k, v] of Object.entries(updates)) {
    if (v === '' || v == null) u.searchParams.delete(k);
    else u.searchParams.set(k, String(v));
  }
  return u.toString();
}

// Persist user's choice explicitly (called by UI handlers)
export function saveLang(lang) {
  try { localStorage.setItem(LS_LANG_KEY, lang); } catch { /* ignore */ }
}

// Helpers
function tryGetSavedLang() {
  try { return sanitizeLang(localStorage.getItem(LS_LANG_KEY)); } catch { return ''; }
}
function pickLangFromNavigator() {
  const list = Array.from(navigator.languages || [navigator.language || '']);
  for (const entry of list) {
    const cand = sanitizeLang(entry);
    if (cand) return cand;
  }
  return '';
}
function pickLangFromHtml() {
  return sanitizeLang(document.documentElement.lang || '');
}
function sanitizeLang(v) {
  if (!v) return '';
  const s = String(v).toLowerCase();
  if (s.startsWith('es')) return 'es';
  if (s.startsWith('en')) return 'en';
  return ''; // only support 'en' and 'es' for now
}
