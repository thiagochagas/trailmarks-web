import { listarPessoas } from "@/lib/storage/pessoas";
import { PessoasView } from "@/components/PessoasView";

export const dynamic = "force-dynamic";

export default async function PessoasPage() {
  const pessoas = await listarPessoas();

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Pessoas</h1>
      <p className="text-muted-foreground">
        Cadastre quem participa das suas viagens para poder marcar e filtrar depois.
      </p>
      <PessoasView pessoasIniciais={pessoas} />
    </div>
  );
}
