# Viajando pelo Mundo

App pessoal para registrar viagens já feitas, viagens planejadas e uma wishlist de próximos destinos, com mapa-múndi visual e sugestões (por interesse e por cobertura de países visitados).

## Stack

Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui + Supabase (Postgres + auth) + `react-simple-maps`.

## Configuração inicial

1. **Criar o projeto no Supabase**: acesse [supabase.com](https://supabase.com), crie um novo projeto.
2. **Rodar o schema**: no SQL Editor do projeto, cole e rode o conteúdo de [`supabase-schema.sql`](./supabase-schema.sql).
3. **Popular os destinos curados**: em seguida, rode [`supabase-seed-destinos.sql`](./supabase-seed-destinos.sql).
4. **Criar seu usuário**: em Authentication → Users → Add user, crie um usuário com e-mail e senha (não há tela de cadastro no app — login apenas).
5. **Variáveis de ambiente**: em Project Settings → API, copie a `Project URL` e a `anon public` key para `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
6. **Instalar dependências e gerar dados de países** (só precisa rodar `gerar-paises` de novo se atualizar a dependência `world-countries`):
   ```bash
   npm install --legacy-peer-deps
   npm run gerar-paises
   ```
7. **Rodar em desenvolvimento**:
   ```bash
   npm run dev
   ```
   Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

- `/viagens` — lista de viagens já feitas e planejadas, com formulário de cadastro/edição.
- `/mapa` — mapa-múndi com países visitados destacados e pins por cidade.
- `/sugestoes` — sugestões por interesse, cobertura de continentes ainda não visitados e wishlist manual.
- `supabase-schema.sql` / `supabase-seed-destinos.sql` — schema e dados de referência do banco.
- `scripts/gerar-paises.mjs` — gera `src/lib/domain/paises-data.json` a partir do dataset `world-countries`.
