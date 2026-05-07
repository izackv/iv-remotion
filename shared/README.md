# Shared Remotion Library

Reusable components, branding system, and utilities for Remotion video projects.

## Setup

Add to a new project by creating a symlink inside `src/`:

```bash
ln -s /Users/ivarsann/Data/projects/Video/shared YourProject/src/shared
```

Then import in your components:

```tsx
import { BrandingProvider, resolveBranding, loadBrandingFonts } from "./shared/branding";
import { BarChart } from "./shared/components";
import { VintageOverlay } from "./shared/effects";
import { geocode, generateArc, computeFitZoom } from "./shared/utils";
```

**Dependencies:** The shared code depends on `react`, `zod`, `remotion`, `@remotion/zod-types`, and `@remotion/google-fonts`. Map utilities also require `@turf/turf`. Chart line animation requires `@remotion/paths`. Make sure your project has them installed.

**tsconfig.json:** Add `"../shared"` to the `include` array so TypeScript can type-check the shared code:

```json
{
  "include": ["src", "../shared"]
}
```

**remotion.config.ts:** Add `resolve.symlinks: false` to your webpack config so imports from the symlinked shared folder resolve modules from your project's `node_modules`:

```ts
import { Config } from "@remotion/cli/config";

Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    symlinks: false,
  },
}));
```

---

## Branding System

A shared branding system that lets you define, select, and override visual themes across all components.

### Usage

```tsx
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "./shared/branding";

// In your composition component:
const branding = resolveBranding(brandingSelection);
const { headingFontFamily, bodyFontFamily } = loadBrandingFonts(branding);

return (
  <BrandingProvider selection={brandingSelection}>
    {/* All child components can call useBranding() */}
  </BrandingProvider>
);
```

### Presets

