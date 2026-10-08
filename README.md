# Nexus Analytics — Studio Website

A React multi-page site for Nexus Analytics: Home, About, Power BI
Dashboards, Team, and Contact. Built with Vite, React Router, and
Framer Motion, and structured as small reusable components rather
than one file per page.

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev
```

This starts a local dev server (default `http://localhost:5173`) with
hot reload. To build for production:

```bash
npm run build
npm run preview   # serve the production build locally to check it
```

The build output lands in `dist/` — deploy that folder to any static
host (Vercel, Netlify, GitHub Pages, S3, etc.).

## Project structure

```
src/
  components/
    layout/       Navbar, Footer, PageTransition — shared page chrome
    ui/            Hex, Reveal, SectionHead, PageHeader — reusable primitives
    sections/      Hero, ServiceGrid, TeamStrip, CtaBand — Home-page blocks
    dashboard/     BarChart, DonutChart, KpiCard — the dashboard widgets
  pages/           One file per route: Home, About, Dashboards, Team,
                   Contact, NotFound
  data/            Content as data (team.js, nav.js, services.js,
                   dashboardData.js, values.js) — edit these instead of
                   digging through JSX to change copy
  hooks/           useScrollToTop
  styles/          tokens.css (design tokens) + global.css (reset & utilities)
```

Each page composes section/UI components rather than containing raw
markup, so most changes are either a data-file edit or a one-component
swap.

## Editing content

- **Team members** — `src/data/team.js`. Also used by the Home page
  team strip and the Contact page's "reaches" panel, so it only needs
  editing once.
- **Nav links** — `src/data/nav.js`. Feeds both the desktop and mobile
  nav automatically.
- **Services / studio values** — `src/data/services.js`,
  `src/data/values.js`.
- **Dashboard sample data** — `src/data/dashboardData.js`. The
  Dashboards page's KPIs, bar chart, and donut chart all read from
  here, keyed by region.
- **Colors, type, spacing** — `src/styles/tokens.css`. Every component
  uses these CSS variables, so a token change here propagates
  site-wide.

## Wiring up a real Power BI report

The Dashboards page (`src/pages/Dashboards.jsx`) currently renders an
interactive **mock** dashboard from local sample data — it's fully
functional (region filtering, animated charts) but not a live report.

To embed a real Power BI report:

1. `npm install powerbi-client-react powerbi-client`
2. Get an embed URL and access token for your report (from Power BI
   workspace settings or your backend's embed-token endpoint).
3. In `Dashboards.jsx`, replace the `<div className={styles.frame}>`
   contents with a `<PowerBIEmbed>` component configured with your
   `embedUrl`, `accessToken`, and report `id`. The surrounding page
   layout, filter row, and catalog section can stay as-is.

## Contact form

The form in `src/pages/Contact.jsx` validates client-side and shows a
success state, but the actual submission is a placeholder `setTimeout`
— it doesn't send anywhere yet. Point `handleSubmit` at a real
endpoint (a form service like Formspree, or your own backend route)
to make it functional.

## Notes

- Respects `prefers-reduced-motion` — animations are disabled
  automatically for users who request it at the OS level.
- All interactive elements have visible keyboard focus states.
- Fully responsive down to small mobile widths.
