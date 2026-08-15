"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { TODOS_PAISES, paisPorCca2 } from "@/lib/domain/paises";
import type { PaisRef } from "@/lib/domain/types";
import { normalizarTexto } from "@/lib/utils";

interface BuscaPaisProps {
  value: string;
  onChange: (pais: PaisRef) => void;
}

export function BuscaPais({ value, onChange }: BuscaPaisProps) {
  const [query, setQuery] = useState(() => paisPorCca2(value)?.nomePt ?? "");
  const [aberto, setAberto] = useState(false);

  const termo = normalizarTexto(query.trim());
  const sugestoes = termo
    ? TODOS_PAISES.filter((p) => normalizarTexto(p.nomePt).includes(termo)).slice(0, 8)
    : [];

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        placeholder="Digite para buscar (ex.: Portugal)"
      />
      {aberto && sugestoes.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-md">
          {sugestoes.map((p) => (
            <li key={p.cca2}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery(p.nomePt);
                  onChange(p);
                  setAberto(false);
                }}
              >
                {p.nomePt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
