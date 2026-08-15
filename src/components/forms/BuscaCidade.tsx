"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SugestaoGeocode } from "@/app/api/geocode/route";

interface BuscaCidadeProps {
  value: string;
  onChange: (cidade: string) => void;
  onSelecionar: (resultado: SugestaoGeocode) => void;
}

export function BuscaCidade({ value, onChange, onSelecionar }: BuscaCidadeProps) {
  const [sugestoes, setSugestoes] = useState<SugestaoGeocode[]>([]);
  const [aberto, setAberto] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (value.trim().length < 2) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
        const dados = (await res.json()) as SugestaoGeocode[];
        setSugestoes(dados);
        setAberto(dados.length > 0);
      } finally {
        setBuscando(false);
      }
    }, 450);
    return () => clearTimeout(timeoutRef.current);
  }, [value]);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (e.target.value.trim().length < 2) {
            setSugestoes([]);
            setAberto(false);
          } else {
            setAberto(true);
          }
        }}
        onFocus={() => sugestoes.length > 0 && setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        placeholder="Digite para buscar (ex.: Lisboa)"
      />
      {aberto && sugestoes.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md">
          {sugestoes.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelecionar(s);
                  setAberto(false);
                }}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {buscando && (
        <p className="mt-1 text-xs text-muted-foreground">Buscando...</p>
      )}
    </div>
  );
}
