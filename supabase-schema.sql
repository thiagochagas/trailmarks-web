-- Schema do Viajando pelo Mundo.
-- Rodar uma vez no SQL Editor do Supabase (Project > SQL Editor > New query).

create type status_viagem as enum ('realizada', 'planejada', 'desejo');

create type interesse_viagem as enum (
  'praia', 'montanha', 'cultura', 'gastronomia',
  'aventura', 'natureza', 'urbano', 'historia'
);

-- Perfil / preferências do usuário (uma linha por usuário)
create table if not exists public.perfis (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  interesses interesse_viagem[] not null default '{}',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

create policy "select_own_perfil" on public.perfis for select
  using (auth.uid() = usuario_id);
create policy "insert_own_perfil" on public.perfis for insert
  with check (auth.uid() = usuario_id);
create policy "update_own_perfil" on public.perfis for update
  using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- Viagens: passadas, futuras e desejos (wishlist), tudo em uma tabela
create table if not exists public.viagens (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  status status_viagem not null default 'planejada',
  codigo_pais text not null check (char_length(codigo_pais) = 2),
  nome_pais text not null,
  cidade text,
  latitude double precision,
  longitude double precision,
  data_inicio date,
  data_fim date,
  avaliacao smallint check (avaliacao between 1 and 5),
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint viagem_realizada_tem_data check (status <> 'realizada' or data_inicio is not null),
  constraint viagem_datas_coerentes check (data_fim is null or data_inicio is null or data_fim >= data_inicio),
  constraint viagem_coordenadas_par check ((latitude is null) = (longitude is null))
);

create index if not exists viagens_usuario_status_idx on public.viagens(usuario_id, status);
create index if not exists viagens_usuario_pais_idx on public.viagens(usuario_id, codigo_pais);

alter table public.viagens enable row level security;

create policy "select_own_viagens" on public.viagens for select
  using (auth.uid() = usuario_id);
create policy "insert_own_viagens" on public.viagens for insert
  with check (auth.uid() = usuario_id);
create policy "update_own_viagens" on public.viagens for update
  using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);
create policy "delete_own_viagens" on public.viagens for delete
  using (auth.uid() = usuario_id);

-- Destinos curados (dado de referência estático, mesmo para todos os usuários)
create table if not exists public.destinos (
  id uuid primary key default gen_random_uuid(),
  codigo_pais text not null check (char_length(codigo_pais) = 2),
  nome_pais text not null,
  cidade text,
  continente text not null,
  tags interesse_viagem[] not null default '{}',
  descricao text not null,
  melhor_epoca text,
  criado_em timestamptz not null default now()
);

alter table public.destinos enable row level security;

create policy "select_destinos" on public.destinos for select
  to authenticated using (true);
-- Sem policies de insert/update/delete: a tabela só é editada via SQL editor
-- ou service role (é conteúdo curado pelo dono do app, não pelo usuário final).

-- Pessoas fixas cadastradas pelo usuário (ex.: "Eu", "Esposa")
create table if not exists public.pessoas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now()
);

create unique index if not exists pessoas_usuario_nome_idx
  on public.pessoas(usuario_id, lower(nome));

alter table public.pessoas enable row level security;

create policy "select_own_pessoas" on public.pessoas for select
  using (auth.uid() = usuario_id);
create policy "insert_own_pessoas" on public.pessoas for insert
  with check (auth.uid() = usuario_id);
create policy "delete_own_pessoas" on public.pessoas for delete
  using (auth.uid() = usuario_id);

-- Junção viagem <-> pessoas envolvidas
create table if not exists public.viagem_pessoas (
  viagem_id uuid not null references public.viagens(id) on delete cascade,
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  primary key (viagem_id, pessoa_id)
);

create index if not exists viagem_pessoas_pessoa_idx on public.viagem_pessoas(pessoa_id);

alter table public.viagem_pessoas enable row level security;

create policy "select_own_viagem_pessoas" on public.viagem_pessoas for select
  using (auth.uid() = usuario_id);
create policy "insert_own_viagem_pessoas" on public.viagem_pessoas for insert
  with check (auth.uid() = usuario_id);
create policy "delete_own_viagem_pessoas" on public.viagem_pessoas for delete
  using (auth.uid() = usuario_id);
-- Sem policy de update: mudar as pessoas de uma viagem é sempre apagar+reinserir.

-- Foto opcional por viagem (guarda o caminho no Storage, não a URL —
-- a URL assinada é gerada na hora de exibir, porque o bucket é privado).
alter table public.viagens add column if not exists foto_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-viagens',
  'fotos-viagens',
  false,
  8388608, -- 8 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Cada usuário só acessa arquivos dentro da própria pasta ({usuario_id}/...).
create policy "select_own_fotos_viagens" on storage.objects for select
  using (bucket_id = 'fotos-viagens' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "insert_own_fotos_viagens" on storage.objects for insert
  with check (bucket_id = 'fotos-viagens' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete_own_fotos_viagens" on storage.objects for delete
  using (bucket_id = 'fotos-viagens' and (storage.foldername(name))[1] = auth.uid()::text);
