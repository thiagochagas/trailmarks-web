"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatarIntervalo } from "@/lib/format";

export interface FotoGaleria {
  id: string;
  url: string;
  cidade: string | null;
  nomePais: string;
  dataInicio: string | null;
  dataFim: string | null;
}

export function GaleriaView({ fotos }: { fotos: FotoGaleria[] }) {
  const [indiceAberto, setIndiceAberto] = useState<number | null>(null);

  useEffect(() => {
    if (indiceAberto === null || fotos.length === 0) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIndiceAberto(null);
      if (e.key === "ArrowRight") setIndiceAberto((i) => (i === null ? i : (i + 1) % fotos.length));
      if (e.key === "ArrowLeft")
        setIndiceAberto((i) => (i === null ? i : (i - 1 + fotos.length) % fotos.length));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [indiceAberto, fotos.length]);

  if (fotos.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma foto adicionada ainda.</p>;
  }

  const atual = indiceAberto !== null ? fotos[indiceAberto] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {fotos.map((foto, i) => (
          <button
            key={foto.id}
            type="button"
            onClick={() => setIndiceAberto(i)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada/temporária, sem benefício de otimização */}
            <img
              src={foto.url}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {atual && indiceAberto !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          onClick={() => setIndiceAberto(null)}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <div>
              <p className="text-sm font-medium">
                {atual.cidade ? `${atual.cidade}, ` : ""}
                {atual.nomePais}
              </p>
              <p className="text-xs text-white/70">
                {formatarIntervalo(atual.dataInicio, atual.dataFim)} · {indiceAberto + 1} de{" "}
                {fotos.length}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIndiceAberto(null);
              }}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
            {fotos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndiceAberto((indiceAberto - 1 + fotos.length) % fotos.length);
                }}
                className="absolute left-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada/temporária, sem benefício de otimização */}
            <img
              src={atual.url}
              alt=""
              className="max-h-[80vh] max-w-[85vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {fotos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndiceAberto((indiceAberto + 1) % fotos.length);
                }}
                className="absolute right-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Próxima foto"
              >
                <ChevronRight className="size-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
