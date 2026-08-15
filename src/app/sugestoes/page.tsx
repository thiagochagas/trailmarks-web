import { listarViagens, paisesVisitados } from "@/lib/storage/viagens";
import { obterOuCriarPerfil } from "@/lib/storage/perfil";
import { listarDestinos } from "@/lib/storage/destinos";
import { SugestoesView } from "@/components/SugestoesView";

export const dynamic = "force-dynamic";

export default async function SugestoesPage() {
  const [perfil, destinos, viagens, visitados] = await Promise.all([
    obterOuCriarPerfil(),
    listarDestinos(),
    listarViagens(),
    paisesVisitados(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Sugestões</h1>
      <SugestoesView
        perfilInicial={perfil}
        destinos={destinos}
        viagens={viagens}
        paisesVisitados={visitados}
      />
    </div>
  );
}
