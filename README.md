# Domingo Cruz – Portfolio Website

Source code for [domingocs.art](https://www.domingocs.art), hosted on **GitHub Pages**.
This is a personal portfolio and blog that displays artwork and posts fetched from Tumblr’s API.

---

## Features

* **Static hosting on GitHub Pages** – no backend required.
* **Daily data fetch** – GitHub Actions (`.github/workflows/fetch-tumblr.yml`) retrieves posts from the Tumblr API and saves them to `data/tumblr.json`.
* **Neue Post Format (NPF) support** – renders Tumblr’s block-based posts, including:

  * Text (paragraphs, headings, quotes, lists, formatted spans).
  * Images (with responsive `srcset` and optional EXIF/Palette metadata).
  * Videos (with poster images).
  * Links, audio, and polls (renderer stubs included).
* **Multi-language filtering** – supports English (`en`) and Spanish (`es`) via tags.
* **Pagination** – numbered pages with Prev/Next buttons (`?page=2`).
* **Tag filtering** – filter posts by any tag (`?tag=video`).
* **Detail view** – share a single post via slug (`?post=<slug>`).
* **Splash screen** – “Under Construction” overlay shown if data fails to load.

---

## Repository Structure

```
.
├── .github/workflows/
│   └── fetch-tumblr.yml     # GitHub Action to fetch Tumblr JSON daily
├── Assets/                  # Images and icons used on the site
├── CSS/
│   ├── style.css            # Compiled stylesheet
│   ├── style.css.map
│   └── style.scss           # Source SCSS
├── JS/
│   ├── render/              # Per-type renderers for NPF blocks
│   │   ├── index.js
│   │   ├── post-audio.js
│   │   ├── post-image.js
│   │   ├── post-link.js
│   │   ├── post-poll.js
│   │   ├── post-text.js
│   │   └── post-video.js
│   ├── config.js            # Constants & selectors
│   ├── filter.js            # Filtering by lang/tag/post
│   ├── main.js              # App entry point
│   ├── npfpost.js           # Legacy Tumblr NPF script (kept for reference)
│   ├── pagination.js        # Pagination logic and UI
│   ├── pinpost.js           # Handling of pinned posts
│   ├── query.js             # URL param parsing/updating
│   ├── script.js            # Miscellaneous scripts (legacy)
│   ├── store.js             # Loader & normalizer for /data/tumblr.json
│   ├── ui.js                # Splash screen and language switch
│   └── util.js              # Utility helpers
├── CNAME                    # Custom domain mapping (domingocs.art)
├── index.html               # Site entry point
└── README.md
```

---

## URL Parameters

* `?page=2` – show page 2 of results.
* `?lang=es` – filter to Spanish-tagged posts.
* `?tag=video` – filter posts by a given tag.
* `?post=<slug>` – show a single post detail view.

---

## Error Handling

If the data file cannot be loaded, the **Under Construction** splash screen (`#under-construction`) is displayed until the site can fetch content again.

---

## License

This repository is for personal/portfolio use. Code and assets are not licensed for reuse without permission.
