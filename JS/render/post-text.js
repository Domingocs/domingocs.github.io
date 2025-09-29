// assets/js/render/post-text.js
import { esc } from '../util.js';

/**
 * Renders text for list or detail.
 * post.texts = [{ html, subtype }, ...]
 * In detail mode we prefer post._detailText if provided by the dispatcher.
 */
export function renderTextPost(post, { mode = 'card' } = {}) {
  if (mode === 'detail' && post._detailText) {
    return `<section class="block block--text">${post._detailText.html}</section>`;
  }

  // List card: show a short teaser (first text block or summary)
  const first = post.texts?.[0]?.html || post.textHtml || '';
  if (!first) return `<article class="post post--text"><p>${esc('Untitled')}</p></article>`;

  return `
    <article class="post post--text" data-id="${esc(post.id)}">
      ${post.dateIso ? `<time datetime="${esc(post.dateIso)}">${fmtDate(post.dateIso)}</time>` : ''}
      <div class="post-body">${first}</div>
    </article>
  `;
}

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(); } catch { return ''; }
}
