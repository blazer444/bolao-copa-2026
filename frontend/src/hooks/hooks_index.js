import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bolaoService, jogoService, palpiteService, rankingService } from '../services';
import toast from 'react-hot-toast';

// ── Bolões ────────────────────────────────────────────────
export function useBoloes() {
  return useQuery({ queryKey: ['boloes'], queryFn: bolaoService.listar });
}

export function useBolao(id) {
  return useQuery({
    queryKey: ['bolao', id],
    queryFn: () => bolaoService.buscar(id),
    enabled: !!id,
  });
}

export function useCriarBolao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bolaoService.criar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['boloes'] });
      toast.success('Bolão criado!');
    },
  });
}

export function useEntrarBolao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bolaoService.entrar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['boloes'] });
      toast.success('Entrou no bolão!');
    },
  });
}

// ── Jogos ─────────────────────────────────────────────────
export function useJogos(params) {
  return useQuery({
    queryKey: ['jogos', params],
    queryFn: () => jogoService.listar(params),
    refetchInterval: 1000 * 60 * 2, // Atualiza a cada 2 min
  });
}

export function useProximosJogos() {
  return useQuery({
    queryKey: ['jogos', 'proximos'],
    queryFn: jogoService.proximos,
    refetchInterval: 1000 * 60 * 5,
  });
}

// ── Palpites ──────────────────────────────────────────────
export function usePalpites(bolaoId) {
  return useQuery({
    queryKey: ['palpites', bolaoId],
    queryFn: () => palpiteService.listar(bolaoId),
    enabled: !!bolaoId,
  });
}

export function useCriarPalpite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: palpiteService.criar,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['palpites', variables.bolao_id] });
      toast.success('Palpite salvo!');
    },
  });
}

export function useAtualizarPalpite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dados }) => palpiteService.atualizar(id, dados),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['palpites'] });
      toast.success('Palpite atualizado!');
    },
  });
}

// ── Ranking ───────────────────────────────────────────────
export function useRanking(bolaoId) {
  return useQuery({
    queryKey: ['ranking', bolaoId],
    queryFn: () => rankingService.porBolao(bolaoId),
    enabled: !!bolaoId,
    refetchInterval: 1000 * 60 * 2,
  });
}

export function useEstatisticasUsuario(bolaoId, usuarioId) {
  return useQuery({
    queryKey: ['stats', bolaoId, usuarioId],
    queryFn: () => rankingService.estatisticasUsuario(bolaoId, usuarioId),
    enabled: !!bolaoId && !!usuarioId,
  });
}

export function useConsenso(bolaoId, jogoId, jogoComecou) {
  return useQuery({
    queryKey: ['consenso', bolaoId, jogoId],
    queryFn: () => palpiteService.consenso(bolaoId, jogoId),
    enabled: !!bolaoId && !!jogoId && !!jogoComecou,
  });
}

export function useEvolucaoRanking(bolaoId) {
  return useQuery({
    queryKey: ['evolucao', bolaoId],
    queryFn: () => rankingService.evolucao(bolaoId),
    enabled: !!bolaoId,
  });
}

export function useConfrontoDireto(bolaoId, usuarioA, usuarioB) {
  return useQuery({
    queryKey: ['confronto', bolaoId, usuarioA, usuarioB],
    queryFn: () => rankingService.confrontoDireto(bolaoId, usuarioA, usuarioB),
    enabled: !!bolaoId && !!usuarioA && !!usuarioB && usuarioA !== usuarioB,
  });
}
