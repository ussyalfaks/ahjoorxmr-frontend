# Bundle Analysis Guide

Run `pnpm analyze` to generate bundle reports.

## Performance Budgets

| Metric | Budget |
|--------|--------|
| First Load JS (shared) | < 100 kB |
| Largest page bundle | < 200 kB |
| Total images | < 500 kB |

## Tips
- Use `next/dynamic` for heavy components (charts, editors, PDFs)
- Audit dependencies with `pnpm why <package>`
