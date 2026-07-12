# Tax Calculator — reference (saved before responsive reset)

Use this when re-adding the tax calculator after rebuilding mobile/tablet layouts.

## Game math (BlockSpin cash tax)

Constants in `script.js`:

```js
const TAX_RECEIVE_RATIO = 29091 / 40000;  // ~0.727275 — cash kept per $1 dropped
const TAX_MAX_DROP = 40000;               // max per single drop (BlockSpin Plus)
const TAX_RECEIVE_PER_40K = 29091;        // received from one full $40k drop
```

User enters **how much cash they want to receive** (`want`). Calculator returns **total to withdraw/drop** (`totalWithdraw`).

### `getTaxBreakdown(amountWant)`

1. `totalWithdraw = round(want / TAX_RECEIVE_RATIO)`
2. If `totalWithdraw <= 40000` → single drop, one line: “Drop $X”
3. Else split into full $40k drops + remainder:
   - `full40kCount = floor(totalWithdraw / 40000)`
   - `lastReceive = want - (full40kCount * 29091)`
   - `lastWithdraw = round(lastReceive / TAX_RECEIVE_RATIO)`
   - Lines: “Drop $40,000 × N” (+ “Then drop $X” if remainder)

## Desktop UI (sidebar)

**Location:** `#tax-sidebar-column` → `aside.tax-calculator` in `index.html`

**Elements:**

| ID / selector | Role |
|---------------|------|
| `#taxInput` | Number input — desired receive amount |
| `#tax-amount` | Shows total withdraw (with “After Tax” label) |
| `#tax-breakdown` | Step-by-step drop instructions |
| `.tax-badge-wrapper` | Verified badge + tooltip |
| `.tax-reminders` | How-it-works bullets (Plus required, 60k reset cap, etc.) |

**Init:** `initTaxCalculator()` on DOMContentLoaded — strips non-digits on input/paste, calls `getTaxBreakdown`, renders via `buildTaxBreakdownHtml()`.

**Reusable widget:** `bindTaxCalcWidget(root)` uses `data-tax-input`, `data-tax-amount`, `data-tax-breakdown` for embedded copies.

## Section visibility

`section-config.js` → `applyVisibilityMode(taxCalc, cfg.taxCalc, …)` toggles sidebar calculator per section (`show` / `hide` / `ghost`). Home often hides or ghosts the calc depending on config.

## Mobile panel (removed in responsive reset)

Previously duplicated the calculator in `#mobile-tax-calc`:

- Blue arrow `#mobile-calc-arrow` on item sections (≤1024px)
- Slide-in panel with `#mobile-tax-input`, `#mobile-tax-amount`, `#mobile-tax-breakdown`
- On **Home**: panel showed **Value Changes** (`#mobile-recent-changes`) instead of calc
- On **Accessories / Money Guide / Crew Logos**: panel swapped to fast-nav buttons (`renderMobileGuideFastNav`)
- Section list from `getMobileTaxArrowSectionIds()` (registry `mobileTaxArrow: true`)

Same `getTaxBreakdown()` / `buildTaxBreakdownHtml()` logic; only DOM targets differed.

## i18n keys (`site-i18n.js`)

- `tax.title`, `tax.placeholder`, `tax.tooltip`, `tax.howTitle`, `tax.howIntro`, `tax.bullets`
- `tax.howLabel`, `tax.dropAmount`, `tax.drop40kTimes`, `tax.drop40kTimesOnce`, `tax.thenDrop`
- `tax.openMobile` (mobile arrow aria)

## Related sidebar content

Same column often includes:

- `#home-value-changes` — Value Changes list (`loadValueChanges()` → `#value-changes-list`)
- `.discord-mm-promo--sidebar` — middleman promo

## Files to touch when restoring

- `index.html` — sidebar markup (+ optional new mobile markup)
- `script.js` — constants, `getTaxBreakdown`, `initTaxCalculator`, `loadValueChanges`
- `style.css` — `.tax-calculator`, `.tax-sidebar-column`, `.tax-result`, etc.
- `section-config.js` — per-section `taxCalc` visibility
