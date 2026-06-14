import { useAuth } from '../contexts/AuthContext';
import { useProximosJogos, useBoloes } from '../hooks';
import { useQueries } from '@tanstack/react-query';
import { rankingService } from '../services';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Target, TrendingUp, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function StatusBadge({ status }) {
  const map = {
    NAO_INICIADO: <span className="badge bg-slate-700 text-slate-300">Aguardando</span>,
    AO_VIVO: <span className="badge badge-live animate-pulse">● Ao Vivo</span>,
    ENCERRADO: <span className="badge badge-done">Encerrado</span>,
  };
  return map[status] || null;
}

function JogoCard({ jogo }) {
  return (
    <div className="card flex items-center gap-4 hover:border-slate-700 transition-colors">
      <div className="flex-1 flex items-center gap-3">
        {jogo.bandeira_casa && <img src={jogo.bandeira_casa} alt={jogo.selecao_casa} className="w-8 h-8 object-contain" />}
        <span className="font-semibold text-sm">{jogo.selecao_casa}</span>
      </div>
      <div className="text-center flex-shrink-0">
        {jogo.status === 'ENCERRADO' && jogo.resultados ? (
          <span className="font-display text-2xl tracking-widest text-white">
            {jogo.resultados.gols_casa} × {jogo.resultados.gols_fora}
          </span>
        ) : (
          <div>
            <p className="text-xs text-slate-500">{format(new Date(jogo.data_hora), 'dd MMM', { locale: ptBR })}</p>
            <p className="font-semibold text-sm">{format(new Date(jogo.data_hora), 'HH:mm')}</p>
          </div>
        )}
        <div className="mt-1"><StatusBadge status={jogo.status} /></div>
      </div>
      <div className="flex-1 flex items-center justify-end gap-3">
        <span className="font-semibold text-sm text-right">{jogo.selecao_fora}</span>
        {jogo.bandeira_fora && <img src={jogo.bandeira_fora} alt={jogo.selecao_fora} className="w-8 h-8 object-contain" />}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const nome = user?.user_metadata?.nome || 'Jogador';
  const { data: jogos = [], isLoading: jogosLoading } = useProximosJogos();
  const { data: boloes = [], isLoading: boloesLoading } = useBoloes();

  // Busca estatísticas do usuário em cada bolão
  const statsQueries = useQueries({
    queries: boloes.map(b => ({
      queryKey: ['stats', b.id, user?.id],
      queryFn: () => rankingService.estatisticasUsuario(b.id, user.id),
      enabled: !!user?.id && boloes.length > 0,
    })),
  });

  // Soma palpites e pontos de todos os bolões
  const totalPalpites = statsQueries.reduce((acc, q) => {
    return acc + (q.data?.total_palpites || 0);
  }, 0);
  const totalPontos = statsQueries.reduce((acc, q) => {
    return acc + (q.data?.pontos_total || 0);
  }, 0);
  const statsLoading = statsQueries.some(q => q.isLoading);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Olá, {nome.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Bem-vindo ao Bolão Copa 2026</p>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Trophy, label: 'Bolões', value: boloesLoading ? '…' : boloes.length, color: 'text-amber-400' },
          { icon: Target, label: 'Palpites', value: statsLoading ? '…' : totalPalpites, color: 'text-blue-400' },
          { icon: TrendingUp, label: 'Pontos', value: statsLoading ? '…' : totalPontos, color: 'text-green-400' },
          { icon: Calendar, label: 'Próximos', value: jogosLoading ? '…' : jogos.length, color: 'text-purple-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card flex flex-col gap-2">
            <Icon size={18} className={color} />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Próximos jogos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Próximos Jogos</h2>
        </div>
        {jogosLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse h-16 bg-slate-800" />
            ))}
          </div>
        ) : jogos.length === 0 ? (
          <div className="card text-center py-10 text-slate-500">
            <Calendar size={32} className="mx-auto mb-2 opacity-50" />
            <p>Nenhum jogo agendado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jogos.slice(0, 5).map(j => <JogoCard key={j.id} jogo={j} />)}
          </div>
        )}
      </section>

      {/* Meus bolões */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Meus Bolões</h2>
          <Link to="/boloes" className="text-sm text-primary-400 flex items-center gap-1 hover:underline">
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>
        {boloesLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map(i => <div key={i} className="card animate-pulse h-24 bg-slate-800" />)}
          </div>
        ) : boloes.length === 0 ? (
          <div className="card text-center py-10 text-slate-500">
            <Trophy size={32} className="mx-auto mb-2 opacity-50" />
            <p className="mb-3">Você não participa de nenhum bolão</p>
            <Link to="/boloes" className="btn-primary inline-flex">Criar ou entrar em um bolão</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {boloes.slice(0, 4).map(b => (
              <Link
                key={b.id}
                to={`/boloes/${b.id}`}
                className="card hover:border-slate-600 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{b.nome}</h3>
                    {b.descricao && <p className="text-sm text-slate-400 mt-1 line-clamp-1">{b.descricao}</p>}
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-primary-400 mt-0.5 transition-colors" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`badge ${b.publico ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                    {b.publico ? 'Público' : 'Privado'}
                  </span>
                  <span className="badge bg-slate-700 text-slate-400 font-mono tracking-wider">{b.codigo_convite}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
