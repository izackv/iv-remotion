import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
  delayRender,
  continueRender,
} from "remotion";
import { useBranding } from "../branding";
import { geocode, parseCsv } from "../utils";

// --- Projection (equirectangular) ---

function project(
  lng: number,
  lat: number,
  width: number,
  height: number,
  padding: number,
): { x: number; y: number } {
  const mapWidth = width - padding * 2;
  const mapHeight = height - padding * 2;
  const x = padding + ((lng + 180) / 360) * mapWidth;
  const y = padding + ((90 - lat) / 180) * mapHeight;
  return { x, y };
}

// --- GeoJSON to SVG path conversion ---

interface GeoFeature {
  type: string;
  properties: { name: string };
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][] | number[][][][];
  };
}

function ringToSvgPath(
  ring: number[][],
  width: number,
  height: number,
  padding: number,
): string {
  return ring
    .map((coord, i) => {
      const { x, y } = project(coord[0], coord[1], width, height, padding);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ") + "Z";
}

function featureToSvgPaths(
  feature: GeoFeature,
  width: number,
  height: number,
  padding: number,
): string[] {
  const { type, coordinates } = feature.geometry;
  const paths: string[] = [];

  if (type === "Polygon") {
    const rings = coordinates as number[][][];
    paths.push(ringToSvgPath(rings[0], width, height, padding));
  } else if (type === "MultiPolygon") {
    const polys = coordinates as number[][][][];
    for (const poly of polys) {
      paths.push(ringToSvgPath(poly[0], width, height, padding));
    }
  }
  return paths;
}

// --- Data types ---

interface GeoPoint {
  city: string;
  value: number;
  lng: number;
  lat: number;
}

const geoPointSchema = z.object({
  city: z.string(),
  value: z.number(),
  lng: z.number().optional().describe("Longitude (auto-geocoded if omitted)"),
  lat: z.number().optional().describe("Latitude (auto-geocoded if omitted)"),
});

export const geoHeatmapDataSchema = z.object({
  dataFile: z
    .string()
    .default("")
    .describe("Path to CSV or JSON file in public/ (columns: city, value, optional lng/lat)"),
  data: z
    .array(geoPointSchema)
    .default([])
    .describe("Inline data points (alternative to dataFile)"),
  cityColumn: z.string().default("city").describe("CSV column name for city"),
  valueColumn: z.string().default("value").describe("CSV column name for value"),
  lngColumn: z.string().default("lng").describe("CSV column name for longitude"),
  latColumn: z.string().default("lat").describe("CSV column name for latitude"),
  minRadius: z.number().default(6).describe("Minimum circle radius (px)"),
  maxRadius: z.number().default(40).describe("Maximum circle radius (px)"),
  showLabels: z.boolean().default(true).describe("Show city labels"),
  showValues: z.boolean().default(true).describe("Show value labels"),
  colorLow: zColor().optional().describe("Color for low values"),
  colorHigh: zColor().optional().describe("Color for high values"),
  showLandmasses: z.boolean().default(true).describe("Show world country outlines"),
  geoJsonFile: z.string().default("world-110m.geojson").describe("GeoJSON file in public/ for landmasses"),
  landColor: zColor().optional().describe("Landmass fill color"),
  landStrokeColor: zColor().optional().describe("Country border color"),
  zoomPadding: z.number().default(0.15).describe("Padding around data bounds when zoomed (0-1 fraction)"),
  zoomDuration: z.number().default(1.5).describe("Zoom-in animation duration in seconds"),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(3).describe("Data points animation duration in seconds"),
});

export type GeoHeatmapData = z.infer<typeof geoHeatmapDataSchema>;

function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.replace("#", ""), 16);
  const bh = parseInt(b.replace("#", ""), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, "0")}`;
}

export const GeoHeatmap: React.FC<GeoHeatmapData> = ({
  dataFile = "",
  data = [],
  cityColumn = "city",
  valueColumn = "value",
  lngColumn = "lng",
  latColumn = "lat",
  minRadius = 6,
  maxRadius = 40,
  showLabels = true,
  showValues = true,
  colorLow,
  colorHigh,
  showLandmasses = true,
  geoJsonFile = "world-110m.geojson",
  landColor,
  landStrokeColor,
  zoomPadding = 0.15,
  zoomDuration = 1.5,
  animationDelay = 0,
  duration = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;
  const zoomFrames = zoomDuration * fps;

  const lowColor = colorLow ?? branding.secondaryColor;
  const highColor = colorHigh ?? branding.primaryColor;
  const landFill = landColor ?? `${branding.textColor}10`;
  const landStroke = landStrokeColor ?? `${branding.textColor}25`;

  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [geoFeatures, setGeoFeatures] = useState<GeoFeature[]>([]);
  const needsAsync = dataFile || data.some((d) => !d.lng || !d.lat) || (showLandmasses && geoJsonFile);
  const [handle] = useState(() => needsAsync ? delayRender() : null);
  const [loaded, setLoaded] = useState({ data: false, geo: !showLandmasses || !geoJsonFile });

  // Load GeoJSON for landmasses
  useEffect(() => {
    if (!showLandmasses || !geoJsonFile) {
      setLoaded((prev) => ({ ...prev, geo: true }));
      return;
    }
    fetch(staticFile(geoJsonFile))
      .then((res) => res.json())
      .then((geojson: { features: GeoFeature[] }) => {
        setGeoFeatures(geojson.features);
        setLoaded((prev) => {
          const next = { ...prev, geo: true };
          if (next.data && handle !== null) continueRender(handle);
          return next;
        });
      })
      .catch((err) => {
        console.error("Failed to load GeoJSON:", err);
        setLoaded((prev) => {
          const next = { ...prev, geo: true };
          if (next.data && handle !== null) continueRender(handle);
          return next;
        });
      });
  }, [showLandmasses, geoJsonFile, handle]);

  // Load and geocode data
  useEffect(() => {
    async function load() {
      let rawPoints: { city: string; value: number; lng?: number; lat?: number }[] = [];

      if (dataFile) {
        try {
          const res = await fetch(staticFile(dataFile));
          const text = await res.text();
          if (dataFile.endsWith(".json")) {
            rawPoints = JSON.parse(text);
          } else {
            // CSV
            const rows = parseCsv(text);
            rawPoints = rows.map((r) => ({
              city: r[cityColumn] ?? "",
              value: parseFloat(r[valueColumn] ?? "0") || 0,
              lng: r[lngColumn] ? parseFloat(r[lngColumn]) : undefined,
              lat: r[latColumn] ? parseFloat(r[latColumn]) : undefined,
            }));
          }
        } catch (e) {
          console.error("Failed to load data file:", e);
        }
      } else {
        rawPoints = data.map((d) => ({ ...d }));
      }

      // Geocode cities missing coordinates
      const resolved: GeoPoint[] = [];
      for (const p of rawPoints) {
        if (p.lng != null && p.lat != null) {
          resolved.push({ city: p.city, value: p.value, lng: p.lng, lat: p.lat });
        } else {
          try {
            const geo = await geocode(p.city);
            resolved.push({ city: p.city, value: p.value, lng: geo.lng, lat: geo.lat });
          } catch {
            console.warn(`Could not geocode "${p.city}", skipping`);
          }
        }
      }

      setPoints(resolved);
      setLoaded((prev) => {
        const next = { ...prev, data: true };
        if (next.geo && handle !== null) continueRender(handle);
        return next;
      });
    }

    load();
  }, [dataFile, data, handle, cityColumn, valueColumn, lngColumn, latColumn]);

  const svgWidth = 800;
  const svgHeight = 450;
  const padding = 20;

  const maxValue = Math.max(1, ...points.map((p) => p.value));
  const minValue = Math.min(...points.map((p) => p.value));
  const valueRange = maxValue - minValue || 1;

  // Sort by value descending so smaller circles render on top
  const sorted = useMemo(
    () => [...points].sort((a, b) => b.value - a.value),
    [points],
  );

  // Compute data bounds for auto-zoom
  const dataBounds = useMemo(() => {
    if (points.length === 0) return null;
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    for (const p of points) {
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
    }
    // Add padding
    const lngRange = (maxLng - minLng) || 10;
    const latRange = (maxLat - minLat) || 10;
    const padLng = lngRange * zoomPadding;
    const padLat = latRange * zoomPadding;
    return {
      minLng: minLng - padLng,
      maxLng: maxLng + padLng,
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
    };
  }, [points, zoomPadding]);

  // Convert data bounds to SVG coordinates for the zoomed viewBox
  const zoomedViewBox = useMemo(() => {
    if (!dataBounds) return { x: 0, y: 0, w: svgWidth, h: svgHeight };
    const topLeft = project(dataBounds.minLng, dataBounds.maxLat, svgWidth, svgHeight, padding);
    const bottomRight = project(dataBounds.maxLng, dataBounds.minLat, svgWidth, svgHeight, padding);
    let w = bottomRight.x - topLeft.x;
    let h = bottomRight.y - topLeft.y;
    // Maintain aspect ratio (match the SVG's 800:450 ratio)
    const svgAspect = svgWidth / svgHeight;
    const boundsAspect = w / h;
    if (boundsAspect > svgAspect) {
      // Too wide — expand height
      const newH = w / svgAspect;
      const dy = (newH - h) / 2;
      h = newH;
      topLeft.y -= dy;
    } else {
      // Too tall — expand width
      const newW = h * svgAspect;
      const dx = (newW - w) / 2;
      w = newW;
      topLeft.x -= dx;
    }
    return { x: topLeft.x, y: topLeft.y, w, h };
  }, [dataBounds, svgWidth, svgHeight, padding]);

  // Animate: start full world, zoom to data bounds, then show points
  const zoomProgress = interpolate(
    frame - animationDelay,
    [0, zoomFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const vbX = interpolate(zoomProgress, [0, 1], [0, zoomedViewBox.x]);
  const vbY = interpolate(zoomProgress, [0, 1], [0, zoomedViewBox.y]);
  const vbW = interpolate(zoomProgress, [0, 1], [svgWidth, zoomedViewBox.w]);
  const vbH = interpolate(zoomProgress, [0, 1], [svgHeight, zoomedViewBox.h]);

  // Points start appearing after zoom completes
  const pointsDelay = animationDelay + zoomFrames;

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Background */}
      <rect width={svgWidth} height={svgHeight} fill="transparent" />

      {/* Grid lines */}
      {[...Array(7)].map((_, i) => {
        const y = padding + (i / 6) * (svgHeight - padding * 2);
        return (
          <line
            key={`h${i}`}
            x1={padding}
            y1={y}
            x2={svgWidth - padding}
            y2={y}
            stroke={branding.textColor}
            strokeWidth={0.5}
            strokeOpacity={0.08}
          />
        );
      })}
      {[...Array(13)].map((_, i) => {
        const x = padding + (i / 12) * (svgWidth - padding * 2);
        return (
          <line
            key={`v${i}`}
            x1={x}
            y1={padding}
            x2={x}
            y2={svgHeight - padding}
            stroke={branding.textColor}
            strokeWidth={0.5}
            strokeOpacity={0.08}
          />
        );
      })}

      {/* Country outlines from GeoJSON */}
      {showLandmasses &&
        geoFeatures.map((feature, fi) =>
          featureToSvgPaths(feature, svgWidth, svgHeight, padding).map(
            (d, pi) => (
              <path
                key={`land-${fi}-${pi}`}
                d={d}
                fill={landFill}
                stroke={landStroke}
                strokeWidth={0.5}
                strokeLinejoin="round"
              />
            ),
          ),
        )}

      {/* Data points (appear after zoom completes) */}
      {sorted.map((point, i) => {
        const itemAnimFrames = durationFrames * 0.3;
        const itemStart =
          (i / Math.max(sorted.length - 1, 1)) *
          (durationFrames - itemAnimFrames);
        const progress = interpolate(
          frame - pointsDelay,
          [itemStart, itemStart + itemAnimFrames],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
        );

        const { x, y } = project(
          point.lng,
          point.lat,
          svgWidth,
          svgHeight,
          padding,
        );
        const t = (point.value - minValue) / valueRange;
        const radius = minRadius + t * (maxRadius - minRadius);
        const color = lerpColor(lowColor, highColor, t);

        return (
          <g key={i} opacity={progress}>
            {/* Glow */}
            <circle
              cx={x}
              cy={y}
              r={radius * 1.5 * progress}
              fill={color}
              opacity={0.15}
            />
            {/* Main circle */}
            <circle
              cx={x}
              cy={y}
              r={radius * progress}
              fill={color}
              opacity={0.7}
              stroke={color}
              strokeWidth={1.5}
              strokeOpacity={0.9}
            />
            {/* Label */}
            {showLabels && (
              <text
                x={x}
                y={y - radius * progress - 6}
                textAnchor="middle"
                fill={branding.textColor}
                fontFamily={branding.bodyFont}
                fontSize={11}
                fontWeight={600}
                opacity={progress}
              >
                {point.city}
              </text>
            )}
            {/* Value */}
            {showValues && radius * progress > 14 && (
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill="#ffffff"
                fontFamily={branding.bodyFont}
                fontSize={10}
                fontWeight={700}
                opacity={progress}
              >
                {point.value.toLocaleString()}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
