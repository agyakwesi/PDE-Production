# Design System Strategy: Parfum d'Élite

## 1. Overview & Creative North Star
**Creative North Star: "The Obsidian Curator"**
This design system is built to evoke the atmosphere of a private, dimly lit fragrance atelier. It moves away from the "app-like" utility of standard digital products toward a high-end editorial experience. By utilizing high-contrast typography, sharp edges (0px border radius), and deep tonal layering, we create a digital space that feels exclusive and archival.

The system breaks the traditional "box-and-grid" template through:
- **Intentional Asymmetry:** Overlapping typography and image elements that break the container boundaries.
- **Monolithic Depth:** Replacing shadows with background-color shifts, creating a sense of "carved" or "stacked" interfaces.
- **Atmospheric Glassmorphism:** Using heavy blurs to mimic the crystalline nature of fragrance bottles.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the interplay between the void (`#0A0A0A`) and the gilded light of the monogram (`#D4AF37`).

### The Color Tokens
- **Primary (The Gold):** `primary: #f2ca50` / `primary_container: #d4af37`. Reserved for focal points, signatures, and primary CTAs.
- **Surface (The Charcoal):** `surface: #131313` / `surface_container_lowest: #0e0e0e`. Used to create "voids" and "elevations."
- **Typography:** `on_surface: #e5e2e1` (Off-white) / `on_surface_variant: #d0c5af` (Muted Gold-Cream).

### Structural Rules
- **The "No-Line" Rule:** 1px solid borders for sectioning are strictly prohibited. Layout boundaries must be defined by shifting between `surface` and `surface_container_low`. A section containing a high-end product list should sit on `surface_container_low` against a `surface` background—no lines required.
- **Surface Hierarchy:** Use `surface_container_highest` (`#353534`) for active states or floating elements, and `surface_container_lowest` (`#0e0e0e`) to create a "well" effect for immersive content.
- **The Glass & Gradient Rule:** For overlays and navigation bars, use `surface` with a 70% opacity and a `24px` backdrop blur. Primary buttons should utilize a subtle linear gradient from `primary_fixed_dim` to `primary_container` to provide a metallic sheen rather than a flat plastic look.

---

## 3. Typography
Typography is the voice of the curator. We pair a high-contrast serif with a utilitarian, wide-set sans-serif to mimic luxury fashion mastheads.

- **Headlines (notoSerif):** Used for brand expression. Large scale (`display-lg`: 3.5rem) with tight letter-spacing for a dramatic, editorial impact. 
- **Body (manrope):** Set in `body-md` (0.875rem) with increased letter-spacing (`0.05em`) to maintain legibility against dark backgrounds.
- **Labels:** Small caps or all-caps usage of `manrope` for navigational elements to maintain a minimalist, architectural feel.

---

## 4. Elevation & Depth
In this system, depth is a matter of light and material, not distance.

- **The Layering Principle:** Stack containers using the surface tiers. A `surface_container_low` element placed on a `surface_container_lowest` background creates a "raised" tactile feel without a single drop shadow.
- **Ambient Shadows:** Standard shadows are banned. If a floating element (like a modal) requires separation, use an "Ambient Bloom": a shadow with a `60px` blur, `8%` opacity, using the `primary` gold token as the shadow color.
- **The "Ghost Border" Fallback:** For interactive fields, use a `1px` border of `outline_variant` at `20%` opacity. It should be felt, not seen.
- **The Sharpened Edge:** All containers, buttons, and inputs must use a `0px` border radius. Sharp corners imply precision and heritage.

---

## 5. Components

### Input Fields
- **Aesthetic:** Minimalist, bottom-border only. 
- **State:** The border uses `outline_variant` (`#4d4635`) in default state. Upon focus, the border transitions to `primary` (`#f2ca50`) and a subtle `surface_container_high` background-fill fades in to provide focus.

### Buttons
- **Primary:** `0px` radius, `primary_container` background, `on_primary` text. Use all-caps `label-md`.
- **Secondary:** Ghost style. No background, `0px` border using `primary` at `40%` opacity. 
- **Tertiary:** Text-only with a `primary` underline that expands from the center on hover.

### Cards & Lists
- **Rule:** Forbid divider lines. Use `spacing.8` (2.75rem) of vertical white space to separate entries.
- **Product Cards:** Use `surface_container_low` for the card body. The image should be full-bleed with a subtle `20%` dark overlay to let `on_surface` text pop.

### Signature Component: The "Scent Profile" Chip
- **Style:** Semi-transparent `surface_variant` with a thin `10%` gold ghost border. When selected, the chip fills with a `primary_container` to `primary` vertical gradient.

---

## 6. Do's and Don'ts

### Do
- **Do** use whitespace as a luxury. Allow elements to "breathe" with large padding (`spacing.12` or `16`).
- **Do** use "Editorial Overlap." Let a serif headline partially overlap a product image.
- **Do** use `notoSerif` for numbers (prices, dates) to give them an authoritative weight.

### Don't
- **Don't** use rounded corners (`0px` is the absolute rule).
- **Don't** use pure white text. Only use `on_surface` (#e5e2e1) to avoid harsh optical vibration.
- **Don't** use standard Material shadows. Rely on background color shifts and Glassmorphism for hierarchy.
- **Don't** use icons without context. In a luxury space, text labels are often more sophisticated than "generic" iconography.