import { listarViagens } from "@/lib/storage/viagens";
import { listarPessoas } from "@/lib/storage/pessoas";
import { WorldMap, type MarcadorMapa } from "@/components/maps/WorldMap";
import { FiltroPessoas } from "@/components/FiltroPessoas";
import { TODOS_PAISES, paisesPorContinente, paisPorCca2 } from "@/lib/domain/paises";

export const dynamic = "force-dynamic";

export default async function MapaPage({
  searchParams,
}: {
  searchParams: Promise<{ pessoa?: string | string[] }>;
}) {
  const sp = await searchParams;
  const pessoaIds = sp.pessoa ? (Array.isArray(sp.pessoa) ? sp.pessoa : [sp.pessoa]) : [];

  const [viagens, pessoas] = await Promise.all([
    listarViagens(
      ["realizada", "planejada", "desejo"],
      pessoaIds.length > 0 ? pessoaIds : undefined
    ),
    listarPessoas(),
  ]);

  const visitados = Array.from(
    new Set(viagens.filter((v) => v.status === "realizada").map((v) => v.codigoPais))
  );

  // Itens da wishlist não coletam latitude/longitude (só país e cidade em
  // texto livre) — usamos o centro do país como posição aproximada no mapa.
  const marcadores: MarcadorMapa[] = viagens
    .map((v) => {
      const centroPais = paisPorCca2(v.codigoPais);
      const latitude = v.latitude ?? centroPais?.latitude ?? null;
      const longitude = v.longitude ?? centroPais?.longitude ?? null;
      return { ...v, latitude, longitude };
    })
    .filter((v): v is typeof v & { latitude: number; longitude: number } =>
      v.latitude !== null && v.longitude !== null
    )
    .map((v) => ({
      id: v.id,
      cidade: v.cidade,
      nomePais: v.nomePais,
      latitude: v.latitude,
      longitude: v.longitude,
      status: v.status,
      dataInicio: v.dataInicio,
      dataFim: v.dataFim,
      observacoes: v.observacoes,
      fotoUrl: v.fotoUrl,
    }));

  const totalContinentes = Object.keys(paisesPorContinente()).length;
  const continentePorCca2 = new Map(TODOS_PAISES.map((p) => [p.cca2, p.continente]));
  const continentesVisitados = new Set(
    visitados.map((cca2) => continentePorCca2.get(cca2)).filter(Boolean)
  ).size;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mapa</h1>
        <p className="text-muted-foreground">
          Você já visitou <strong>{visitados.length}</strong> {visitados.length === 1 ? "país" : "países"} em{" "}
          <strong>{continentesVisitados}</strong> de {totalContinentes} continentes.
        </p>
      </div>
      <FiltroPessoas pessoas={pessoas} selecionadas={pessoaIds} />
      <WorldMap paisesVisitados={visitados} marcadores={marcadores} />
    </div>
  );
}
