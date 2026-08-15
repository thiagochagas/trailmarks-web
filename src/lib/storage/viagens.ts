import { createClient } from "@/lib/supabase/server";
import type { Pessoa, StatusViagem, Viagem } from "@/lib/domain/types";
import type { ViagemInput } from "@/lib/validation/viagem";

const BUCKET_FOTOS = "fotos-viagens";
const EXPIRACAO_URL_FOTO = 60 * 60; // 1 hora

interface LinhaViagem {
  id: string;
  usuario_id: string;
  status: StatusViagem;
  codigo_pais: string;
  nome_pais: string;
  cidade: string | null;
  latitude: number | null;
  longitude: number | null;
  data_inicio: string | null;
  data_fim: string | null;
  avaliacao: number | null;
  observacoes: string | null;
  foto_path: string | null;
  criado_em: string;
  atualizado_em: string;
}

interface LinhaPessoa {
  id: string;
  usuario_id: string;
  nome: string;
}

function paraPessoa(linha: LinhaPessoa): Pessoa {
  return { id: linha.id, usuarioId: linha.usuario_id, nome: linha.nome };
}

function paraViagem(linha: LinhaViagem, pessoas: Pessoa[] = [], fotoUrl: string | null = null): Viagem {
  return {
    id: linha.id,
    usuarioId: linha.usuario_id,
    status: linha.status,
    codigoPais: linha.codigo_pais,
    nomePais: linha.nome_pais,
    cidade: linha.cidade,
    latitude: linha.latitude,
    longitude: linha.longitude,
    dataInicio: linha.data_inicio,
    dataFim: linha.data_fim,
    avaliacao: linha.avaliacao,
    observacoes: linha.observacoes,
    pessoas,
    fotoPath: linha.foto_path,
    fotoUrl,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em,
  };
}

function paraColunas(input: ViagemInput) {
  return {
    status: input.status,
    codigo_pais: input.codigoPais,
    nome_pais: input.nomePais,
    cidade: input.cidade || null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    data_inicio: input.dataInicio || null,
    data_fim: input.dataFim || null,
    avaliacao: input.avaliacao ?? null,
    observacoes: input.observacoes || null,
  };
}

async function usuarioAtual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return { supabase, user };
}

async function pessoasPorViagens(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  viagemIds: string[]
): Promise<Map<string, Pessoa[]>> {
  const mapa = new Map<string, Pessoa[]>();
  if (viagemIds.length === 0) return mapa;

  const { data, error } = await supabase
    .from("viagem_pessoas")
    .select("viagem_id, pessoas(id, usuario_id, nome)")
    .eq("usuario_id", userId)
    .in("viagem_id", viagemIds);
  if (error) throw new Error(`Falha ao buscar pessoas das viagens: ${error.message}`);

  for (const linha of data as unknown as { viagem_id: string; pessoas: LinhaPessoa }[]) {
    const lista = mapa.get(linha.viagem_id) ?? [];
    lista.push(paraPessoa(linha.pessoas));
    mapa.set(linha.viagem_id, lista);
  }
  return mapa;
}

