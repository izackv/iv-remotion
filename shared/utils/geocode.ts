export type ResolvedLocation = { name: string; lng: number; lat: number };

async function photonSearch(
  query: string,
): Promise<ResolvedLocation | null> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.features || !data.features.length) return null;
  const placeTypes = [
    "city", "town", "village", "county", "state", "country", "district",
  ];
  const place = data.features.find((f: any) =>
    placeTypes.includes(f.properties.type),
  );
  if (!place) return null;
  const [lng, lat] = place.geometry.coordinates;
  const name =
    place.properties.city ||
    place.properties.name ||
    query.split(",")[0].trim();
  return { name, lng, lat };
}

export async function geocode(query: string): Promise<ResolvedLocation> {
  const result =
    (await photonSearch(query)) ||
    (query.includes(",") && (await photonSearch(query.split(",")[0].trim())));
  if (!result) {
    throw new Error(`Could not find location "${query}"`);
  }
  return result;
}
