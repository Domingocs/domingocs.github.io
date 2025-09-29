// assets/js/util.js

/** Basic HTML text escaping (for text nodes) */
export function esc(s='') {
  return String(s).replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

/** Attribute-safe escaping (very conservative) */
export function escAttr(s='') {
  return esc(String(s)).replace(/`/g, '&#96;');
}

/** Date format helper */
export function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(); } catch { return ''; }
}
