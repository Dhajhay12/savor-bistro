# Savor Bistro

A six-page static website for a fictional restaurant, built with HTML5, Tailwind
CSS (CDN) and vanilla JavaScript. Bright, appetite-driven design with food-specific
motion (hero steam + Ken-Burns, tactile hover zooms, success-state checkmarks).

## Running locally

No build step. Either:

- Open `index.html` directly in a browser, or
- Serve the folder (recommended so all relative paths behave consistently):

```bash
# Python
python -m http.server 8000
# then visit http://localhost:8000

# or Node
npx serve .
```

## File structure

```
/css/styles.css        design tokens, components, motion keyframes
/js/main.js            nav, mobile panel, filters, forms, lightbox, order feedback
/images/               26 real downloaded photos (dishes, interiors, staff, events)
index.html             home: animated hero, featured dishes, review stream, vibe strip
menu.html              full HTML text menu with dietary filters and per-item photo thumbnails
about.html             founding story, sourcing, team
gallery.html           masonry grid + keyboard-accessible lightbox
private-events.html    private dining, catering packages, validated inquiry form
contact.html           address, hours, map, reservation widget, online ordering
```

## Design tokens

Defined as CSS custom properties in `css/styles.css` and mirrored in the inline
`tailwind.config` block on every page (keep the two in sync):

| Token             | Value     | Use                                              |
|-------------------|-----------|--------------------------------------------------|
| `--cream-50`      | `#FFF8EC` | primary light background                          |
| `--tomato-600`    | `#E8384F` | headlines, accents, primary CTAs                  |
| `--citrus-500`    | `#FFB627` | highlights, prices, hover states, star ratings    |
| `--basil-700`     | `#2D5A3D` | dietary/freshness cues, success states            |
| `--charcoal-900`  | `#221A17` | footer, nav-on-scroll, high-contrast sections     |
| `--ink-900`       | `#2A211D` | body text on light backgrounds                    |

Type: **Bricolage Grotesque** (display, 600-800) and **Work Sans** (body, 400-500)
from Google Fonts. Motion respects `prefers-reduced-motion` (steam, zooms and
draw-in animations switch off).

## Front-end mockups vs. real integrations

| Feature              | Status            | Notes                                                                 |
|----------------------|-------------------|-----------------------------------------------------------------------|
| Reservation widget   | **Mockup**        | Styled placeholder button on `contact.html#reserve`; the code comment marks where an OpenTable/Resy embed script goes. |
| Online ordering      | **Mockup**        | First-party button plus placeholder links for two delivery partners on `contact.html#order`; no trademarked logos used. |
| Live review stream   | **Static mockup** | Curated card layout on the home page; the code comment marks where Google/Yelp API or EmbedSocial/Elfsight would wire in. |
| Forms                | **Client-side only** | Inquiry + contact forms validate in `js/main.js` and show a styled success state with a drawn checkmark; there is no backend. |
| Google Map           | **Placeholder**   | Static iframe embed with a fictional address.                          |

## Menu thumbnails

Each menu row is a card-like row: a photo anchor (120px square on mobile,
160px on >=640px, rounded, `object-fit: cover`) beside the item's text with
generous padding (`py-6 sm:py-7`). On very small screens (below 640px) the
photo stacks above the text so a 375px-wide viewport keeps ~90% of its width
for name, price and description; side-by-side kicks in at 640px. Six dishes
reuse site photography (`dish-burrata.jpg`, `dish-charred-octopus.jpg`,
`dish-porchetta.jpg`, `dish-saffron-risotto.jpg`, `gallery-raw-bar.jpg`,
`detail-cocktail-citrus.jpg`); the other 16 are CC-licensed photos sourced via
the [Openverse API](https://api.openverse.org) (title-verified against each
dish before download, `images/menu-*.jpg`). All 22 thumbnails use
`loading="lazy"` and explicit `width="160" height="160"` to prevent layout
shift; total menu image weight is ~2.4MB, all lazy-loaded below the fold. The
menu remains fully indexable HTML text - thumbnails are purely visual anchors,
and a `.menu-fallback` icon tile exists in `css/styles.css` as a graceful
fallback pattern if any dish ever lacks a suitable photo.

## Placeholder content

Savor Bistro is fictional. Address, phone, email, reviews, prices, staff names and
photos' alt-story details are invented for the demo. Menu prices are dated on the
menu page ("current as of ...") to model pricing transparency. No real restaurant,
brand or delivery-platform logos appear anywhere.
