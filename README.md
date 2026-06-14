# 🏆 Bolão Copa do Mundo 2026

Aplicação web completa para gerenciamento de bolões da Copa do Mundo 2026: criação de bolões, palpites, ranking em tempo real, estatísticas e compartilhamento.

## 📦 Stack

- **Frontend**: React + Vite + TailwindCSS + React Router + React Query
- **Backend**: Node.js + Express
- **Banco**: Supabase (PostgreSQL + Auth)
- **Deploy**: Vercel (frontend) + Railway (backend)

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

## 🔒 Segurança implementada

- **JWT**: autenticação via Supabase Auth, validada em todas as rotas privadas
- **Rate Limiting**: 100 req/15min geral, 10 req/15min em rotas sensíveis (login, cadastro)
- **Validação de entrada**: Zod em todos os endpoints
- **Row Level Security (RLS)**: políticas no Postgres garantindo que usuários só acessem seus próprios dados
- **Helmet**: headers de segurança HTTP
- **CORS**: restrito ao domínio do frontend
