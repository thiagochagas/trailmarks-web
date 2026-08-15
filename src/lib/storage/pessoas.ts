import { createClient } from "@/lib/supabase/server";
import type { Pessoa } from "@/lib/domain/types";

interface LinhaPessoa {
  id: string;
  usuario_id: string;
  nome: string;
}

function paraPessoa(linha: LinhaPessoa): Pessoa {
  return { id: linha.id, usuarioId: linha.usuario_id, nome: linha.nome };
}

async function usuarioAtual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return { supabase, user };
}

export async function listarPessoas(): Promise<Pessoa[]> {
  const { supabase, user } = await usuarioAtual();
  const { data, error } = await supabase
    .from("pessoas")
    .select("*")
    .eq("usuario_id", user.id)
    .order("nome");
  if (error) throw new Error(`Falha ao listar pessoas: ${error.message}`);
  return (data as LinhaPessoa[]).map(paraPessoa);
}

export async function criarPessoa(nome: string): Promise<Pessoa> {
  const { supabase, user } = await usuarioAtual();
  const { data, error } = await supabase
    .from("pessoas")
    .insert({ usuario_id: user.id, nome: nome.trim() })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("Já existe uma pessoa com esse nome.");
    throw new Error(`Falha ao criar pessoa: ${error.message}`);
  }
  return paraPessoa(data as LinhaPessoa);
}

export async function excluirPessoa(id: string): Promise<boolean> {
  const { supabase, user } = await usuarioAtual();
  const { data, error } = await supabase
    .from("pessoas")
    .delete()
    .eq("id", id)
    .eq("usuario_id", user.id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Falha ao excluir pessoa: ${error.message}`);
  return data !== null;
}
