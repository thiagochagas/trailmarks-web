import { notFound } from "next/navigation";
import { buscarViagem } from "@/lib/storage/viagens";
import { listarPessoas } from "@/lib/storage/pessoas";
import { ViagemForm } from "@/components/forms/ViagemForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function EditarViagemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [viagem, pessoas] = await Promise.all([buscarViagem(id), listarPessoas()]);
  if (!viagem) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {viagem.cidade ? `${viagem.cidade}, ` : ""}
        {viagem.nomePais}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhes da viagem</CardTitle>
        </CardHeader>
        <CardContent>
          <ViagemForm viagem={viagem} pessoas={pessoas} />
        </CardContent>
      </Card>
    </div>
  );
}
