"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Pessoa, StatusViagem, Viagem } from "@/lib/domain/types";
import { LABEL_STATUS } from "@/lib/domain/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BuscaCidade } from "@/components/forms/BuscaCidade";
import { BuscaPais } from "@/components/forms/BuscaPais";
import { FotoUpload } from "@/components/forms/FotoUpload";
import { MapaPreview } from "@/components/maps/MapaPreview";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormValues {
  status: StatusViagem;
  codigoPais: string;
  nomePais: string;
  cidade: string;
  latitude: string;
  longitude: string;
  dataInicio: string;
  dataFim: string;
  avaliacao: number;
  observacoes: string;
  pessoaIds: string[];
  fotoPath: string | null;
}

function toValues(v?: Viagem): FormValues {
  return {
    status: v?.status ?? "planejada",
    codigoPais: v?.codigoPais ?? "",
    nomePais: v?.nomePais ?? "",
    cidade: v?.cidade ?? "",
    latitude: v?.latitude !== null && v?.latitude !== undefined ? String(v.latitude) : "",
    longitude: v?.longitude !== null && v?.longitude !== undefined ? String(v.longitude) : "",
    dataInicio: v?.dataInicio ?? "",
    dataFim: v?.dataFim ?? "",
    avaliacao: v?.avaliacao ?? 0,
    observacoes: v?.observacoes ?? "",
    pessoaIds: v?.pessoas.map((p) => p.id) ?? [],
    fotoPath: v?.fotoPath ?? null,
  };
}

function buildPayload(v: FormValues) {
  return {
    status: v.status,
    codigoPais: v.codigoPais,
    nomePais: v.nomePais,
    cidade: v.cidade || undefined,
    latitude: v.latitude ? Number(v.latitude) : undefined,
    longitude: v.longitude ? Number(v.longitude) : undefined,
    dataInicio: v.dataInicio || undefined,
    dataFim: v.dataFim || undefined,
    avaliacao: v.status === "realizada" && v.avaliacao > 0 ? v.avaliacao : undefined,
    observacoes: v.observacoes || undefined,
    pessoaIds: v.pessoaIds,
    fotoPath: v.fotoPath,
  };
}

