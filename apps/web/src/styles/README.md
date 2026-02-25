# Design system

Light, calm UI. White background, soft blue accent, thin borders.

## Structure

- **tokens.css** — CSS variables: colors, typography, spacing, radius, shadow. Single source of truth.
- **base.css** — reset, body, default links/buttons/inputs.
- **components.css** — layout, header, cards, forms, buttons, status badges. Uses tokens only.

## Tokens

| Token group | Usage |
|-------------|--------|
| `--color-*` | Background (bg, surface), border, text (text, text-muted, text-faint), accent (accent, accent-hover, accent-muted), semantic (success, error, warning) |
| `--font-*` | Sans family (Inter), sizes (xs–2xl), weights (normal, medium, semibold), line-height |
| `--space-*` | 1–10 (4px base scale) |
| `--radius-*` | sm (4px), md (6px), lg (8px) |
| `--shadow-*` | sm, md — very subtle |
| `--border-width` | 1px |

Use tokens in new components; avoid hardcoded colors or spacing.
