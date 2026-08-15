import { NextRequest, NextResponse } from "next/server";

interface ResultadoNominatim {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

export interface SugestaoGeocode {
  label: string;
  cidade: string;
  pais: string;
  lat: number;
  lon: number;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("q", q);

    const res = await fetch(url, {
      headers: { "User-Agent": "viajando-pelo-mundo (personal app)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return NextResponse.json([]);

    const dados = (await res.json()) as ResultadoNominatim[];
    const sugestoes: SugestaoGeocode[] = dados.map((d) => ({
      label: d.display_name,
      cidade:
        d.address?.city ?? d.address?.town ?? d.address?.village ?? d.display_name.split(",")[0],
      pais: d.address?.country ?? "",
      lat: Number(d.lat),
      lon: Number(d.lon),
    }));
    return NextResponse.json(sugestoes);
  } catch {
    return NextResponse.json([]);
  }
}
