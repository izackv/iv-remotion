import * as turf from "@turf/turf";

/**
 * Generate a great-circle arc with unwrapped longitudes for continuous animation.
 * Unwrapping means longitudes can go beyond [-180, 180] (e.g. 190 instead of -170)
 * so that the line doesn't jump across the map at the antimeridian.
 */
export const generateArc = (
  start: [number, number],
  end: [number, number],
  numPoints: number = 100,
  curvature: number = 0.05,
): [number, number][] => {
  const line = turf.greatCircle(start, end, { npoints: numPoints });
  let coords: [number, number][];
  if (line.geometry.type === "MultiLineString") {
    coords = line.geometry.coordinates.flat() as [number, number][];
  } else {
    coords = line.geometry.coordinates as [number, number][];
  }
  // Unwrap longitudes across antimeridian
  for (let i = 1; i < coords.length; i++) {
    const diff = coords[i][0] - coords[i - 1][0];
    if (diff > 180) coords[i] = [coords[i][0] - 360, coords[i][1]];
    else if (diff < -180) coords[i] = [coords[i][0] + 360, coords[i][1]];
  }
  // Normalize curvature so all routes have a similar gentle arc.
  // - Routes that are naturally flat get a small perpendicular bulge.
  // - Routes with big natural curvature (e.g. Finland→SF going near the
  //   Arctic) get pulled back toward the straight line.
  // The target deflection from the straight line is ~1.5 degrees.
  {
    const sLng = coords[0][0];
    const sLat = coords[0][1];
    const eLng = coords[coords.length - 1][0];
    const eLat = coords[coords.length - 1][1];
    const dLng = eLng - sLng;
    const dLat = eLat - sLat;
    const dist = Math.sqrt(dLng * dLng + dLat * dLat);
    if (dist > 0) {
      const minDeflection = curvature * 30; // ~1.5° — minimum curve for flat routes

      // Measure existing great circle deflection from the straight line
      let maxDeflection = 0;
      for (let i = 0; i < coords.length; i++) {
        const t = i / (coords.length - 1);
        const straightLng = sLng + dLng * t;
        const straightLat = sLat + dLat * t;
        const deflection = Math.sqrt(
          (coords[i][0] - straightLng) ** 2 + (coords[i][1] - straightLat) ** 2,
        );
        maxDeflection = Math.max(maxDeflection, deflection);
      }

      if (maxDeflection > minDeflection) {
        // Natural curve is big — dampen using square root to soften without
        // flattening. e.g. deflection of 20° becomes ~sqrt(20*1.5)≈5.5°
        const dampened = Math.sqrt(maxDeflection * minDeflection);
        const blend = dampened / maxDeflection;
        for (let i = 0; i < coords.length; i++) {
          const t = i / (coords.length - 1);
          const straightLng = sLng + dLng * t;
          const straightLat = sLat + dLat * t;
          coords[i] = [
            straightLng + (coords[i][0] - straightLng) * blend,
            straightLat + (coords[i][1] - straightLat) * blend,
          ];
        }
      } else if (maxDeflection < minDeflection) {
        // Natural curve is too small — add perpendicular bulge
        const extraNeeded = minDeflection - maxDeflection;
        const perpLng = -dLat / dist;
        const perpLat = dLng / dist;
        for (let i = 0; i < coords.length; i++) {
          const t = i / (coords.length - 1);
          const offset = Math.sin(t * Math.PI) * extraNeeded;
          coords[i] = [
            coords[i][0] + perpLng * offset,
            coords[i][1] + perpLat * offset,
          ];
        }
      }
    }
  }
  return coords;
};

/**
 * Compute the bounding box center and zoom level that fits all arc
 * coordinates on a 1920x1080 map.
 */
export const computeFitView = (
  arcCoordinates: [number, number][],
): { center: [number, number]; zoom: number } => {
  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;
  for (const [lng, lat] of arcCoordinates) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  const center: [number, number] = [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
  const spanLng = maxLng - minLng;
  const spanLat = maxLat - minLat;
  const span = Math.max(spanLng, spanLat * (1920 / 1080));

  let zoom: number;
  if (span > 200) zoom = 1;
  else if (span > 120) zoom = 2;
  else if (span > 60) zoom = 3;
  else if (span > 30) zoom = 4;
  else if (span > 15) zoom = 5;
  else if (span > 8) zoom = 6;
  else if (span > 4) zoom = 7;
  else if (span > 2) zoom = 8;
  else zoom = 9;

  return { center, zoom };
};
