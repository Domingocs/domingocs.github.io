export const DATA_URL = '/data/tumblr.json';   // Posts data. Built daily by GitHub Actions
export const PAGE_SIZE = 15;                   // page size
export const SELECTORS = {
  feed:   '#allposts',    // container where posts render
  pager:  '#pages nav.pagination',    // pagination UI container
  error:  '#under-construction',    // error message container
};
export const USER_AGENT = 'DomCruzSite/2.0';   // informational
