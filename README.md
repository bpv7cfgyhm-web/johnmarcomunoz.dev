# johnmarcomunoz.dev

Personal portfolio for Johnmarco Munoz: CNC manufacturing, procurement and operations, plus the software and automation behind them.

It's a static site (HTML, CSS and vanilla JavaScript) with no framework and no build step, hosted on GitHub Pages.

---

## File layout

```
.
├── index.html            # All page content (hero, projects, skills, insights, contact)
├── 404.html              # "Page not found" page (GitHub Pages serves it automatically)
├── CNAME                 # Custom domain for GitHub Pages: johnmarcomunoz.dev
├── .nojekyll             # Tells GitHub Pages to serve files as-is (skip Jekyll)
├── robots.txt / sitemap.xml
├── css/
│   ├── tokens.css        # ← COLORS, fonts, spacing, motion timing (start here)
│   ├── base.css          # Reset, typography, links, focus styles
│   ├── layout.css        # Header, hero, sections, grids, footer, breakpoints
│   ├── components.css    # Buttons, chips, project accordion, cards, logo loop, form
│   └── animations.css    # Scroll reveals, loop keyframes, dither veil, reduced motion
├── js/
│   ├── main.js           # Sticky header, mobile menu, theme toggle, reveals, contact form
│   ├── projects.js       # Accordion open/close + category filter
│   ├── logo-loop.js      # Seamless infinite marquee
│   └── dither.js         # Hero dither field + pixel "veil" reveal
└── assets/
    ├── favicon.svg
    ├── og-image.png      # 1200×630 image used when the link is shared
    └── img/projects/     # Project thumbnails (SVG, 16:9)
```

---

## Before you go live: replace the placeholders

Search `index.html` for these and swap in your real details:

| Placeholder | Where | Replace with |
|---|---|---|
| `YOUR-GITHUB` | Project links, contact, footer, JSON-LD | Your GitHub username |
| `YOUR-LINKEDIN` | Contact, footer, JSON-LD | Your LinkedIn profile slug |
| `hello@johnmarcomunoz.dev` | Contact links, footer, `data-email` on the form | The address you want to be contacted at |
| Project cards | `#projects` section | Your real projects (the six included are **examples** written to fit your role; edit or remove them) |
| Insight posts | `#insights` section | Real posts, or delete the section and its nav link |

**Résumé:** put your PDF at `assets/resume.pdf`. The "Résumé (PDF)" button in the hero hides itself automatically until that file exists.

---

## Deploying on GitHub Pages

1. Push this repository to GitHub.
2. On the repo, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, pick **main** and the **/ (root)** folder, then click **Save**.
4. After a minute or two the site is live at `https://<username>.github.io/<repo>/` (and at your custom domain once DNS is set up, below).

Every push to `main` redeploys automatically.

### Previewing locally

Any static server works. From the repo root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly from disk mostly works too, but a server matches how GitHub Pages behaves.)

---

## Custom domain: johnmarcomunoz.dev

The `CNAME` file already contains `johnmarcomunoz.dev`. You also need to point DNS at GitHub.

**1. At your domain registrar**, add these DNS records:

| Type | Host / Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA *(optional, IPv6)* | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `<your-github-username>.github.io` |

**2. In GitHub**, go to **Settings → Pages → Custom domain**, enter `johnmarcomunoz.dev` and click **Save**. GitHub runs a DNS check, which can take anywhere from a few minutes to a day while DNS propagates.

**3. Turn on "Enforce HTTPS"** once it becomes available. `.dev` domains require HTTPS in every browser, so the site won't load over plain HTTP. GitHub issues the certificate for you after the DNS check passes.

**Optional:** verify the domain under your GitHub account (**Settings → Pages → Verified domains**) so nobody else can claim it on another repo.

---

## Editing content

All visible text is in `index.html`, with each section marked by a comment banner like `<!-- ============ PROJECTS ============ -->`.

- **Hero:** edit the `<h1>`, the `.hero-lede` paragraph and the three `.hero-stats` items.
- **Tech loop:** the scrolling strip under the hero is a plain `<ul>`. Add or remove `<li>` items. Speed is set by `data-speed` (pixels per second).
- **Skills:** four `.skill-card` blocks, plus a second, reverse-direction loop underneath.
- **SEO:** update `<title>`, `<meta name="description">`, the Open Graph tags and the JSON-LD block in `<head>`. Replace `assets/og-image.png` (1200×630) if you want a different share image.

---

## Adding a project (accordion card)

Copy an existing `<article class="project-card">` block inside `.project-grid` and edit it:

```html
<article class="project-card reveal" data-category="automation web">
  <button class="project-summary" type="button" aria-expanded="false" aria-controls="p-UNIQUE-ID">
    <span class="project-thumb">
      <img src="assets/img/projects/my-project.webp" alt="" width="640" height="360" loading="lazy">
    </span>
    <span class="project-meta">
      <span class="project-tag">Automation · Web app</span>
      <span class="project-title">Project Name</span>
      <span class="project-short">One-sentence summary shown while the card is closed.</span>
    </span>
    <span class="project-chevron" aria-hidden="true"></span>
  </button>
  <div class="project-panel" id="p-UNIQUE-ID" role="region" aria-label="Project Name details">
    <div class="project-panel-inner">
      <p>Full description shown when the card is expanded.</p>
      <ul class="project-points">
        <li>Key feature or result</li>
      </ul>
      <ul class="tech-list" aria-label="Tech stack">
        <li>Python</li><li>SQL</li>
      </ul>
      <div class="project-links">
        <a class="btn btn-sm btn-primary" href="https://github.com/..." target="_blank" rel="noopener">GitHub</a>
        <a class="btn btn-sm btn-ghost" href="https://..." target="_blank" rel="noopener">Live demo</a>
      </div>
    </div>
  </div>
</article>
```