// Bucket privado — nunca guardamos a URL da foto, só o caminho no Storage.
// A URL assinada é gerada aqui, na hora de ler, e expira em EXPIRACAO_URL_FOTO.
async function resolverFotosUrls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paths: (string | null)[]
): Promise<Map<string, string>> {
  const mapa = new Map<string, string>();
  const caminhos = Array.from(new Set(paths.filter((p): p is string => Boolean(p))));
  if (caminhos.length === 0) return mapa;

  const { data, error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .createSignedUrls(caminhos, EXPIRACAO_URL_FOTO);
  if (error || !data) return mapa; // sem foto é melhor do que quebrar a página inteira

  for (const item of data) {
    if (item.path && item.signedUrl) mapa.set(item.path, item.signedUrl);
  }
  return mapa;
}

export async function listarViagens(
  status?: StatusViagem | StatusViagem[],
  pessoaIds?: string[]
): Promise<Viagem[]> {
  const { supabase, user } = await usuarioAtual();
  let query = supabase.from("viagens").select("*").eq("usuario_id", user.id);
  if (status) {
    query = query.in("status", Array.isArray(status) ? status : [status]);
  }
  const { data, error } = await query.order("data_inicio", { ascending: false, nullsFirst: false });
  if (error) throw new Error(`Falha ao listar viagens: ${error.message}`);

  const linhas = data as LinhaViagem[];
  const [pessoasPorViagem, fotosUrls] = await Promise.all([
    pessoasPorViagens(supabase, user.id, linhas.map((l) => l.id)),
    resolverFotosUrls(supabase, linhas.map((l) => l.foto_path)),
  ]);
  let viagens = linhas.map((l) =>
    paraViagem(
      l,
      pessoasPorViagem.get(l.id) ?? [],
      l.foto_path ? (fotosUrls.get(l.foto_path) ?? null) : null
    )
  );

  if (pessoaIds && pessoaIds.length > 0) {
    viagens = viagens.filter((v) => pessoaIds.every((pid) => v.pessoas.some((p) => p.id === pid)));
  }
  return viagens;
}

export async function buscarViagem(id: string): Promise<Viagem | null> {
  const { supabase, user } = await usuarioAtual();
  const { data, error } = await supabase
    .from("viagens")
    .select("*")
    .eq("id", id)
    .eq("usuario_id", user.id)
    .maybeSingle();
  if (error || !data) return null;

  const linha = data as LinhaViagem;
  const [pessoasPorViagem, fotosUrls] = await Promise.all([
    pessoasPorViagens(supabase, user.id, [linha.id]),
    resolverFotosUrls(supabase, [linha.foto_path]),
  ]);
  return paraViagem(
    linha,
    pessoasPorViagem.get(linha.id) ?? [],
    linha.foto_path ? (fotosUrls.get(linha.foto_path) ?? null) : null
  );
}

export async function criarViagem(input: ViagemInput): Promise<Viagem> {
  const { supabase, user } = await usuarioAtual();
  const { data, error } = await supabase
    .from("viagens")
    .insert({ ...paraColunas(input), foto_path: input.fotoPath ?? null, usuario_id: user.id })
    .select("*")
    .single();
  if (error) throw new Error(`Falha ao criar viagem: ${error.message}`);

  if (input.pessoaIds && input.pessoaIds.length > 0) {
    const { error: erroPessoas } = await supabase.from("viagem_pessoas").insert(
      input.pessoaIds.map((pessoaId) => ({
        viagem_id: data.id,
        pessoa_id: pessoaId,
        usuario_id: user.id,
      }))
    );
    if (erroPessoas) throw new Error(`Falha ao associar pessoas à viagem: ${erroPessoas.message}`);
  }

  return (await buscarViagem(data.id))!;
}

export async function atualizarViagem(id: string, input: ViagemInput): Promise<Viagem | null> {
  const { supabase, user } = await usuarioAtual();

  let fotoAntiga: string | null = null;
  if (input.fotoPath !== undefined) {
    const { data: atual } = await supabase
      .from("viagens")
      .select("foto_path")
      .eq("id", id)
      .eq("usuario_id", user.id)
      .maybeSingle();
    fotoAntiga = (atual as { foto_path: string | null } | null)?.foto_path ?? null;
  }

  const colunas: Record<string, unknown> = {
    ...paraColunas(input),
    atualizado_em: new Date().toISOString(),
  };
  if (input.fotoPath !== undefined) colunas.foto_path = input.fotoPath;

  const { data, error } = await supabase
    .from("viagens")
    .update(colunas)
    .eq("id", id)
    .eq("usuario_id", user.id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Falha ao atualizar viagem: ${error.message}`);
  if (!data) return null;

  // Se a foto mudou (nova ou removida), apaga o arquivo antigo do Storage
  // pra não deixar lixo acumulando — melhor esforço, não trava a resposta.
  if (input.fotoPath !== undefined && fotoAntiga && fotoAntiga !== input.fotoPath) {
    await supabase.storage.from(BUCKET_FOTOS).remove([fotoAntiga]);
  }

  if (input.pessoaIds !== undefined) {
    const { error: erroLimpar } = await supabase
      .from("viagem_pessoas")
      .delete()
      .eq("viagem_id", id)
      .eq("usuario_id", user.id);
    if (erroLimpar) throw new Error(`Falha ao atualizar pessoas da viagem: ${erroLimpar.message}`);

    if (input.pessoaIds.length > 0) {
      const { error: erroPessoas } = await supabase.from("viagem_pessoas").insert(
        input.pessoaIds.map((pessoaId) => ({
          viagem_id: id,
          pessoa_id: pessoaId,
          usuario_id: user.id,
        }))
      );
      if (erroPessoas) throw new Error(`Falha ao associar pessoas à viagem: ${erroPessoas.message}`);
    }
  }

  return buscarViagem(id);
}

export async function excluirViagem(id: string): Promise<boolean> {
  const { supabase, user } = await usuarioAtual();
  const { data, error } = await supabase
    .from("viagens")
    .delete()
    .eq("id", id)
    .eq("usuario_id", user.id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Falha ao excluir viagem: ${error.message}`);
  return data !== null;
}

export async function paisesVisitados(): Promise<string[]> {
  const { supabase, user } = await usuarioAtual();
  const { data, error } = await supabase
    .from("viagens")
    .select("codigo_pais")
    .eq("usuario_id", user.id)
    .eq("status", "realizada");
  if (error) throw new Error(`Falha ao buscar países visitados: ${error.message}`);
  return Array.from(new Set((data as { codigo_pais: string }[]).map((d) => d.codigo_pais)));
}
