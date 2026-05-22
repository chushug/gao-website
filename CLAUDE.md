# gao-website — Agent Guide

Personal academic website for Chushu (Maxon) Gao, PhD student in Biology at Saint Louis University.
Built with Quarto, deployed to GitHub Pages at `https://chushug.github.io/gao-website/`.

## Stack

- **Quarto** — static site generator. Source files are `.qmd` (Markdown + YAML front matter).
- **Output** — rendered into `docs/` by `quarto render`. GitHub Pages serves from `docs/` on `main`.
- **CI** — `.github/workflows/publish.yml` auto-renders and commits `docs/` after every push to `main`. Do not edit `docs/` manually.
- **Math** — MathJax via `html-math-method: mathjax` in `_quarto.yml`. Use standard LaTeX syntax.

## File Map

```
_quarto.yml          site config (theme, css, header/body includes)
_head.html           fonts (Source Serif 4, Source Sans 3) + FA icons + scripts
_sidebar.html        custom left sidebar (nav, social icons, footer)
styles.css           all custom CSS — single source of truth
scripts/birds.js     boids flocking animation (home page only)
scripts/transitions.js  glass-overlay page transition
images/              photos and hero image
pdf/                 downloadable PDF files (CV etc.)
docs/                rendered output — DO NOT edit directly
```

## Color Palette (CSS variables in `styles.css`)

```css
--c-dark:    #1F0D1E   /* sidebar background */
--c-purple:  #634670   /* sidebar border */
--c-gold:    #875D33   /* warm accent, dates, journal names */
--c-green:   #4A7052   /* links, buttons, h3 headings */
--c-teal:    #58A68D   /* hover states */
--c-text:    #2a2326   /* body text */
--c-page-bg: #f7f4f8   /* reference only; actual bg is a gradient on body */
```

Always use these variables — never hardcode hex values for site colors.

## Layout

- Quarto's default navbar and footer are hidden via CSS (`display: none !important`).
- The sidebar is injected via `include-before-body: _sidebar.html` as a fixed 260 px left panel.
- Main content lives in `#quarto-content`, which uses `display: flex; justify-content: center` to center inside the remaining viewport. Max content width is 780 px.
- On mobile (≤ 960 px) the sidebar becomes a horizontal top bar.

## Adding a New Page

1. Create `pagename.qmd` with `---\ntitle: "Page Title"\n---` front matter.
2. Add a nav link in `_sidebar.html`:
   ```html
   <li><a href="pagename.html">Page Title</a></li>
   ```
   Use `class="nav-subtle"` for lower-priority links (italic, muted color).
3. Run `quarto render` locally to verify, then push.

## Content Formatting

### Headings
- `h1` — page title (has gold underline, serif font). One per page.
- `h2` — major sections (light border-bottom, `margin-top: 2.2rem`).
- `h3` — subsections (green color, `--c-green`).
- The YAML `title:` field renders as an `h1.title` which is hidden by CSS (`display: none`). Always write your own `# Heading` as the first visible element.

### Mathematics
Use `$...$` for inline and `$$...$$` for display equations. MathJax renders both.
Display equations are centered automatically. Variable names in body text should also be wrapped in `$...$`.

### Publications (`.paper` blocks)
Use plain HTML — Quarto's `:::` div syntax is unreliable for nested layouts:
```html
<div class="paper">
  <div class="paper-title">Title of the paper</div>
  <div class="paper-authors">Author A, Author B, ...</div>
  <div class="paper-journal">Journal Name, Year</div>
  <a href="..." class="paper-badge">PDF</a>
  <a href="..." class="paper-badge">DOI</a>
</div>
```

### Research Cards
Use plain HTML `<div class="research-grid">` with `<div class="research-card">` children.
Do NOT use Quarto `:::` card syntax — it fails to render the nested structure correctly.

### CV Entries
```html
<div class="cv-entry">
  <span>Description of the entry</span>
  <span class="cv-date">2020–present</span>
</div>
```

### News Items
```html
<div class="news-item">
  <div class="news-date">Month Year</div>
  <p>News content here.</p>
</div>
```

### Buttons
- `<a class="btn-cv" href="...">Download CV</a>` — dark background, for primary downloads.
- `<a class="btn-more" href="...">Learn more</a>` — green pill, for card links.

## JavaScript

**`scripts/birds.js`** — boids flocking simulation. Runs only on the home page (path guard at line 3). Parameters at top of file: `N=45` boids, `MAX_SPD=2.0`, radii `R_SEP=30 / R_ALI=65 / R_COH=80`, weights `1.7 / 1.1 / 1.0`. Ghost trail: snapshot every 6 frames, keep 5, quadratic opacity falloff.

**`scripts/transitions.js`** — intercepts internal anchor clicks, activates `.glass-overlay` blur before navigating.

Both scripts are loaded with `defer` in `_head.html`.

## Deployment

Push to `main` → GitHub Actions runs `quarto render` → commits updated `docs/` back to `main` with message `chore: render site [skip ci]` → GitHub Pages serves from `docs/`.

Pull with rebase before pushing if the Actions bot has committed since your last pull:
```bash
git pull --rebase && git push
```

## Do Not

- Do not edit files inside `docs/` — they are overwritten by CI.
- Do not use Quarto `:::` div syntax for complex card or grid layouts — use plain HTML.
- Do not add `Co-Authored-By: Claude` to commit messages.
- Do not hardcode colors — use CSS variables.
- Do not add a second boids canvas to non-home pages; the path guard in `birds.js` is intentional.
