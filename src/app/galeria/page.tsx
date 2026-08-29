import { listarViagens } from "@/lib/storage/viagens";
import { GaleriaView } from "@/components/GaleriaView";

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  const viagens = await listarViagens();
  const fotos = viagens
    .filter((v): v is typeof v & { fotoUrl: string } => v.fotoUrl !== null)
    .map((v) => ({
      id: v.id,
      url: v.fotoUrl,
      cidade: v.cidade,
      nomePais: v.nomePais,
      dataInicio: v.dataInicio,
      dataFim: v.dataFim,
    }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Galeria</h1>
        <p className="text-muted-foreground">Fotos das suas viagens.</p>
      </div>
      <GaleriaView fotos={fotos} />
    </div>
  );
}
