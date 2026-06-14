# 🏆 Bolão Copa do Mundo 2026

Aplicação web completa para gerenciamento de bolões da Copa do Mundo 2026: criação de bolões, palpites, ranking em tempo real, estatísticas e compartilhamento.

## 📦 Stack

- **Frontend**: React + Vite + TailwindCSS + React Router + React Query
- **Backend**: Node.js + Express
- **Banco**: Supabase (PostgreSQL + Auth)
- **Deploy**: Vercel (frontend) + Railway (backend)

---

## 🗂 Estrutura do Projeto

```
bolao-copa-2026/
├── frontend/          # App React (Vite)
│   ├── src/
│   │   ├── components/    # UI, layout, auth, jogos, palpites, ranking
│   │   ├── pages/          # Páginas/rotas
│   │   ├── hooks/           # React Query hooks
│   │   ├── services/        # Clients de API (axios)
│   │   └── contexts/        # AuthContext (Supabase Auth)
│   └── ...
├── backend/           # API Express
│   ├── src/
│   │   ├── controllers/      # Lógica de cada rota
│   │   ├── services/          # Regra de negócio + integração API-Football
│   │   ├── routes/             # Definição de rotas
│   │   ├── middlewares/        # Auth, rate limit, error handler
│   │   └── utils/                # Cron jobs (sync de jogos/resultados)
│   └── ...
└── database/
    └── schema.sql      # Schema completo PostgreSQL/Supabase
```

---

## 🚀 Passo a passo de instalação

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. Vá em **SQL Editor** e execute o conteúdo de `database/schema.sql`.
3. Em **Authentication → Providers**, habilite **Email** (com confirmação, se desejar).
4. Copie as chaves em **Project Settings → API**:
   - `Project URL`
   - `anon public key`
   - `service_role key` (⚠️ mantenha em segredo, é só para o backend)

### 2. Conta na API de Futebol

Recomendado: [API-Football via RapidAPI](https://rapidapi.com/api-sports/api/api-football)

1. Crie uma conta gratuita.
2. Assine o plano da API-Football.
3. Copie sua `X-RapidAPI-Key`.
4. Descubra o `league_id` da Copa do Mundo 2026 (geralmente `1`) e a `season` (2026).

> Alternativa: [Football-Data.org](https://www.football-data.org/) — basta adaptar `backend/src/services/football-api.service.js` mantendo a mesma interface (`sincronizarJogos`, `sincronizarResultados`).

---

### 3. Backend

```bash
cd backend
cp .env.example .env
# Edite o .env com suas chaves do Supabase e da API de futebol
npm install
npm run dev
```

O servidor inicia em `http://localhost:3001`. Os cron jobs sincronizam jogos diariamente e resultados a cada 5 minutos.

Para popular o banco com os jogos pela primeira vez, chame manualmente:

```bash
curl -X POST http://localhost:3001/api/jogos/sincronizar \
  -H "Authorization: Bearer SEU_TOKEN_DE_USUARIO"
```

---

### 4. Frontend

```bash
cd frontend
cp .env.example .env
# Edite o .env com a URL do Supabase, anon key e URL da API
npm install
npm run dev
```

Acesse `http://localhost:5173`.

---

## ☁️ Deploy

### Backend → Railway

1. Crie um novo projeto no [Railway](https://railway.app).
2. Conecte o repositório (pasta `backend/`).
3. Defina as variáveis de ambiente do `.env.example`.
4. Configure o **Start Command**: `npm start`.
5. Railway expõe uma URL pública — copie-a para usar no frontend (`VITE_API_URL`).

### Frontend → Vercel

1. Crie um novo projeto no [Vercel](https://vercel.com), importando a pasta `frontend/`.
2. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Defina as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (URL do backend no Railway + `/api`)
4. Deploy 🎉

### Atualizar CORS

No backend (`.env` do Railway), defina `FRONTEND_URL` com a URL final do Vercel para liberar o CORS.

---

## 🧩 Funcionalidades implementadas

- ✅ Autenticação (cadastro, login, recuperação de senha, sessão persistente) via Supabase Auth
- ✅ Dashboard com próximos jogos, bolões e atalhos
- ✅ Criação e gerenciamento de bolões (público/privado, código de convite, pontuação configurável)
- ✅ Entrada em bolão por código
- ✅ Sincronização automática de jogos e resultados via API de futebol (cron jobs)
- ✅ Sistema de palpites com bloqueio automático ao iniciar a partida
- ✅ Cálculo de pontuação automático via função SQL (`calcular_pontuacao_palpite`)
- ✅ Ranking em tempo real com destaque para top 3 e usuário atual
- ✅ Página pública de ranking + compartilhamento (WhatsApp, copiar link)
- ✅ Estatísticas básicas do usuário (pontos, palpites, % de acerto)
- ✅ Palpites especiais (campeão, artilheiro, etc.)
- ✅ Segurança: JWT (via Supabase), rate limiting, validação com Zod, Helmet, RLS no banco

## 🔜 Próximos passos sugeridos

- Implementar tema claro/escuro (toggle + persistência)
- Notificações push/in-app (jogo próximo, resultado, mudança de ranking)
- Tela de gerenciamento de participantes (remover, ver detalhes)
- Gráficos de evolução no ranking (Recharts já incluído como dependência)
- Tela dedicada para palpites especiais (campeão, artilheiro, etc.)

---

## 🔒 Segurança implementada

- **JWT**: autenticação via Supabase Auth, validada em todas as rotas privadas
- **Rate Limiting**: 100 req/15min geral, 10 req/15min em rotas sensíveis (login, cadastro)
- **Validação de entrada**: Zod em todos os endpoints
- **Row Level Security (RLS)**: políticas no Postgres garantindo que usuários só acessem seus próprios dados
- **Helmet**: headers de segurança HTTP
- **CORS**: restrito ao domínio do frontend
