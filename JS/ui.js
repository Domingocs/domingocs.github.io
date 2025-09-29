import { setQuery, saveLang } from './query.js';
import { SELECTORS } from './config.js';

export function bindUI() {
  // Language switchers
  const langNav = document.querySelector('#langsw');
  if (langNav) {
    langNav.addEventListener('click', (e) => {
      const en = e.target.closest('.enbtn');
      const es = e.target.closest('.esbtn');
      if (en) {
        saveLang('en');
        setQuery({ lang: 'en', page: 1 });
        dispatchNav();
      } else if (es) {
        saveLang('es');
        setQuery({ lang: 'es', page: 1 });
        dispatchNav();
      }
    });
  }

  window.addEventListener('popstate', () => dispatchNav());
}

/* Show #under-construction overlay */
export function showError() {
  const el = document.querySelector(SELECTORS.error);
  if (el) el.style.display = 'flex';
}

/* Hide overlay */
export function hideError() {
  const el = document.querySelector(SELECTORS.error);
  if (el) el.style.display = 'none';
}

export function dispatchNav() {
  window.dispatchEvent(new CustomEvent('app:navigate'));
}
