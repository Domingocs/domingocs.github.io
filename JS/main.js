// assets/js/main.js
import { ensureLoaded, allPosts } from './store.js';
import { ensureDefaults, getQuery, setQuery } from './query.js';
import { applyFilters } from './filters.js';
import { pageCount, slicePage, renderPager } from './pagination.js';
import { renderList, renderDetail } from './render/index.js';
import { SELECTORS, PAGE_SIZE } from './config.js';
import { bindUI, showError, hideError } from './ui.js';

async function render() {
  try {
    await ensureLoaded();
    hideError();

    const q = getQuery(); // { page, tag, lang, post }

    const filtered = applyFilters(allPosts(), q);

    if (q.post) {
      // DETAIL VIEW
      renderDetail(filtered[0], SELECTORS.feed);
      // Hide pager in detail view
      const pager = document.querySelector(SELECTORS.pager);
      if (pager) pager.innerHTML = '';
      return;
    }

    // LIST VIEW
    const pages = pageCount(filtered.length, PAGE_SIZE);
    const page  = Math.min(q.page, pages);
    if (page !== q.page) setQuery({ page }); // clamp URL to max

    const subset = slicePage(filtered, page, PAGE_SIZE);
    renderList(subset, SELECTORS.feed);
    renderPager({ page, pages });

  } catch (err) {
    console.error(err);
    showError();
  }
}

// bootstrap
ensureDefaults();
bindUI();
window.addEventListener('app:navigate', render);
window.addEventListener('popstate', render);
render();
