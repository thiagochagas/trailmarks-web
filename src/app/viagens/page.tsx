import Link from "next/link";
import { listarViagens } from "@/lib/storage/viagens";
import { listarPessoas } from "@/lib/storage/pessoas";
import { formatarIntervalo } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FiltroPessoas } from "@/components/FiltroPessoas";
import { Star } from "lucide-react";
import type { Viagem } from "@/lib/domain/types";

export const dynamic = "force-dynamic";

function CardViagem({ v }: { v: Viagem }) {
  return (
    <Link key={v.id} href={`/viagens/${v.id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        {v.fotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- URL assinada/temporária, sem benefício de otimização
          <img src={v.fotoUrl} alt="" className="h-32 w-full object-cover" />
        )}
        <CardContent className="space-y-1 py-4">
          <p className="font-medium">
            {v.cidade ? `${v.cidade}, ` : ""}
            {v.nomePais}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatarIntervalo(v.dataInicio, v.dataFim)}
          </p>
          {v.avaliacao && (
            <div className="flex gap-0.5 pt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < v.avaliacao!
                      ? "size-3.5 fill-primary text-primary"
                      : "size-3.5 text-muted-foreground"
                  }
                />
              ))}
            </div>
          )}
          {v.pessoas.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {v.pessoas.map((p) => (
                <Badge key={p.id} variant="secondary" className="text-[0.65rem]">
                  {p.nome}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function ViagensPage({
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

  const realizadas = viagens
    .filter((v) => v.status === "realizada")
    .sort((a, b) => (b.dataInicio ?? "").localeCompare(a.dataInicio ?? ""));
  const planejadas = viagens
    .filter((v) => v.status === "planejada")
    .sort((a, b) => (a.dataInicio ?? "9999").localeCompare(b.dataInicio ?? "9999"));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Minhas Viagens</h1>
        <Button render={<Link href="/viagens/nova" />} nativeButton={false}>
          + Nova viagem
        </Button>
      </div>

      <FiltroPessoas pessoas={pessoas} selecionadas={pessoaIds} />

      {viagens.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {pessoaIds.length > 0
              ? "Nenhuma viagem encontrada com esse filtro."
              : "Você ainda não registrou nenhuma viagem."}
            <div className="mt-4">
              <Button render={<Link href="/viagens/nova" />} nativeButton={false}>
                Registrar minha primeira viagem
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-medium">Já fui</h2>
            {realizadas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma viagem realizada ainda.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {realizadas.map((v) => (
                  <CardViagem key={v.id} v={v} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Planejadas</h2>
            {planejadas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma viagem planejada ainda.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {planejadas.map((v) => (
                  <CardViagem key={v.id} v={v} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
