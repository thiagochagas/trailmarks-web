"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Destino, InteresseViagem, Perfil, Viagem } from "@/lib/domain/types";
import { INTERESSES } from "@/lib/domain/types";
import { LABEL_INTERESSE, LABEL_CONTINENTE } from "@/lib/domain/enums";
import { TODOS_PAISES, paisPorCca2 } from "@/lib/domain/paises";
import { sugerirPorInteresse, cobrirPorContinente } from "@/lib/domain/sugestoes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { WishlistForm } from "@/components/forms/WishlistForm";
import { cn } from "@/lib/utils";

interface SugestoesViewProps {
  perfilInicial: Perfil;
  destinos: Destino[];
  viagens: Viagem[];
  paisesVisitados: string[];
}

export function SugestoesView({
  perfilInicial,
  destinos,
  viagens,
  paisesVisitados,
}: SugestoesViewProps) {
  const router = useRouter();
  const [interesses, setInteresses] = useState<InteresseViagem[]>(perfilInicial.interesses);
  const [wishlistAberta, setWishlistAberta] = useState(false);
  const [itemEditando, setItemEditando] = useState<Viagem | undefined>(undefined);

  const sugestoesInteresse = useMemo(
    () => sugerirPorInteresse(destinos, interesses, viagens),
    [destinos, interesses, viagens]
  );

  const cobertura = useMemo(
    () => cobrirPorContinente(TODOS_PAISES, paisesVisitados),
    [paisesVisitados]
  );

  const wishlistPorContinente = useMemo(() => {
    const itens = viagens.filter((v) => v.status === "desejo");
    const grupos = new Map<string, Viagem[]>();
    for (const v of itens) {
      const continente = paisPorCca2(v.codigoPais)?.continente ?? "Outro";
      const lista = grupos.get(continente) ?? [];
      lista.push(v);
      grupos.set(continente, lista);
    }
    for (const lista of grupos.values()) {
      lista.sort((a, b) => a.nomePais.localeCompare(b.nomePais, "pt-BR"));
    }
    return Array.from(grupos.entries()).sort((a, b) =>
      (LABEL_CONTINENTE[a[0]] ?? a[0]).localeCompare(LABEL_CONTINENTE[b[0]] ?? b[0], "pt-BR")
    );
  }, [viagens]);

  async function alternarInteresse(tag: InteresseViagem) {
    const atualizados = interesses.includes(tag)
      ? interesses.filter((t) => t !== tag)
      : [...interesses, tag];
    setInteresses(atualizados);
    const res = await fetch("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interesses: atualizados }),
    });
    if (!res.ok) {
      toast.error("Falha ao atualizar preferências.");
      setInteresses(interesses);
      return;
    }
    toast.success("Preferências atualizadas.");
  }

  async function adicionarDestinoNaWishlist(destino: Destino) {
    const res = await fetch("/api/viagens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "desejo",
        codigoPais: destino.codigoPais,
        nomePais: destino.nomePais,
        cidade: destino.cidade ?? undefined,
        observacoes: destino.descricao,
      }),
    });
    if (!res.ok) {
      toast.error("Falha ao adicionar à wishlist.");
      return;
    }
    toast.success("Adicionado à wishlist.");
    router.refresh();
  }

  async function removerDaWishlist(id: string) {
    if (!confirm("Remover este item da wishlist?")) return;
    const res = await fetch(`/api/viagens/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Falha ao remover.");
      return;
    }
    toast.success("Removido da wishlist.");
    router.refresh();
  }

  return (
    <Tabs defaultValue="para-voce">
      <TabsList>
        <TabsTrigger value="para-voce">Para você</TabsTrigger>
        <TabsTrigger value="cobertura">Cobertura</TabsTrigger>
        <TabsTrigger value="wishlist">Minha wishlist</TabsTrigger>
      </TabsList>

      <TabsContent value="para-voce" className="space-y-4 pt-4">
        <div className="flex flex-wrap gap-2">
          {INTERESSES.map((tag) => (
            <Badge
              key={tag}
              variant={interesses.includes(tag) ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-sm"
              onClick={() => alternarInteresse(tag)}
            >
              {LABEL_INTERESSE[tag]}
            </Badge>
          ))}
        </div>

        {interesses.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Escolha alguns interesses acima para receber sugestões personalizadas.
          </p>
        )}

        {sugestoesInteresse.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma sugestão encontrada com esses interesses.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sugestoesInteresse.map((d) => (
              <Card key={d.id}>
                <CardContent className="space-y-2 py-4">
                  <div>
                    <p className="font-medium">
                      {d.cidade ? `${d.cidade}, ` : ""}
                      {d.nomePais}
                    </p>
                    <p className="text-xs text-muted-foreground">{LABEL_CONTINENTE[d.continente] ?? d.continente}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {d.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[0.65rem]">
                        {LABEL_INTERESSE[t]}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm">{d.descricao}</p>
                  {d.melhorEpoca && (
                    <p className="text-xs text-muted-foreground">Melhor época: {d.melhorEpoca}</p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adicionarDestinoNaWishlist(d)}
                  >
                    + Adicionar à wishlist
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="cobertura" className="space-y-4 pt-4">
        {cobertura.map((c) => (
          <div key={c.continente} className="space-y-1.5">
            <Progress value={(c.visitados / c.total) * 100}>
              <div className="flex justify-between">
                <ProgressLabel>{LABEL_CONTINENTE[c.continente] ?? c.continente}</ProgressLabel>
                <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                  {c.visitados} de {c.total} países
                </span>
              </div>
            </Progress>
            {c.faltantes.length > 0 && (
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer">Ver países que faltam</summary>
                <p className={cn("mt-1")}>
                  {c.faltantes.slice(0, 15).map((p) => p.nomePt).join(", ")}
                  {c.faltantes.length > 15 && ` e mais ${c.faltantes.length - 15}...`}
                </p>
              </details>
            )}
          </div>
        ))}
      </TabsContent>

      <TabsContent value="wishlist" className="space-y-4 pt-4">
        <Button
          onClick={() => {
            setItemEditando(undefined);
            setWishlistAberta(true);
          }}
        >
          + Adicionar
        </Button>

        {wishlistPorContinente.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sua wishlist está vazia.</p>
        ) : (
          <div className="space-y-6">
            {wishlistPorContinente.map(([continente, itens]) => (
              <div key={continente} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {LABEL_CONTINENTE[continente] ?? continente}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {itens.map((v) => (
                    <Card key={v.id}>
                      <CardContent className="space-y-2 py-4">
                        <p className="font-medium">
                          {v.cidade ? `${v.cidade}, ` : ""}
                          {v.nomePais}
                        </p>
                        {v.observacoes && (
                          <p className="text-sm text-muted-foreground">{v.observacoes}</p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setItemEditando(v);
                              setWishlistAberta(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removerDaWishlist(v.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <WishlistForm
          key={itemEditando?.id ?? "novo"}
          open={wishlistAberta}
          onOpenChange={setWishlistAberta}
          item={itemEditando}
        />
      </TabsContent>
    </Tabs>
  );
}
