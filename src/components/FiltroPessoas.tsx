"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Pessoa } from "@/lib/domain/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FiltroPessoasProps {
  pessoas: Pessoa[];
  selecionadas: string[];
}

export function FiltroPessoas({ pessoas, selecionadas }: FiltroPessoasProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (pessoas.length === 0) return null;

  function aplicar(ids: string[]) {
    if (ids.length === 0) {
      router.push(pathname);
      return;
    }
    const params = new URLSearchParams();
    ids.forEach((id) => params.append("pessoa", id));
    router.push(`${pathname}?${params.toString()}`);
  }

  function alternar(id: string) {
    aplicar(
      selecionadas.includes(id) ? selecionadas.filter((sid) => sid !== id) : [...selecionadas, id]
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Filtrar por pessoa:</span>
      {pessoas.map((p) => (
        <Badge
          key={p.id}
          variant={selecionadas.includes(p.id) ? "default" : "outline"}
          className="cursor-pointer px-3 py-1 text-sm"
          onClick={() => alternar(p.id)}
        >
          {p.nome}
        </Badge>
      ))}
      {selecionadas.length > 0 && (
        <Button variant="ghost" size="sm" onClick={() => aplicar([])}>
          Limpar filtro
        </Button>
      )}
    </div>
  );
}
