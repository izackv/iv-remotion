import { useEffect, useMemo, useRef, useState } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  useDelayRender,
} from "remotion";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { geocode, generateArc, computeFitView } from "../utils";
import { VintageOverlay } from "../effects";
import { useBranding } from "../branding";

// Enable RTL text support for Hebrew/Arabic
maplibregl.setRTLTextPlugin(
  "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js",
  true,
);

const MAP_STYLES: Record<string, string> = {
  realistic: "https://tiles.openfreemap.org/styles/liberty",
  vintage: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

const MAP_FILTERS: Record<string, string> = {
  realistic: "none",
  vintage: "sepia(0.6) saturate(0.5) brightness(0.9) contrast(1.1)",
  dark: "none",
};

export const flightRouteDataSchema = z.object({
  origin: z.string().describe("Origin city/country (e.g. 'New York, USA')"),
  destination: z.string().describe("Destination city/country (e.g. 'Tokyo, Japan')"),
  mapStyle: z
    .enum(["realistic", "vintage", "dark"])
    .default("vintage")
    .describe("Map visual style"),
  lineColor: zColor().optional().describe("Route line color"),
  markerColor: zColor().optional().describe("City marker color"),
  showAirplane: z.boolean().default(true).describe("Show airplane marker"),
  showLabels: z.boolean().default(true).describe("Show city name labels"),
  duration: z.number().default(6).describe("Total animation duration in seconds"),
});

export type FlightRouteData = z.infer<typeof flightRouteDataSchema>;

export const FlightRoute: React.FC<FlightRouteData> = ({
  origin,
  destination,
  mapStyle = "vintage",
  lineColor,
  markerColor,
  showAirplane = true,
  showLabels = true,
  duration = 6,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  const { width, height, durationInFrames, fps } = useVideoConfig();
  const { delayRender, continueRender } = useDelayRender();
  const branding = useBranding();
  const [map, setMap] = useState<Map | null>(null);
  const [resolved, setResolved] = useState<{
    originName: string;
    start: [number, number];
    destinationName: string;
    end: [number, number];
    arcCoordinates: [number, number][];
    midpoint: [number, number];
    fitZoom: number;
  } | null>(null);

  const routeColor = lineColor ?? branding.primaryColor;
  const dotColor = markerColor ?? branding.primaryColor;

  // Phase timing based on duration
  const totalFrames = duration * fps;
  const ZOOM_OUT_START = Math.round(totalFrames * 0.05);
  const FLY_START = Math.round(totalFrames * 0.05);
  const FLY_END = Math.round(totalFrames * 0.94);

  // Geocode origin and destination
  useEffect(() => {
    if (origin.trim().length < 2 || destination.trim().length < 2) return;
    let cancelled = false;
    let handle: number | null = null;
    const timeout = setTimeout(() => {
      handle = delayRender("Geocoding locations...");
      Promise.all([geocode(origin), geocode(destination)])
        .then(([orig, dest]) => {
          if (cancelled) return;
          const start: [number, number] = [orig.lng, orig.lat];
          const end: [number, number] = [dest.lng, dest.lat];
          const arc = generateArc(start, end, 100);
          const { center: arcCenter, zoom: arcZoom } = computeFitView(arc);
          setResolved({
            originName: orig.name,
            start,
            destinationName: dest.name,
            end,
            arcCoordinates: arc,
            midpoint: arcCenter,
            fitZoom: arcZoom,
          });
          continueRender(handle!);
        })
        .catch(() => {
          if (handle !== null) continueRender(handle);
        });
    }, 800);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (handle !== null) continueRender(handle);
    };
  }, [origin, destination]);

  // Initialize map
  useEffect(() => {
    if (!resolved) return;
    const initHandle = delayRender("Loading map...");

    const styleUrl = MAP_STYLES[mapStyle] ?? MAP_STYLES.realistic;

    const _map = new Map({
      container: ref.current!,
      zoom: 12,
      center: resolved.start,
      pitch: 0,
      bearing: 0,
      style: styleUrl,
      interactive: false,
      fadeDuration: 0,
    });

    _map.on("load", () => {
      // Hide non-country labels for cleaner look
      const hideLabels = [
        "waterway_line_label",
        "water_name_point_label",
        "water_name_line_label",
        "poi_r20", "poi_r7", "poi_r1",
        "poi_transit",
        "highway-name-path",
        "highway-name-minor",
        "highway-name-major",
        "highway-shield-non-us",
        "highway-shield-us-interstate",
        "road_shield_us",
        "airport",
        "label_other",
        "label_village",
        "label_town",
        "label_state",
        "label_city",
        "label_city_capital",
      ];
      for (const id of hideLabels) {
        if (_map.getLayer(id)) {
          _map.setLayoutProperty(id, "visibility", "none");
        }
      }

      // Force country labels to English
      const countryLayers = [
        "label_country_1",
        "label_country_2",
        "label_country_3",
      ];
      for (const id of countryLayers) {
        if (_map.getLayer(id)) {
          _map.setLayoutProperty(id, "text-field", ["get", "name:en"]);
        }
      }

      // Route line source
      _map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [resolved.start] },
        },
      });
      _map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": routeColor,
          "line-width": 4,
          "line-dasharray": [2, 2],
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });

      // City markers
      _map.addSource("markers", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: resolved.originName },
              geometry: { type: "Point", coordinates: resolved.start },
            },
            {
              type: "Feature",
              properties: { name: resolved.destinationName },
              geometry: { type: "Point", coordinates: resolved.end },
            },
          ],
        },
      });
      _map.addLayer({
        id: "city-markers",
        type: "circle",
        source: "markers",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 6, 5, 8, 12, 12],
          "circle-color": dotColor,
          "circle-stroke-width": 3,
          "circle-stroke-color": "#FFFFFF",
        },
      });

      if (showLabels) {
        _map.addLayer({
          id: "city-labels",
          type: "symbol",
          source: "markers",
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Noto Sans Bold"],
            "text-size": ["interpolate", ["linear"], ["zoom"], 2, 20, 5, 30, 8, 40, 12, 14],
            "text-offset": [0, 0.5],
            "text-anchor": "top",
          },
          paint: {
            "text-color": "#FFFFFF",
            "text-halo-color": "#000000",
            "text-halo-width": 2,
          },
        });
      }

      // Airplane marker
      if (showAirplane) {
        const el = document.createElement("div");
        el.innerHTML = `<svg width="56" height="56" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="0.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>`;
        el.style.width = "56px";
        el.style.height = "56px";
        const airplaneMarker = new maplibregl.Marker({
          element: el,
          rotationAlignment: "map",
          pitchAlignment: "map",
        })
          .setLngLat(resolved.start)
          .addTo(_map);
        (_map as any)._airplaneMarker = airplaneMarker;
      }

      continueRender(initHandle);
      setMap(_map);
    });
  }, [resolved, mapStyle]);

  // Animate per frame
  useEffect(() => {
    if (!map || !resolved) return;

    const handle = delayRender("Animating frame...");
    const { start, midpoint, fitZoom, arcCoordinates } = resolved;

    // Flight progress
    const flyProgress = interpolate(frame, [FLY_START, FLY_END], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });

    // Camera zoom
    const zoomOutEnd = Math.round(totalFrames * 0.5);
    const zoom = interpolate(
      frame,
      [0, ZOOM_OUT_START, zoomOutEnd, totalFrames],
      [12, 12, fitZoom, fitZoom],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.sin) },
    );

    // Camera center: pan to midpoint
    const panStart = Math.round(totalFrames * 0.1);
    const panEnd = Math.round(totalFrames * 0.65);
    const centerLng = interpolate(
      frame,
      [0, panStart, panEnd, totalFrames],
      [start[0], start[0], midpoint[0], midpoint[0]],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) },
    );
    const centerLat = interpolate(
      frame,
      [0, panStart, panEnd, totalFrames],
      [start[1], start[1], midpoint[1], midpoint[1]],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) },
    );

    map.setCenter([centerLng, centerLat]);
    map.setZoom(zoom);

    // Animate route line
    const routeLine = turf.lineString(arcCoordinates);
    const routeDistance = turf.length(routeLine);
    const currentDistance = Math.max(0.001, routeDistance * flyProgress);
    const slicedLine = turf.lineSliceAlong(routeLine, 0, currentDistance);

    const routeSource = map.getSource("route") as maplibregl.GeoJSONSource;
    if (routeSource) {
      routeSource.setData(slicedLine);
    }

    // Animate airplane
    if (showAirplane) {
      const planePoint = turf.along(routeLine, currentDistance);
      const planeCoords = planePoint.geometry.coordinates as [number, number];
      // Use look-ahead for bearing; near the end, use look-behind instead
      // so the plane keeps its final heading rather than snapping to north
      let bearing: number;
      if (currentDistance + 50 < routeDistance) {
        const lookAheadPoint = turf.along(routeLine, currentDistance + 50);
        bearing = turf.bearing(
          turf.point(planeCoords),
          turf.point(lookAheadPoint.geometry.coordinates),
        );
      } else {
        const lookBehindDist = Math.max(0, currentDistance - 50);
        const lookBehindPoint = turf.along(routeLine, lookBehindDist);
        bearing = turf.bearing(
          turf.point(lookBehindPoint.geometry.coordinates),
          turf.point(planeCoords),
        );
      }

      const marker = (map as any)._airplaneMarker as maplibregl.Marker;
      if (marker) {
        marker.setLngLat(planeCoords);
        marker.setRotation(bearing);
      }
    }

    map.once("idle", () => continueRender(handle));
  }, [frame, map, resolved, totalFrames]);

  const cssFilter = MAP_FILTERS[mapStyle] ?? "none";

  const mapDivStyle: React.CSSProperties = useMemo(
    () => ({
      width,
      height,
      position: "absolute" as const,
      filter: cssFilter,
    }),
    [width, height, cssFilter],
  );

  return (
    <AbsoluteFill>
      <div ref={ref} style={mapDivStyle} />
      {mapStyle === "vintage" && (
        <VintageOverlay width={width} height={height} />
      )}
    </AbsoluteFill>
  );
};