| Preset | Background | Primary | Fonts | Style |
|--------|-----------|---------|-------|-------|
| `corporate` | White | Blues (#1a365d) | Inter | Conservative, 4px radius |
| `modern` | Dark (#111827) | Purple (#8b5cf6) | Space Grotesk + Inter | Vibrant, 8px radius |
| `minimal` | Near-white (#fafafa) | Black (#18181b) | Inter | Spare, 2px radius |
| `redhat-light` | White | Red Hat Red (#ee0000) | Red Hat Display + Text | Official Red Hat brand |
| `redhat-dark` | Dark (#151515) | Red Hat Red (#ee0000) | Red Hat Display + Text | Dark Red Hat brand |

### Overrides

Use the `overrides` field to tweak individual values on top of a preset:

```tsx
const selection = {
  preset: "redhat-light",
  overrides: { primaryColor: "#0066cc", borderRadius: 8 },
};
```

### Branding Shape

`primaryColor`, `secondaryColor`, `accentColor`, `backgroundColor`, `textColor`, `headingFont`, `bodyFont`, `fontSizeBase`, `fontSizeLg`, `fontSizeXl`, `borderRadius`, `spacing`

---

## Components

All components are branding-aware (read colors/fonts via `useBranding()`), animated via `useCurrentFrame()`, and parametrizable with Zod schemas for Remotion Studio editing. Every component accepts `duration` (in seconds) and `animationDelay` (in frames).

### Data & Charts

#### `BarChart`
Vertical bars with staggered entrance animation. Supports CSV/JSON file or inline data.

```csv
<!-- public/bar-chart-data.csv -->
label,value
Q1,120
Q2,250
Q3,180
Q4,310
```

```tsx
// Load from CSV
<BarChart dataFile="bar-chart-data.csv" duration={2} />

// Or inline data
<BarChart
  items={[{ label: "Q1", value: 120 }, { label: "Q2", value: 250 }]}
  duration={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataFile` | `string` | `""` | CSV/JSON file in `public/` |
| `labelColumn` | `string` | `"label"` | CSV column for labels |
| `valueColumn` | `string` | `"value"` | CSV column for values |
| `items` | `{ label, value, color? }[]` | `[]` | Inline data (alternative to file) |
| `maxValue` | `number` | auto | Scale ceiling |
| `showLabels` | `boolean` | `true` | Show X-axis labels |
| `showValues` | `boolean` | `true` | Show values above bars |
| `duration` | `number` | `2` | Animation duration (seconds) |

#### `PieChart`
Animated segments using stroke-dashoffset, starting from 12 o'clock. Supports CSV/JSON file or inline data.

```tsx
// Load from CSV
<PieChart dataFile="pie-chart-data.csv" innerRadius={0.5} duration={2} />

// Or inline data
<PieChart
  segments={[{ label: "A", value: 40 }, { label: "B", value: 60 }]}
  innerRadius={0.5}
  duration={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataFile` | `string` | `""` | CSV/JSON file in `public/` |
| `labelColumn` | `string` | `"label"` | CSV column for labels |
| `valueColumn` | `string` | `"value"` | CSV column for values |
| `segments` | `{ label, value, color? }[]` | `[]` | Inline data (alternative to file) |
| `innerRadius` | `number` | `0` | 0 = full pie, 0-1 = donut |
| `showLabels` | `boolean` | `true` | Show segment labels |
| `duration` | `number` | `2` | Animation duration (seconds) |

#### `LineChart`
Animated path drawing with dots, grid, and values. Supports CSV/JSON file or inline data.

```tsx
// Load from CSV
<LineChart dataFile="line-chart-data.csv" duration={2} />

// Or inline data
<LineChart
  points={[{ label: "Jan", value: 30 }, { label: "Feb", value: 45 }]}
  duration={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataFile` | `string` | `""` | CSV/JSON file in `public/` |
| `labelColumn` | `string` | `"label"` | CSV column for labels |
| `valueColumn` | `string` | `"value"` | CSV column for values |
| `points` | `{ label, value }[]` | `[]` | Inline data (alternative to file) |
| `lineColor` | `string` | branding primary | Line color |
| `lineWidth` | `number` | `3` | Stroke width |
| `showDots` / `showLabels` / `showValues` / `showGrid` | `boolean` | `true` | Toggle elements |
| `duration` | `number` | `2` | Animation duration (seconds) |

#### `Counter`
Animated number counting up with prefix/suffix.

```tsx
<Counter value={2.4} prefix="$" suffix="M" label="Revenue" decimals={1} duration={2} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Target number |
| `prefix` / `suffix` | `string` | `""` | e.g. `"$"`, `"M"`, `"%"` |
| `label` | `string` | `""` | Description below number |
| `decimals` | `number` | `0` | Decimal places |
| `startFrom` | `number` | `0` | Starting number |
| `duration` | `number` | `2` | Animation duration (seconds) |

#### `Table`
Rows appear with staggered fade + slide animation. Supports CSV file (headers auto-detected from first row) or inline data.

```csv
<!-- public/table-data.csv -->
Region,Q1,Q2,Q3,Q4
North America,$1.2M,$1.5M,$1.8M,$2.1M
Europe,$0.8M,$0.9M,$1.1M,$1.3M
```

```tsx
// Load from CSV (headers auto-detected)
<Table dataFile="table-data.csv" duration={2} />

// Or inline data
<Table
  headers={["Region", "Q1", "Q2"]}
  rows={[["North America", "$1.2M", "$1.5M"], ["Europe", "$0.8M", "$0.9M"]]}
  duration={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataFile` | `string` | `""` | CSV file in `public/` (first row = headers) |
| `headers` | `string[]` | `[]` | Column headers (auto from CSV) |
| `rows` | `string[][]` | `[]` | Row data (auto from CSV) |
| `highlightColor` | `string` | branding tint | Alternating row color |
| `duration` | `number` | `2` | Animation duration (seconds) |

#### `ProgressBar`
Horizontal bar or circular ring with optional phases.

```tsx
// Simple horizontal
<ProgressBar value={75} label="Complete" variant="horizontal" duration={2} />

// Circular with phases
<ProgressBar
  value={100}
  variant="circular"
  size={280}
  thickness={18}
  phases={[
    { label: "Planning", value: 15, color: "#0066cc" },
    { label: "Dev", value: 40, color: "#3e8635" },
  ]}
  duration={3}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Progress 0-100 |
| `variant` | `"horizontal" \| "circular"` | `"horizontal"` | Visual style |
| `phases` | `{ label, value, color? }[]` | optional | Circular phases (linear sequence) |
| `thickness` | `number` | `20` | Bar height or ring stroke |
| `size` | `number` | `200` | Circular variant diameter |
| `duration` | `number` | `2` | Animation duration (seconds) |

### Layout & Structure

#### `TitleSlide`
Large heading with subtitle, accent line, and optional logo.

```tsx
<TitleSlide
  heading="Quarterly Review"
  subtitle="Q4 2025 Performance"
  logoSrc="https://example.com/logo.png"
  logoPosition="top-left"
  duration={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `heading` | `string` | required | Main title |
| `subtitle` | `string` | `""` | Subtitle text |
| `logoSrc` | `string` | `""` | Logo image URL |
| `logoSize` | `number` | `80` | Logo height (px) |
| `logoPosition` | `"top-left" \| "top-right" \| "top-center" \| "bottom-center"` | `"top-left"` | Logo placement |
| `accentLine` | `boolean` | `true` | Show accent line |
| `duration` | `number` | `2` | Animation duration (seconds) |

#### `BulletList`
Items appearing one by one with slide/fade animation.

```tsx
<BulletList
  items={[{ text: "First point", subtext: "Details here" }, { text: "Second point" }]}
  bulletStyle="arrow"
  duration={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `{ text, subtext? }[]` | required | List items |
| `bulletStyle` | `"dot" \| "number" \| "dash" \| "arrow" \| "check"` | `"dot"` | Bullet indicator |
| `bulletColor` | `string` | branding primary | Bullet color |
| `duration` | `number` | `2` | Animation duration (seconds) |

#### `Quote`
Highlighted text block with accent bar.

```tsx
<Quote
  text="Any sufficiently advanced technology is indistinguishable from magic."
  attribution="Arthur C. Clarke"
  variant="left-bar"
  duration={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | Quote text |
| `attribution` | `string` | `""` | Author or source |
| `variant` | `"left-bar" \| "top-bar" \| "large-quote"` | `"left-bar"` | Visual style |
| `accentColor` | `string` | branding primary | Accent bar color |
| `duration` | `number` | `2` | Animation duration (seconds) |

#### `TwoColumnCompare`
Side-by-side comparison with staggered item animation.

```tsx
<TwoColumnCompare
  left={{ heading: "Pros", items: ["Open source", "Secure"] }}
  right={{ heading: "Cons", items: ["Learning curve"] }}
  variant="pros-cons"
  duration={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `left` / `right` | `{ heading, items, color? }` | required | Column content |
| `variant` | `"pros-cons" \| "before-after" \| "plain"` | `"plain"` | Visual style |
| `divider` | `boolean` | `true` | Show center divider |
| `duration` | `number` | `2` | Animation duration (seconds) |

#### `Timeline`
Milestones with dots and connecting lines, horizontal or vertical.

```tsx
<Timeline
  milestones={[
    { title: "Kickoff", date: "Q1", description: "Planning phase" },
    { title: "Launch", date: "Q4", description: "Public release" },
  ]}
  variant="vertical"
  duration={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `milestones` | `{ title, date?, description?, color? }[]` | required | Milestone data |
| `variant` | `"horizontal" \| "vertical"` | `"vertical"` | Layout direction |
| `duration` | `number` | `2` | Animation duration (seconds) |

#### `IconGrid`
Grid of icons with labels and descriptions.

```tsx
<IconGrid
  items={[{ icon: "rocket", label: "Fast", description: "Ship in minutes" }]}
  columns={3}
  duration={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `{ icon, label, description?, color? }[]` | required | Grid items |
| `columns` | `number` | `3` | Number of columns |
| `iconSize` | `number` | `48` | Icon size (px) |
| `duration` | `number` | `2` | Animation duration (seconds) |

Built-in icons: `check`, `star`, `heart`, `lightning`, `shield`, `globe`, `users`, `chart`, `gear`, `rocket`, `lock`, `cloud`, `code`. You can also pass a custom SVG path string as the `icon` value.

#### `VennDiagram`
2-3 overlapping circles with slide-in animation.

```tsx
<VennDiagram
  circles={[{ label: "Design" }, { label: "Engineering" }]}
  overlapLabel="UX"
  duration={2}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `circles` | `{ label, color? }[]` | required (2-3) | Circle data |
| `overlapLabel` | `string` | `""` | Center overlap label |
| `overlapAmount` | `number` | `0.35` | Overlap ratio (0-1) |
| `circleRadius` | `number` | `150` | Circle radius (px) |
| `duration` | `number` | `2` | Animation duration (seconds) |

#### `SlideFrame`
Reusable slide wrapper with header (title, subtitle, logo), accent line, footer, and content area. Nest any component inside.

```tsx
<SlideFrame
  title="Revenue by Quarter"
  subtitle="FY 2025"
  footer="Confidential"
  footerRight="Page 3"
  logoSrc="logo.png"
  duration={1}
>
  <BarChart {...chartData} animationDelay={15} duration={3} />
</SlideFrame>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `""` | Header title |
| `subtitle` | `string` | `""` | Smaller text next to title |
| `logoSrc` | `string` | `""` | Logo image URL or static path |
| `logoSize` | `number` | `48` | Logo height (px) |
| `footer` | `string` | `""` | Left footer text |
| `footerRight` | `string` | `""` | Right footer text |
| `accentLine` | `boolean` | `true` | Show accent line below header |
| `accentColor` | `string` | branding primary | Override accent line color |
| `contentPadding` | `number` | `48` | Padding around content area (px) |
| `duration` | `number` | `1` | Frame entrance animation (seconds) |

Use `animationDelay` on the child component to sequence it after the frame appears (e.g. `animationDelay={15}` at 30fps = 0.5s delay).

### Terminal & Code

#### `TerminalReplay`
Replays an [asciinema](https://asciinema.org/) `.cast` recording frame-by-frame. Supports ANSI colors, cursor blink, and macOS window chrome.

```bash
# Record a session
brew install asciinema
asciinema rec public/my-session.cast
```

```tsx
// Load from file in public/
<TerminalReplay castFile="my-session.cast" />

// Or inline content
<TerminalReplay castContent={rawCastString} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `castFile` | `string` | `""` | Path to `.cast` file in `public/` |
| `castContent` | `string` | `""` | Raw `.cast` content (alternative to file) |
| `speed` | `number` | `1` | Playback speed multiplier |
| `fontSize` | `number` | `16` | Terminal font size (px) |
| `lineHeight` | `number` | `1.4` | Line height multiplier |
| `showHeader` | `boolean` | `true` | Show terminal window header bar |
| `title` | `string` | `"Terminal"` | Window title text |
| `maxLines` | `number` | `30` | Max visible lines (scrolls if exceeded) |
| `bgColor` | `string` | `"#1e1e1e"` | Terminal background color |
| `textColor` | `string` | `"#abb2bf"` | Default text color |
| `animationDelay` | `number` | `0` | Delay before replay starts (frames) |

#### `TerminalScripted`
Scripted terminal — you define exactly what text appears, when, and whether it's typed out character-by-character or shown instantly. No real recording needed.

```tsx
<TerminalScripted
  lines={[
    { text: "npm install", startTime: 0.5, typed: true, typingSpeed: 25, prompt: "$ " },
    { text: "added 233 packages in 3s", startTime: 2.0 },
    { text: "npm start", startTime: 3.0, typed: true, typingSpeed: 25, prompt: "$ " },
    { text: "Server ready!", startTime: 4.5, color: "#98c379", bold: true },
  ]}
/>

// Or load lines from a JSON file in public/
<TerminalScripted linesFile="docker-demo.json" />
```

**Line props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | Text to display (supports `\n`) |
| `startTime` | `number` | required | When this line appears (seconds) |
| `typed` | `boolean` | `false` | Type out char-by-char |
| `typingSpeed` | `number` | `30` | Characters per second (when typed) |
| `prompt` | `string` | `""` | Prompt prefix (e.g. `"$ "`) |
| `color` | `string` | default fg | Override text color |
| `bold` | `boolean` | `false` | Bold text |

**Component props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `linesFile` | `string` | `""` | Path to JSON file in `public/` containing lines array |
| `lines` | `Line[]` | `[]` | Inline lines (alternative to file) |
| `fontSize` | `number` | `18` | Terminal font size (px) |
| `lineHeight` | `number` | `1.5` | Line height multiplier |
| `showHeader` | `boolean` | `true` | Show terminal window header bar |
| `title` | `string` | `"Terminal"` | Window title text |
| `maxLines` | `number` | `28` | Max visible lines |
| `bgColor` | `string` | `"#1e1e1e"` | Terminal background color |
| `textColor` | `string` | `"#abb2bf"` | Default text color |
| `promptColor` | `string` | `"#98c379"` | Prompt color |
| `animationDelay` | `number` | `0` | Delay before replay starts (frames) |

#### `Annotation`
Overlay wrapper that adds timed annotations on top of any child content. Wrap any component (terminal, chart, etc.) to add circles, arrows, notes, and zoom.

```tsx
<Annotation
  annotations={[
    { type: "circle", x: 50, y: 80, width: 30, height: 6, startTime: 3, color: "#ee0000" },
    { type: "note", x: 60, y: 70, text: "Important!", fontSize: 18, startTime: 3.5, color: "#fff", bgColor: "#ee0000" },
    { type: "arrow", fromX: 60, fromY: 74, toX: 55, toY: 79, startTime: 3.5, color: "#ee0000" },
    { type: "zoom", x: 50, y: 80, scale: 2, startTime: 4, endTime: 6, transitionDuration: 0.5 },
  ]}
>
  <TerminalScripted {...terminalProps} />
</Annotation>
```

All coordinates are **0-100%** of the container. All timing is in **seconds**.

**Circle:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `x` / `y` | `number` | required | Center position (0-100%) |
| `width` / `height` | `number` | `15` / `8` | Ellipse size (%) |
| `color` | `string` | `"#ee0000"` | Stroke color |
| `strokeWidth` | `number` | `3` | Border width |
| `startTime` | `number` | required | When to appear (seconds) |
| `endTime` | `number` | optional | When to disappear (omit = stay) |

**Arrow:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fromX` / `fromY` | `number` | required | Start position (0-100%) |
| `toX` / `toY` | `number` | required | End position (0-100%) |
| `color` | `string` | `"#ee0000"` | Color |
| `strokeWidth` | `number` | `3` | Line width |
| `startTime` / `endTime` | `number` | required / optional | Timing |

**Note:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `x` / `y` | `number` | required | Position (0-100%) |
| `text` | `string` | required | Label text |
| `fontSize` | `number` | `20` | Font size (px) |
| `color` | `string` | `"#ee0000"` | Text color |
| `bgColor` | `string` | `"rgba(0,0,0,0.8)"` | Background color |
| `startTime` / `endTime` | `number` | required / optional | Timing |

**Zoom:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `x` / `y` | `number` | required | Zoom center (0-100%) |
| `scale` | `number` | `2` | Zoom level |
| `startTime` | `number` | required | When zoom starts |
| `endTime` | `number` | required | When zoom ends |
| `transitionDuration` | `number` | `0.5` | Zoom in/out transition (seconds) |

### Maps & Geo

#### `GeoHeatmap`
Graduated circle map with auto-geocoding. Loads data from CSV/JSON, geocodes city names, and renders circles sized by value on a world map with country outlines. Auto-zooms to fit data bounds.

```csv
<!-- public/sales-data.csv -->
city,value
New York,4500
London,3200
Tokyo,2800
```

```tsx
// Load from CSV file
<GeoHeatmap dataFile="sales-data.csv" duration={3} />

// Or inline data (with optional pre-geocoded coordinates)
<GeoHeatmap
  data={[
    { city: "New York", value: 4500, lng: -74.006, lat: 40.7128 },
    { city: "London", value: 3200 },
  ]}
  duration={3}
/>
```

**Animation sequence:** Full world view → zoom to data bounds → data points appear with stagger.

**Disambiguating cities:** Use specific names like `"Jericho, New York, USA"` vs `"Jericho, Palestine"`, or provide `lng`/`lat` columns directly.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataFile` | `string` | `""` | Path to CSV/JSON file in `public/` |
| `data` | `{ city, value, lng?, lat? }[]` | `[]` | Inline data (alternative to file) |
| `cityColumn` | `string` | `"city"` | CSV column name for city |
| `valueColumn` | `string` | `"value"` | CSV column name for value |
| `lngColumn` / `latColumn` | `string` | `"lng"` / `"lat"` | CSV columns for coordinates |
| `minRadius` | `number` | `6` | Smallest circle radius (px) |
| `maxRadius` | `number` | `40` | Largest circle radius (px) |
| `showLabels` | `boolean` | `true` | Show city name labels |
| `showValues` | `boolean` | `true` | Show value inside circles |
| `colorLow` | `string` | branding secondary | Color for low values |
| `colorHigh` | `string` | branding primary | Color for high values |
| `showLandmasses` | `boolean` | `true` | Show country outlines |
| `geoJsonFile` | `string` | `"world-110m.geojson"` | GeoJSON file for map |
| `landColor` | `string` | text @ 10% | Country fill color |
| `landStrokeColor` | `string` | text @ 25% | Country border color |
| `zoomPadding` | `number` | `0.15` | Padding around data bounds (0-1) |
| `zoomDuration` | `number` | `1.5` | Zoom-in animation (seconds) |
| `duration` | `number` | `3` | Data points animation (seconds) |

**Required file:** Place `world-110m.geojson` (Natural Earth 110m) in your project's `public/` folder.

#### `FlightRoute`
Animated flight path between two cities on an interactive MapLibre map. Shows a great-circle arc being drawn with a dashed line, an airplane following the route, and a camera that starts zoomed on the origin, then pans and zooms out to show the full route.

```tsx
<FlightRoute
  origin="New York, USA"
  destination="Tokyo, Japan"
  mapStyle="vintage"
  duration={6}
/>
```

**Map styles:**
- `"vintage"` — sepia-toned map with parchment VintageOverlay (old map look)
- `"realistic"` — clean OpenFreeMap tiles, no filters
- `"dark"` — dark-themed map tiles

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `origin` | `string` | required | Origin city (e.g. `"New York, USA"`) |
| `destination` | `string` | required | Destination city |
| `mapStyle` | `"realistic" \| "vintage" \| "dark"` | `"vintage"` | Map visual style |
| `lineColor` | `string` | branding primary | Route line color |
| `markerColor` | `string` | branding primary | City marker color |
| `showAirplane` | `boolean` | `true` | Show airplane marker following the route |
| `showLabels` | `boolean` | `true` | Show city name labels |
| `duration` | `number` | `6` | Total animation duration (seconds) |

**Animation sequence:** Zoomed on origin → zoom out + pan to midpoint → dashed route draws along great-circle arc → airplane follows with correct bearing → holds on final view.

**Dependencies:** Requires `maplibre-gl` and `@turf/turf` installed in the project. Rendering requires ANGLE GL — add `Config.setChromiumOpenGlRenderer("angle")` to `remotion.config.ts` and use `--gl=angle` when rendering:

```bash
npx remotion render --gl=angle FlightRouteVintage out/flight.mp4
```

### Effects

#### `VintageOverlay`
A parchment/aged-look overlay combining a radial vignette with a paper grain texture.

```tsx
<VintageOverlay width={1920} height={1080} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | required | Width in pixels |
| `height` | `number` | required | Height in pixels |
| `vignetteOpacity` | `number` | `0.35` | Brown vignette edge opacity |
| `grainOpacity` | `number` | `0.08` | Paper grain texture opacity |

### Map Utilities

#### `geocode(query: string)`
Resolves a place name (e.g. `"Paris, France"`) to `{ name, lng, lat }` using the Photon (Komoot) API.

#### `generateArc(start, end, numPoints?)`
Generates a great-circle arc between two `[lng, lat]` points. Returns unwrapped longitudes for correct antimeridian rendering.

#### `computeFitZoom(start, end)`
Returns a map zoom level (2-9) that fits both points on a 1920x1080 viewport.

---

## Using with PowerPoint & Google Slides

Render components as videos or images, then embed them in your slides.

### Render as MP4 (recommended)

```bash
# Render a single composition
npx remotion render BarChart out/bar-chart.mp4

# Smaller file size (good for presentations)
npx remotion render --crf=28 BarChart out/bar-chart.mp4

# Render all compositions
for comp in BarChart PieChart LineChart Counter Table ProgressBar ProgressBarCircular \
  VennDiagram TitleSlide BulletList QuoteLeftBar QuoteLarge TimelineVertical \
  TimelineHorizontal IconGrid CompareProsCons CompareBeforeAfter \
  SlideFrameBar SlideFramePie TerminalReplay TerminalScripted GeoHeatmap \
  FlightRouteVintage FlightRouteRealistic; do
  npx remotion render --gl=angle --crf=28 "$comp" "out/$comp.mp4"
done
```

**PowerPoint:** Insert > Video > Video on My PC. Set to autoplay via Playback > Start: Automatically.

**Google Slides:** Insert > Video > Upload (max 100MB per video).

### Render as GIF (no play controls)

```bash
npx remotion render --codec=gif BarChart out/bar-chart.gif
```

Insert as an image — it animates automatically. Good for simple animations, but larger files and limited to 256 colors.

### Render as Still Image

```bash
npx remotion still BarChart out/bar-chart.png
```

Captures the final frame. Use when you don't need the animation.

### Transparent Background (overlay on slides)

Render with alpha transparency so the animation sits on top of your slide's own background:

```bash
# WebM with transparency (PowerPoint 2019+)
npx remotion render --codec=vp8 BarChart out/bar-chart.webm
```

Set the composition's `backgroundColor` to transparent in your component, or use an override:

```json
{ "preset": "redhat-light", "overrides": { "backgroundColor": "rgba(0,0,0,0)" } }
```

### Tips

- Keep animations short (2-3s) so they finish when the slide appears
- Use `--crf=28` or higher for presentation-friendly file sizes (~300-500KB/s)
- Set videos to autoplay and loop if the slide stays visible
- For consistent branding across slides, render all components with the same preset
