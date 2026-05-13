# Kibana Web

A premium handbag e-commerce storefront, designed to match the Kibana mockup. Built on the team's standard stack.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** with the `kibana` brand palette
- **shadcn/ui**-style primitives (Button, Card, Badge, Input)
- **Lucide React** icons
- **Zustand** for the cart, **TanStack Query** for server state (ready to wire to tRPC + Supabase)
- **Zod** for schema validation
- **React Hook Form** for the newsletter / forms

The same components are designed to drop straight into a Turborepo monorepo alongside `apps/mobile` (Expo + NativeWind + React Native Reusables).

## Run locally

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

## Pages

- `/` — Home (matches the Kibana mockup: hero, new arrivals, best sellers, categories, price, trending, style, trust badges, review, newsletter, footer)
- `/shop` — Product listing with filterable category pills
- `/shop/[slug]` — Product detail page

## Project layout

```
src/
├── app/                 # Next.js App Router pages
├── components/
│   ├── ui/              # shadcn-style primitives
│   ├── layout/          # header, footer, mobile bottom nav
│   ├── home/            # home page sections
│   └── product/         # product card / detail
├── lib/                 # data + helpers
├── store/               # zustand stores
└── types/               # shared zod schemas + types
```

## Responsive design

The mockup is mobile-first. The layout reads as a single column at narrow widths (mirroring the PDF) and progressively expands to 2- and 4-column grids on `md` and `lg` breakpoints for desktop.
