import axios from "axios";
import type { Artwork } from "./types";

export interface ArticResponse {
  data: Artwork[];
  pagination?: {
    total?: number;
    limit?: number;
    offset?: number;
    total_pages?: number;
    current_page?: number;
  };
}

export async function fetchArtworks(
  page = 1,
  limit = 10
): Promise<{ data: Artwork[]; total: number }> {
  const url = "https://api.artic.edu/api/v1/artworks";
  const params = {
    page,
    limit,
    fields:
      "id,title,place_of_origin,artist_display,inscriptions,date_start,date_end",
  };

  const resp = await axios.get<ArticResponse>(url, { params });
  const body = resp.data;

  const items: Artwork[] = (body.data || []).map((rec: Artwork) => ({
    id: rec.id,
    title: rec.title ?? null,
    place_of_origin: rec.place_of_origin ?? null,
    artist_display: rec.artist_display ?? null,
    inscriptions: rec.inscriptions ?? null,
    date_start: typeof rec.date_start === "number" ? rec.date_start : null,
    date_end: typeof rec.date_end === "number" ? rec.date_end : null,
  }));

  const total = body.pagination?.total ?? 0;

  return {
    data: items,
    total: total,
  };
}
