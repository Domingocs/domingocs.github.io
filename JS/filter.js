export function applyFilters(posts, { post, lang, tag }) {
  let out = Array.isArray(posts) ? posts : [];

  // Single-post shortcut: if ?post=<slug> present, return only that match
  if (post && typeof post === 'string' && post.trim()) {
    const slug = post.trim().toLowerCase();
    out = out.filter(p => (p.slug || '').toLowerCase() === slug);
    return out; // detail view: other filters ignored
  }

  // Language filter (expects 'en' or 'es' in tags)
  if (lang && typeof lang === 'string') {
    const langNorm = norm(lang);
    if (langNorm === 'en' || langNorm === 'es') {
      out = out.filter(p => hasTag(p, langNorm));
    }
  }

  // Category/content tag filter (single)
  if (tag && typeof tag === 'string') {
    const tagNorm = norm(tag);
    if (tagNorm) {
      out = out.filter(p => hasTag(p, tagNorm));
    }
  }

  return out;
}

/* ---------------- Helpers ---------------- */

function hasTag(post, tagNorm) {
  if (!post || !Array.isArray(post.tags)) return false;
  for (const t of post.tags) {
    if (norm(t) === tagNorm) return true;
  }
  return false;
}

function norm(s) {
  return String(s).trim().toLowerCase();
}
