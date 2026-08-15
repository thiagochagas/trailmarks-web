import { createClient } from "@/lib/supabase/server";
import type { InteresseViagem, Perfil } from "@/lib/domain/types";

interface LinhaPerfil {
  usuario_id: string;
  nome: string | null;
  interesses: InteresseViagem[];
}

function paraPerfil(linha: LinhaPerfil): Perfil {
  return { usuarioId: linha.usuario_id, nome: linha.nome, interesses: linha.interesses };
}

async function usuarioAtual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return { supabase, user };
}

export async function obterOuCriarPerfil(): Promise<Perfil> {
  const { supabase, user } = await usuarioAtual();
  const { data } = await supabase
    .from("perfis")
    .select("*")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (data) return paraPerfil(data as LinhaPerfil);

  const { data: criado, error } = await supabase
    .from("perfis")
    .insert({ usuario_id: user.id, interesses: [] })
    .select("*")
    .single();
  if (error) throw new Error(`Falha ao criar perfil: ${error.message}`);
  return paraPerfil(criado as LinhaPerfil);
}

export async function atualizarInteresses(interesses: InteresseViagem[]): Promise<Perfil> {
  const { supabase, user } = await usuarioAtual();
  const { data, error } = await supabase
    .from("perfis")
    .upsert({ usuario_id: user.id, interesses, atualizado_em: new Date().toISOString() })
    .select("*")
    .single();
  if (error) throw new Error(`Falha ao atualizar interesses: ${error.message}`);
  return paraPerfil(data as LinhaPerfil);
}
