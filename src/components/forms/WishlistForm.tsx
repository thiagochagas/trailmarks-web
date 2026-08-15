"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Viagem } from "@/lib/domain/types";
import { paisPorCca2 } from "@/lib/domain/paises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BuscaPais } from "@/components/forms/BuscaPais";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WishlistFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Viagem;
  valoresIniciais?: { codigoPais: string; nomePais: string; cidade?: string | null };
}

export function WishlistForm({ open, onOpenChange, item, valoresIniciais }: WishlistFormProps) {
  const router = useRouter();
  const [codigoPais, setCodigoPais] = useState(item?.codigoPais ?? valoresIniciais?.codigoPais ?? "");
  const [cidade, setCidade] = useState(item?.cidade ?? valoresIniciais?.cidade ?? "");
  const [observacoes, setObservacoes] = useState(item?.observacoes ?? "");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const pais = paisPorCca2(codigoPais);
    if (!pais) return;
    setSalvando(true);
    const payload = {
      status: "desejo" as const,
      codigoPais,
      nomePais: pais.nomePt,
      cidade: cidade || undefined,
      observacoes: observacoes || undefined,
    };
    try {
      const res = await fetch(item ? `/api/viagens/${item.id}` : "/api/viagens", {
        method: item ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Falha ao salvar.");
        setSalvando(false);
        return;
      }
      toast.success(item ? "Wishlist atualizada." : "Adicionado à wishlist.");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(`Erro: ${String(err)}`);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Editar item da wishlist" : "Adicionar à wishlist"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>País</Label>
            <BuscaPais value={codigoPais} onChange={(pais) => setCodigoPais(pais.cca2)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cidade (opcional)</Label>
            <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Observações (opcional)</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={salvar} disabled={salvando || !codigoPais} className="w-full">
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
