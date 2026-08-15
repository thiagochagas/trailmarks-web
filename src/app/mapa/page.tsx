import { listarViagens } from "@/lib/storage/viagens";
import { listarPessoas } from "@/lib/storage/pessoas";
import { WorldMap, type MarcadorMapa } from "@/components/maps/WorldMap";
import { FiltroPessoas } from "@/components/FiltroPessoas";
import { TODOS_PAISES, paisesPorContinente } from "@/lib/domain/paises";

export const dynamic = "force-dynamic";

export default async function MapaPage({
  searchParams,
}: {
  searchParams: Promise<{ pessoa?: string | string[] }>;
}) {
  const sp = await searchParams;
  const pessoaIds = sp.pessoa ? (Array.isArray(sp.pessoa) ? sp.pessoa : [sp.pessoa]) : [];

  const [viagens, pessoas] = await Promise.all([
    listarViagens(["realizada", "planejada"], pessoaIds.length > 0 ? pessoaIds : undefined),
    listarPessoas(),
  ]);

  const visitados = Array.from(
    new Set(viagens.filter((v) => v.status === "realizada").map((v) => v.codigoPais))
  );

  const marcadores: MarcadorMapa[] = viagens
    .filter((v) => v.latitude !== null && v.longitude !== null)
    .filter((v): v is typeof v & { status: "realizada" | "planejada" } =>
      v.status === "realizada" || v.status === "planejada"
    )
    .map((v) => ({
      id: v.id,
      cidade: v.cidade,
      nomePais: v.nomePais,
      latitude: v.latitude!,
      longitude: v.longitude!,
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
