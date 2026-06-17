# EnergyZone front page Tailwind rebuild plan

## Workflow
- Implement exactly one requested bite at a time.
- After completing a bite, stop and report completion so the user can test and commit.
- Do not start the next bite until the user says “next bite”.

## Bite 1 — Update `components/ProductCard.tsx`
### Goal
Rebuild the product card to match the old HTML/CSS card style using Tailwind.

### Source references inspected
- Current card: `C:\Users\frida\Desktop\energyzone\components\ProductCard.tsx`
- Old card CSS: `C:\Users\frida\test side\css\style.css`
- Old card markup/helper: `C:\Users\frida\test side\js\shared-products.js`

### Implementation details
- Use a white background, rounded corners, `shadow-md`, overflow hidden, and hover lift/shadow.
- Render `product.thumbnail` as a top image with `h-48 object-cover`; include a safe fallback if empty.
- Show product name with `font-bold text-lg`.
- Show brand with `text-sm text-gray-500`.
- Show price using `product.price_dkk` with `text-xl font-bold text-primary`.
- Render rating as yellow/orange stars based on `product.company_score` out of 6.
- Render `product.tags` as small rounded gray badges.
- Add the small rounded primary button labeled “Jeg har drukket denne”.
- Preserve existing product data shape from Supabase: `name`, `brand`, `price_dkk`, `company_score`, `tags`, `thumbnail`.

### Validation
- Run `npm run lint` after the edit if dependencies are installed.
- If the local Tailwind config still does not define custom `primary`, use the project’s existing primary configuration or update the config to match the user’s provided colors before relying on `text-primary`.

## Bite 2 — Hero slider
### Goal
Build a top-3 hero slider in `app/page.tsx`.

### Implementation details
- Fetch top 3 products sorted by `company_score` descending.
- Dark gradient background.
- Large product image/emoji area, product name, brand, stars, short description, and primary “Se produkt” button.
- Previous/next controls, dots, and auto-slide every 5 seconds.
- Use a client component for slider state if needed.

## Bite 3 — Quick filters + Search + Sorting
### Goal
Add filtering/search/sorting in `app/page.tsx`.

### Implementation details
- Quick filters: All, Can, Bottle, Glass bottle, Strawberry, Sugar-free.
- Active filter uses `bg-primary text-white`.
- Search filters by name/brand/tags.
- Sorting dropdown: Name A-Z, Name Z-A, Price Low-High, Price High-Low, Best rating, Most caffeine.

## Bite 4 — Top lists
### Goal
Add three side-by-side top lists.

### Lists
1. Most popular: highest review count or highest user rating.
2. Cheapest: lowest `price_dkk`.
3. Best for Strawberry: products with strawberry tag sorted by rating.

### Implementation details
- Each list shows 3 products in small cards.
- Add a small-card variant or separate mini card component.

## Bite 5 — Product grid with load-more
### Goal
Add the main product list.

### Implementation details
- Shows all products from Supabase.
- Start with 10 products.
- “Vis flere produkter” load-more button.
- Use updated `ProductCard`.

## Bite 6 — New products + Flavor tag cloud
### Goal
Add new products and tag cloud.

### Implementation details
- New products: 6 newest products sorted by `created_at`.
- Flavor tag cloud: aggregate all tags by frequency and vary text size.
- Clicking a tag filters products by that tag.

## Bite 7 — Latest reviews + Point & Levels
### Goal
Add latest reviews and level table.

### Implementation details
- Latest reviews: 3-5 reviews with username, level, stars, comment.
- Point & Levels: level table 0-10 with level, title, points.
- Show current user level if logged in.

## Bite 8 — Leaderboard snippet + Footer
### Goal
Finish the front page.

### Implementation details
- Leaderboard snippet: global Top 3 and Top 3 friends if logged in.
- Footer: About EnergyZone, links, contact, social media, dark background.
