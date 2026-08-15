import { createClient } from "@/lib/supabase/server";
import type { Destino } from "@/lib/domain/types";

interface LinhaDestino {
  id: string;
  codigo_pais: string;
  nome_pais: string;
  cidade: string | null;
  continente: string;
  tags: Destino["tags"];
  descricao: string;
  melhor_epoca: string | null;
}

function paraDestino(linha: LinhaDestino): Destino {
  return {
    id: linha.id,
    codigoPais: linha.codigo_pais,
    nomePais: linha.nome_pais,
    cidade: linha.cidade,
    continente: linha.continente,
    tags: linha.tags,
    descricao: linha.descricao,
    melhorEpoca: linha.melhor_epoca,
  };
}

export async function listarDestinos(): Promise<Destino[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("destinos").select("*");
  if (error) throw new Error(`Falha ao listar destinos: ${error.message}`);
  return (data as LinhaDestino[]).map(paraDestino);
}
