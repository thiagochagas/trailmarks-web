"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Pessoa } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function PessoasView({ pessoasIniciais }: { pessoasIniciais: Pessoa[] }) {
  const [pessoas, setPessoas] = useState<Pessoa[]>(pessoasIniciais);
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  async function adicionar() {
    if (!nome.trim()) return;
    setSalvando(true);
    try {
      const res = await fetch("/api/pessoas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Falha ao adicionar pessoa.");
        return;
      }
      setPessoas((prev) => [...prev, data.pessoa].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
      setNome("");
      toast.success("Pessoa adicionada.");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(pessoa: Pessoa) {
    if (!confirm(`Remover "${pessoa.nome}"? Ela deixará de aparecer nas viagens já marcadas com ela.`)) return;
    setExcluindoId(pessoa.id);
    try {
      const res = await fetch(`/api/pessoas/${pessoa.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Falha ao remover pessoa.");
        return;
      }
      setPessoas((prev) => prev.filter((p) => p.id !== pessoa.id));
      toast.success("Pessoa removida.");
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center gap-2 py-4">
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionar()}
            placeholder="Nome da pessoa (ex.: Eu, Esposa)"
          />
          <Button onClick={adicionar} disabled={salvando || !nome.trim()}>
            {salvando ? "Adicionando..." : "Adicionar"}
          </Button>
        </CardContent>
      </Card>

      {pessoas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma pessoa cadastrada ainda.</p>
      ) : (
        <div className="space-y-2">
          {pessoas.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between py-3">
                <span className="font-medium">{p.nome}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => remover(p)}
                  disabled={excluindoId === p.id}
                >
                  {excluindoId === p.id ? "Removendo..." : "Remover"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
