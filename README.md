# iv-remotion

A library of reusable [Remotion](https://remotion.dev/) components for creating animated data visualizations, presentation slides, terminal replays, maps, and more — all branding-aware and parametrizable.

## Structure

- **`shared/`** — Reusable components, branding system, effects, and utilities. See [`shared/README.md`](shared/README.md) for full API docs.
- **`Presentation/`** — A Remotion project that showcases all shared components with demo compositions.

## Components

| Category | Components |
|----------|------------|
| **Charts & Data** | BarChart, PieChart, LineChart, Counter, Table, ProgressBar |
| **Layout** | TitleSlide, BulletList, Quote, TwoColumnCompare, Timeline, IconGrid, VennDiagram, SlideFrame |
| **Terminal** | TerminalReplay (asciinema), TerminalScripted |
| **Maps & Geo** | GeoHeatmap, FlightRoute |
| **Effects** | VintageOverlay, Annotation |

All components support a shared branding system with presets (`corporate`, `modern`, `minimal`, `redhat-light`, `redhat-dark`) and per-property overrides.

## Quick Start

```bash
cd Presentation
npm install
npx remotion studio
```

## Rendering

```bash
# Single composition
npx remotion render BarChart out/BarChart.mp4

# With GL (required for map components)
npx remotion render --gl=angle FlightRouteVintage out/FlightRoute.mp4
```

## Using in Your Own Project

See [`shared/README.md`](shared/README.md) for setup instructions (symlink, tsconfig, webpack config, and dependencies).
