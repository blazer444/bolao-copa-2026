import api from './api';

// ── Bolões ────────────────────────────────────────────────
export const bolaoService = {
  listar: () => api.get('/boloes').then(r => r.data),
  buscar: (id) => api.get(`/boloes/${id}`).then(r => r.data),
  criar: (dados) => api.post('/boloes', dados).then(r => r.data),
  atualizar: (id, dados) => api.put(`/boloes/${id}`, dados).then(r => r.data),
  encerrar: (id) => api.delete(`/boloes/${id}`).then(r => r.data),
  entrar: (codigo) => api.post('/boloes/entrar', { codigo }).then(r => r.data),
  sair: (id) => api.delete(`/boloes/${id}/sair`).then(r => r.data),
  participantes: (id) => api.get(`/boloes/${id}/participantes`).then(r => r.data),
  removerParticipante: (bolaoId, usuarioId) =>
    api.delete(`/boloes/${bolaoId}/participantes/${usuarioId}`).then(r => r.data),
};

// ── Jogos ─────────────────────────────────────────────────
export const jogoService = {
  listar: (params) => api.get('/jogos', { params }).then(r => r.data),
  proximos: () => api.get('/jogos/proximos').then(r => r.data),
  buscar: (id) => api.get(`/jogos/${id}`).then(r => r.data),
};

// ── Palpites ──────────────────────────────────────────────
export const palpiteService = {
  listar: (bolaoId) => api.get(`/palpites/bolao/${bolaoId}`).then(r => r.data),
  criar: (dados) => api.post('/palpites', dados).then(r => r.data),
  atualizar: (id, dados) => api.put(`/palpites/${id}`, dados).then(r => r.data),
  especiais: (bolaoId) => api.get(`/palpites/especiais/bolao/${bolaoId}`).then(r => r.data),
  criarEspecial: (dados) => api.post('/palpites/especiais', dados).then(r => r.data),
  consenso: (bolaoId, jogoId) => api.get(`/palpites/consenso/bolao/${bolaoId}/jogo/${jogoId}`).then(r => r.data),
};

// ── Ranking ───────────────────────────────────────────────
export const rankingService = {
  porBolao: (bolaoId) => api.get(`/ranking/bolao/${bolaoId}`).then(r => r.data),
  publico: (bolaoId) => api.get(`/ranking/publico/${bolaoId}`).then(r => r.data),
  estatisticasUsuario: (bolaoId, usuarioId) =>
    api.get(`/ranking/bolao/${bolaoId}/usuario/${usuarioId}`).then(r => r.data),
  evolucao: (bolaoId) => api.get(`/ranking/bolao/${bolaoId}/evolucao`).then(r => r.data),
  confrontoDireto: (bolaoId, usuarioA, usuarioB) =>
    api.get(`/ranking/bolao/${bolaoId}/confronto/${usuarioA}/${usuarioB}`).then(r => r.data),
};

// ── Usuário ───────────────────────────────────────────────
export const usuarioService = {
  perfil: () => api.get('/usuarios/me').then(r => r.data),
  atualizar: (dados) => api.put('/usuarios/me', dados).then(r => r.data),
};