Checklist:

- **`aria-controls` and `id` must match** and be unique on the page (e.g. `p-scheduler`).
- **`data-category`** takes one or more of `manufacturing`, `automation`, `web`, `open-source`, separated by spaces. These drive the filter chips.
- **New category?** Add a chip in `.filter-bar`: `<button class="chip" type="button" data-filter="my-key" aria-pressed="false">Label</button>`.
- **No public link?** Use `<span class="btn btn-sm btn-muted">Private / internal</span>`.
- **Thumbnails:** use a 16:9 image, around 640×360 (or 1280×720 for sharp retina screens). Export as **WebP** or **SVG** and keep it under about 100 KB. Screenshots compress well with [Squoosh](https://squoosh.app). If a screenshot shows sensitive shop data, blur it first.

Opening a card makes it span the full row, with the summary on the left and the details on the right. On mobile it expands in place. Only one card is open at a time.

## Adding an insight / blog post

Copy a `<article class="post-card">` in `#insights`. Point the heading link at a post page, such as `posts/my-post.html` (copy `404.html` as a simple page shell), or at an external article on LinkedIn, Medium and so on. Remove the `Coming soon` badge once the post is real.

---

## Customizing colors and the accent theme

Everything reads from CSS variables in **`css/tokens.css`**:

```css
:root {
  --accent: #2446ff;        /* solid fills: primary buttons, active chips */
  --accent-hover: #3a5bff;
  --accent-bright: #00d4ff; /* text, links and lines on the dark background */
  --accent-rgb: 0, 212, 255;/* same color as --accent-bright, as r, g, b (used for glows) */
  --bg: #0b1120;            /* page background */
  --bg-alt: #0f172a;        /* alternating section background */
  --surface: #131c33;       /* cards */
  --text: #e0e0e0;          /* body text */
  --heading: #ffffff;
}
```

- **Change the accent:** update `--accent`, `--accent-hover`, `--accent-bright`, **and** `--accent-rgb`. The dither pattern and glows use `--accent-rgb`.
- **Why two blues?** Pure `#0000f2` looks great on a button but is too dark to read as text on a navy background. So fills use a deep blue (`--accent`) and text uses cyan (`--accent-bright`). Check any new text color for contrast with a tool like [WebAIM's checker](https://webaim.org/resources/contrastchecker/) (aim for 4.5:1 or better).
- **Light theme:** override the same variables in the `:root[data-theme="light"]` block. The site defaults to dark, and a visitor's choice is remembered. To drop the toggle, delete the `data-theme-toggle` button in the header.
- **Fonts:** change the Google Fonts `<link>` in `index.html` and the `--font-sans` / `--font-mono` tokens.

## Tuning animations

| What | Where | Knobs |
|---|---|---|
| Scroll fade-in | `css/animations.css` | `--reveal-distance`, `--reveal-duration`, `--reveal-stagger`. Remove `reveal` from an element's class to disable it. |
| Logo loop | HTML `data-speed`, `css/components.css` `.logo-loop` | Speed (px/s), `--loop-gap`, and the edge-fade `mask-image`. Pauses on hover. Add `logo-loop-reverse` to reverse direction. |
| Dither veil (section headings) | `js/dither.js` `CONFIG` | `veilCell` (pixel size), `veilDuration`, `veilSweep`. Add or remove `data-dither` on any element to opt in or out. |
| Hero dither field | `js/dither.js` `CONFIG` + `.hero-dither` in `layout.css` | `heroCell`, `heroOpacity`, `heroFps`. The mask in CSS controls where it shows. Delete the `<canvas data-hero-dither>` to remove it. |
| Card hover | `css/components.css` `.project-card:hover` | Lift distance, border and shadow |
| Accordion | `css/components.css` `.project-panel` | Uses `--dur-slow`. Browsers that support View Transitions also animate the layout change. |

Visitors with **reduced motion** turned on get no loops, dither or reveals. Content just appears, and the loops become static wrapped lists.

---

## Contact form

GitHub Pages can't run server code, so by default the form **opens the visitor's email app** with the message pre-filled, addressed to the form's `data-email`.

To receive messages directly without an email app:

1. Create a free form at [Formspree](https://formspree.io) (or Basin, Getform and similar services).
2. Copy the endpoint URL, e.g. `https://formspree.io/f/abcdwxyz`.
3. Paste it into the form's `data-endpoint="..."` attribute in `index.html`.

The script then submits in the background and shows a success or error message inline.

---

## Accessibility and SEO notes

- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`), one `h1`, a skip link, and visible focus rings throughout.
- Project cards are real `<button>`s with `aria-expanded` and `aria-controls`. Collapsed panels are `inert`, so hidden links stay out of the tab order.
- All content is in the HTML, so it's readable with JavaScript off and fully indexable. JS only adds behavior.
- Includes canonical URL, meta description, Open Graph/Twitter tags, `Person` JSON-LD, `sitemap.xml` and `robots.txt`.
