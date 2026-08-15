"use client";

import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { MapPin } from "lucide-react";
import { ccn3PorCca2 } from "@/lib/domain/paises";
import { formatarIntervalo } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export interface MarcadorMapa {
  id: string;
  cidade: string | null;
  nomePais: string;
  latitude: number;
  longitude: number;
  status: "realizada" | "planejada";
  dataInicio: string | null;
  dataFim: string | null;
  observacoes: string | null;
  fotoUrl: string | null;
}

interface WorldMapProps {
  paisesVisitados: string[];
  marcadores: MarcadorMapa[];
}

export function WorldMap({ paisesVisitados, marcadores }: WorldMapProps) {
  const [selecionado, setSelecionado] = useState<MarcadorMapa | null>(null);

  const visitadosCcn3 = useMemo(
    () => new Set(paisesVisitados.map(ccn3PorCca2).filter((v): v is string => Boolean(v))),
    [paisesVisitados]
  );

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120 }}>
          <Geographies geography="/world-atlas/countries-110m.json">
            {({ geographies }) =>
              geographies.map((geo) => {
                const visitado = visitadosCcn3.has(geo.id);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className={cn(
                      "stroke-border outline-none transition-opacity hover:opacity-80",
                      visitado ? "fill-blue-600 dark:fill-blue-500" : "fill-muted"
                    )}
                    strokeWidth={0.5}
                  />
                );
              })
            }
          </Geographies>
          {marcadores.map((m) => (
            <Marker
              key={m.id}
              coordinates={[m.longitude, m.latitude]}
              onClick={() => setSelecionado(m)}
            >
              <MapPin
                width={24}
                height={24}
                x={-12}
                y={-24}
                className={cn(
                  "cursor-pointer drop-shadow-md stroke-white",
                  m.status === "realizada"
                    ? "fill-orange-500 text-orange-500"
                    : "fill-violet-500 text-violet-500"
                )}
                strokeWidth={1.5}
              />
            </Marker>
          ))}
        </ComposableMap>
      </div>

      <div className="flex flex-wrap gap-4 pt-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-blue-600 dark:bg-blue-500" /> País visitado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-muted" /> Não visitado
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5 fill-orange-500 text-orange-500" /> Já fui
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5 fill-violet-500 text-violet-500" /> Planejada
        </span>
      </div>

      <Dialog open={selecionado !== null} onOpenChange={(open) => !open && setSelecionado(null)}>
        <DialogContent className="sm:max-w-lg">
          {selecionado && (
            <>
              {selecionado.fotoUrl && (
                <div className="-mx-4 -mt-4 overflow-hidden rounded-t-xl">
                  <div className="h-10 bg-popover" />
                  {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada/temporária, sem benefício de otimização */}
                  <img
                    src={selecionado.fotoUrl}
                    alt=""
                    className="h-56 w-full bg-muted object-contain"
                  />
                </div>
              )}
              <DialogHeader>
                <DialogTitle>
                  {selecionado.cidade ? `${selecionado.cidade}, ` : ""}
                  {selecionado.nomePais}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Badge variant={selecionado.status === "realizada" ? "default" : "secondary"}>
                  {selecionado.status === "realizada" ? "Já fui" : "Planejada"}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {formatarIntervalo(selecionado.dataInicio, selecionado.dataFim)}
                </p>
                {selecionado.observacoes && (
                  <p className="text-sm">{selecionado.observacoes}</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
