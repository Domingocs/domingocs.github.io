import { buildUrl, setQuery } from './query.js';
import { SELECTORS } from './config.js';

/** Total pages given item count + page size. */
export function pageCount(total, pageSize) {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Return items for the requested page (1-based). */
export function slicePage(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function renderPager({ page, pages, container = SELECTORS.pager, window = 2 }) {
  const root = document.querySelector(container);
  if (!root) return;

  const prevA = root.querySelector('a.menu-button.prev');
  const nextA = root.querySelector('a.menu-button.next');
  if (!prevA || !nextA) return;

  // 1) Clear previous numbered buttons
  root.querySelectorAll('a.menu-button.jump_page, span.menu-button.current_page').forEach(n => n.remove());

  // 2) Calculate a small window of numbers around current page
  const start = Math.max(1, page - window);
  const end   = Math.min(pages, page + window);

  // 3) Build numbered anchors and insert them BEFORE the .next link
  const frag = document.createDocumentFragment();
  for (let n = start; n <= end; n++) {
    if (n === page) {
      const span = document.createElement('span');
      span.className = 'menu-button current_page';
      span.setAttribute('aria-current', 'page');
      span.textContent = String(n);
      frag.appendChild(span);
    } else {
      frag.appendChild(makeNumberLink(n));
    }
  }
  nextA.before(frag);

  // 4) Update Prev/Next anchors (href + disabled state)
  if (page > 1) {
    enableLink(prevA, page - 1, 'Prev');
  } else {
    disableLink(prevA, 'Prev');
  }

  if (page < pages) {
    enableLink(nextA, page + 1, 'Next');
  } else {
    disableLink(nextA, 'Next');
  }

  // 5) Bind click interception once (keep real hrefs for fallback)
  if (!root.dataset.bound) {
    root.addEventListener('click', onPagerClick);
    root.dataset.bound = '1';
  }
}

/* ---------- helpers ---------- */

function makeNumberLink(n) {
  const a = document.createElement('a');
  a.className = 'menu-button jump_page';
  a.textContent = String(n);
  a.href = buildUrl({ page: n });
  a.dataset.page = String(n);
  a.setAttribute('aria-label', `Go to page ${n}`);
  return a;
}

function enableLink(a, targetPage, label) {
  a.classList.remove('disabled');
  a.removeAttribute('aria-disabled');
  a.removeAttribute('tabindex');
  a.textContent = label;
  a.href = buildUrl({ page: targetPage });
  a.dataset.page = String(targetPage);
}

function disableLink(a, label) {
  a.classList.add('disabled');
  a.setAttribute('aria-disabled', 'true');
  a.setAttribute('tabindex', '-1');
  a.textContent = label;
  a.removeAttribute('href');
  delete a.dataset.page;
}

function onPagerClick(e) {
  const a = e.target.closest('a.menu-button');
  if (!a) return;
  const dp = a.dataset.page;
  if (!dp) return; // disabled or current page span
  const n = parseInt(dp, 10);
  if (!Number.isFinite(n)) return;
  e.preventDefault();
  setQuery({ page: n });
  window.dispatchEvent(new Event('popstate')); // main.js listens and re-renders
}
