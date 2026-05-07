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
): [number, number][] => {
  const line = turf.greatCircle(start, end, { npoints: numPoints });
  let coords: [number, number][];
  if (line.geometry.type === "MultiLineString") {
    coords = line.geometry.coordinates.flat() as [number, number][];
  } else {
    coords = line.geometry.coordinates as [number, number][];
  }
  for (let i = 1; i < coords.length; i++) {
    const diff = coords[i][0] - coords[i - 1][0];
    if (diff > 180) coords[i] = [coords[i][0] - 360, coords[i][1]];
    else if (diff < -180) coords[i] = [coords[i][0] + 360, coords[i][1]];
  }
  return coords;
};

/**
 * Compute a zoom level that fits both points on a 1920x1080 map.
 */
export const computeFitZoom = (
  start: [number, number],
  end: [number, number],
): number => {
  const distanceKm = turf.distance(turf.point(start), turf.point(end));
  if (distanceKm > 10000) return 2;
  if (distanceKm > 5000) return 3;
  if (distanceKm > 2000) return 4;
  if (distanceKm > 1000) return 5;
  if (distanceKm > 500) return 6;
  if (distanceKm > 200) return 7;
  if (distanceKm > 100) return 8;
  return 9;
};
