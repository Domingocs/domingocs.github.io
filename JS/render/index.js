// assets/js/render/index.js
import { esc } from '../util.js';
import { renderImagePost } from './post-image.js';
import { renderTextPost }  from './post-text.js';
import { renderVideoPost } from './post-video.js';

/**
 * Render a list (grid) of posts into a container.
 * Expects posts already filtered/paginated.
 */
export function renderList(posts, container = '#allposts') {
  const el = document.querySelector(container);
  if (!el) return;
  el.innerHTML = posts.map(renderCard).join('');
}

/** Render a single post “card” suitable for list views. */
function renderCard(post) {
  // Choose a thumbnail strategy for list view:
  if (post.hasVideos)    return renderVideoPost(post, { mode: 'card' });
  if (post.hasImages)    return renderImagePost(post, { mode: 'card' });
  return renderTextPost(post, { mode: 'card' });
}

/**
 * Simple detail view: you can swap this for a richer layout later.
 * Expects a normalized post (or null/undefined).
 */
export function renderDetail(post, container = '#allposts') {
  const el = document.querySelector(container);
  if (!el) return;

  if (!post) {
    el.innerHTML = `<article class="post not-found"><p>${esc('Post not found.')}</p></article>`;
    return;
  }

  // Detail page: render blocks in original order
  const blocksHtml = renderBlocksInOrder(post);
  el.innerHTML = `
    <article class="post post--detail" data-id="${esc(post.id)}">
      ${post.dateIso ? `<time datetime="${esc(post.dateIso)}">${fmtDate(post.dateIso)}</time>` : ''}
      ${blocksHtml}
    </article>
  `;
}

/* ---- helpers ---- */

function renderBlocksInOrder(post) {
  // Use the normalized per-type arrays to render in sequence based on original content
  if (!Array.isArray(post.content)) return '';
  const html = [];

  let iImg = 0, iTxt = 0, iVid = 0;

  for (const b of post.content) {
    if (b?.type === 'image') {
      const item = post.images[iImg++];
      if (item) html.push(renderImagePost({ ...post, _detailImage: item }, { mode: 'detail' }));
    } else if (b?.type === 'text') {
      const item = post.texts[iTxt++];
      if (item) html.push(renderTextPost({ ...post, _detailText: item }, { mode: 'detail' }));
    } else if (b?.type === 'video') {
      const item = post.videos[iVid++];
      if (item) html.push(renderVideoPost({ ...post, _detailVideo: item }, { mode: 'detail' }));
    } else {
      // Unknown block → ignore gracefully
    }
  }
  return html.join('\n');
}

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(); } catch { return ''; }
}
