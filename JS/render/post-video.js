// assets/js/render/post-video.js
import { esc } from '../util.js';

/**
 * Renders video for list or detail.
 * post.videos = [{ url, poster, posterSet, posterSizes }, ...]
 * In detail mode we prefer post._detailVideo if provided by the dispatcher.
 */
export function renderVideoPost(post, { mode = 'card' } = {}) {
  const videoItem = mode === 'detail' && post._detailVideo
    ? post._detailVideo
    : post.videos?.[0];

  if (!videoItem?.url) {
    return `
      <article class="post post--video missing" data-id="${esc(post.id)}">
        <p>${esc('Video unavailable')}</p>
      </article>`;
  }

  const poster  = videoItem.poster?.url || '';
  const posterSet   = videoItem.posterSet || '';
  const posterSizes = videoItem.posterSizes || '(max-width: 900px) 100vw, 900px';

  const caption = mode === 'detail'
    ? ''
    : (post.texts?.[0]?.html || post.textHtml || '');

  return `
    <article class="post post--video ${mode}" data-id="${esc(post.id)}">
      ${post.dateIso ? `<time datetime="${esc(post.dateIso)}">${fmtDate(post.dateIso)}</time>` : ''}
      <figure class="figure">
        <video controls preload="metadata" ${poster ? `poster="${esc(poster)}"` : ''}>
          <source src="${esc(videoItem.url)}" type="video/mp4">
        </video>
        ${caption ? `<figcaption class="caption">${caption}</figcaption>` : ''}
      </figure>
    </article>
  `;
}

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(); } catch { return ''; }
}
