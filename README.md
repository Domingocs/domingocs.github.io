Domingo Cruz – Portfolio Website

Source code for domingocs.com, hosted on GitHub Pages.This is a personal portfolio and blog that displays artwork and posts fetched directly from the Tumblr API.

Features

Static hosting on GitHub Pages – no backend required.

Tumblr API integration – client-side scripts fetch posts live from Tumblr’s API using the OAuth consumer key.

Legacy NPF support – parses and renders Tumblr post objects using jQuery-based scripts.

Multi-language filtering – supports English (en) and Spanish (es).

Pagination – numbered pages with Prev/Next buttons, built dynamically with jQuery.

Repository Structure

.
├── Assets/                  # Images and icons used on the site
├── CSS/
│   ├── style.css            # Compiled stylesheet
│   ├── style.css.map
│   └── style.scss           # Source SCSS
├── JS/
│   ├── npfpost.js           # Main Tumblr API integration script
│   ├── script.js            # Miscellaneous scripts
│   └── pinpost.js           # Pinned Posts Slider retrieval
├── CNAME                    # Custom domain mapping (domingocs.com)
├── index.html               # Site entry point
└── README.md

Error Handling

If the Tumblr API cannot be reached or returns an error, the Under Construction splash screen (#under-construction) is displayed until posts can be retrieved.

License

This repository is for personal/portfolio use. Files in /assets are not licensed for reuse without permission.