export function ViagemForm({ viagem, pessoas }: { viagem?: Viagem; pessoas: Pessoa[] }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(toValues(viagem));
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [pessoasDisponiveis, setPessoasDisponiveis] = useState<Pessoa[]>(pessoas);
  const [mostrarNovaPessoa, setMostrarNovaPessoa] = useState(false);
  const [novaPessoaNome, setNovaPessoaNome] = useState("");
  const [criandoPessoa, setCriandoPessoa] = useState(false);

  async function criarNovaPessoa() {
    if (!novaPessoaNome.trim()) return;
    setCriandoPessoa(true);
    try {
      const res = await fetch("/api/pessoas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novaPessoaNome }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Falha ao criar pessoa.");
        return;
      }
      setPessoasDisponiveis((prev) => [...prev, data.pessoa]);
      set("pessoaIds", [...values.pessoaIds, data.pessoa.id]);
      setNovaPessoaNome("");
      setMostrarNovaPessoa(false);
      toast.success("Pessoa adicionada.");
    } finally {
      setCriandoPessoa(false);
    }
  }

  function set<K extends keyof FormValues>(campo: K, valor: FormValues[K]) {
    setValues((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvar() {
    setSalvando(true);
    try {
      const res = await fetch(viagem ? `/api/viagens/${viagem.id}` : "/api/viagens", {
        method: viagem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(values)),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Falha ao salvar viagem.");
        setSalvando(false);
        return;
      }
      toast.success(viagem ? "Viagem atualizada." : "Viagem criada.");
      router.push("/viagens");
      router.refresh();
    } catch (err) {
      toast.error(`Erro: ${String(err)}`);
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!viagem) return;
    if (!confirm(`Excluir a viagem para ${viagem.nomePais}? Essa ação não pode ser desfeita.`)) return;
    setExcluindo(true);
    const res = await fetch(`/api/viagens/${viagem.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Falha ao excluir.");
      setExcluindo(false);
      return;
    }
    toast.success("Viagem excluída.");
    router.push("/viagens");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            items={LABEL_STATUS}
            value={values.status}
            onValueChange={(v) => set("status", v as StatusViagem)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(LABEL_STATUS) as [StatusViagem, string][]).map(([valor, label]) => (
                <SelectItem key={valor} value={valor}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>País</Label>
          <BuscaPais
            value={values.codigoPais}
            onChange={(pais) =>
              setValues((prev) => ({ ...prev, codigoPais: pais.cca2, nomePais: pais.nomePt }))
            }
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Cidade</Label>
          <BuscaCidade
            value={values.cidade}
            onChange={(cidade) => set("cidade", cidade)}
            onSelecionar={(resultado) => {
              setValues((prev) => ({
                ...prev,
                cidade: resultado.cidade,
                latitude: String(resultado.lat),
                longitude: String(resultado.lon),
              }));
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Latitude</Label>
          <Input
            type="number"
            step="any"
            value={values.latitude}
            onChange={(e) => set("latitude", e.target.value)}
            placeholder="Ex.: -22.9068"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Longitude</Label>
          <Input
            type="number"
            step="any"
            value={values.longitude}
            onChange={(e) => set("longitude", e.target.value)}
            placeholder="Ex.: -43.1729"
          />
        </div>

        {values.latitude && values.longitude && (
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Prévia no mapa</Label>
            <MapaPreview latitude={Number(values.latitude)} longitude={Number(values.longitude)} />
          </div>
        )}

        {values.status !== "desejo" && (
          <>
            <div className="space-y-1.5">
              <Label>Data de início</Label>
              <Input
                type="date"
                value={values.dataInicio}
                onChange={(e) => {
                  const novaData = e.target.value;
                  setValues((prev) => ({
                    ...prev,
                    dataInicio: novaData,
                    // Data fim acompanha a data início até o usuário escolher uma
                    // data fim diferente manualmente — evita ter que rolar o
                    // calendário até uma data distante toda vez.
                    dataFim:
                      !prev.dataFim || prev.dataFim === prev.dataInicio ? novaData : prev.dataFim,
                  }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data de fim</Label>
              <Input
                type="date"
                value={values.dataFim}
                onChange={(e) => set("dataFim", e.target.value)}
              />
            </div>
          </>
        )}

        {values.status === "realizada" && (
          <div className="space-y-1.5">
            <Label>Avaliação</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("avaliacao", n === values.avaliacao ? 0 : n)}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "size-5",
                      n <= values.avaliacao
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Pessoas envolvidas</Label>
          <div className="flex flex-wrap gap-2">
            {pessoasDisponiveis.map((p) => (
              <Badge
                key={p.id}
                variant={values.pessoaIds.includes(p.id) ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 text-sm"
                onClick={() =>
                  set(
                    "pessoaIds",
                    values.pessoaIds.includes(p.id)
                      ? values.pessoaIds.filter((id) => id !== p.id)
                      : [...values.pessoaIds, p.id]
                  )
                }
              >
                {p.nome}
              </Badge>
            ))}
          </div>
          {!mostrarNovaPessoa ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMostrarNovaPessoa(true)}
            >
              + Nova pessoa
            </Button>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <Input
                autoFocus
                placeholder="Nome da pessoa"
                value={novaPessoaNome}
                onChange={(e) => setNovaPessoaNome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && criarNovaPessoa()}
                className="max-w-[220px]"
              />
              <Button
                type="button"
                size="sm"
                onClick={criarNovaPessoa}
                disabled={!novaPessoaNome.trim() || criandoPessoa}
              >
                {criandoPessoa ? "Criando..." : "Adicionar"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setMostrarNovaPessoa(false);
                  setNovaPessoaNome("");
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Foto</Label>
          <FotoUpload
            urlInicial={viagem?.fotoUrl ?? null}
            onChange={(path) => set("fotoPath", path)}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Observações</Label>
          <Textarea
            value={values.observacoes}
            onChange={(e) => set("observacoes", e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={salvar} disabled={salvando || !values.codigoPais}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
        {viagem && (
          <Button variant="destructive" onClick={excluir} disabled={excluindo}>
            {excluindo ? "Excluindo..." : "Excluir viagem"}
          </Button>
        )}
      </div>
    </div>
  );
}
