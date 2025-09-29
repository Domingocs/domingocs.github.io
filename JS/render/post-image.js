// assets/js/render/post-image.js
import { esc } from '../util.js';

/**
 * Renders images for list or detail.
 * post.images = [{ variants[], primary, srcset, sizes, palette?, exifTime? }, ...]
 * In detail mode we prefer post._detailImage if provided by the dispatcher.
 */
export function renderImagePost(post, { mode = 'card' } = {}) {
  // pick one gallery item
  const galleryItem = mode === 'detail' && post._detailImage
    ? post._detailImage
    : post.images?.[0];

  if (!galleryItem?.primary) {
    // fallback to text card if no usable image
    return `
      <article class="post post--image missing" data-id="${esc(post.id)}">
        <p>${esc('Image unavailable')}</p>
      </article>`;
  }

  const img = galleryItem.primary;
  const srcset = galleryItem.srcset || '';
  const sizes  = galleryItem.sizes  || '(max-width: 900px) 100vw, 900px';

  const caption = mode === 'detail'
    ? '' // detail can include separate text blocks around the image
    : (post.texts?.[0]?.html || post.textHtml || '');

  return `
    <article class="post post--image ${mode}" data-id="${esc(post.id)}">
      ${post.dateIso ? `<time datetime="${esc(post.dateIso)}">${fmtDate(post.dateIso)}</time>` : ''}
      <figure class="figure">
        <img src="${esc(img.url)}"
             ${srcset ? `srcset="${esc(srcset)}"` : ''}
             sizes="${esc(sizes)}"
             alt="">
        ${caption ? `<figcaption class="caption">${caption}</figcaption>` : ''}
      </figure>
    </article>
  `;
}

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(); } catch { return ''; }
}
