import { ViagemForm } from "@/components/forms/ViagemForm";
import { listarPessoas } from "@/lib/storage/pessoas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function NovaViagemPage() {
  const pessoas = await listarPessoas();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nova viagem</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhes da viagem</CardTitle>
        </CardHeader>
        <CardContent>
          <ViagemForm pessoas={pessoas} />
        </CardContent>
      </Card>
    </div>
  );
}
