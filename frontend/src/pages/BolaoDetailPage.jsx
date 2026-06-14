import { useParams, Link, NavLink, Routes, Route, useLocation } from 'react-router-dom';
import { useBolao, useRanking, usePalpites, useProximosJogos, useJogos } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Target, BarChart2, Users, Copy, CheckCircle, Clock, Swords, Users2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import PalpitesPage from './PalpitesPage';
import RankingPage from './RankingPage';
import EstatisticasPage from './EstatisticasPage';
import ParticipantesPage from './ParticipantesPage';
import JogosPage from './JogosPage';

// Todos os cards recebem dados já resolvidos via props — sem hooks próprios
// para evitar violação das regras de hooks e bugs de dados undefined

function CardProximoJogo({ jogos, palpites }) {
  const agora = new Date();
  const proximo = jogos
    .filter(j => j.status === 'NAO_INICIADO' && new Date(j.data_hora) > agora)
    .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))[0];

  if (!proximo) return (
    <div className="card flex flex-col gap-2">
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
        <Clock size={13} /> Próximo Jogo
      </span>
      <p className="text-slate-500 text-sm">Nenhum jogo agendado</p>
    </div>
  );

  const jaPalpitou = palpites.some(p => p.jogo_id === proximo.id);

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
          <Clock size={13} /> Próximo Jogo
        </span>
        {jaPalpitou
          ? <span className="flex items-center gap-1 text-green-400 text-xs font-medium"><CheckCircle size={12} /> Palpitou</span>
          : <span className="text-amber-400 text-xs font-medium">⚠ Sem palpite</span>
        }
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm text-white flex-1">{proximo.selecao_casa}</span>
        <div className="text-center flex-shrink-0">
          <p className="text-xs text-slate-500">{format(new Date(proximo.data_hora), "dd 'de' MMM", { locale: ptBR })}</p>
          <p className="text-sm font-bold text-white">{format(new Date(proximo.data_hora), 'HH:mm')}</p>
        </div>
        <span className="font-semibold text-sm text-white flex-1 text-right">{proximo.selecao_fora}</span>
      </div>
    </div>
  );
}

function CardSuaPosicao({ ranking, userId }) {
  const eu = ranking.find(r => r.usuario?.id === userId);

  if (!eu) return (
    <div className="card flex flex-col gap-2">
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
        <TrendingUp size={13} /> Sua Posição
      </span>
      <p className="text-slate-500 text-sm">Faça seu primeiro palpite!</p>
    </div>
  );

  return (
    <div className="card flex flex-col gap-2 border-primary-500/30 bg-primary-500/5">
      <span className="text-primary-400 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
        <TrendingUp size={13} /> Sua Posição
      </span>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-display text-white">{eu.posicao}°</p>
          <p className="text-xs text-slate-500">{eu.total_palpites} palpites feitos</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-400">{eu.pontos_total}</p>
          <p className="text-xs text-slate-500">pontos</p>
        </div>
      </div>
    </div>
  );
}

function CardLider({ ranking }) {
  const lider = ranking[0];
  if (!lider) return null;

  return (
    <div className="card flex flex-col gap-2 border-amber-500/20">
      <span className="text-amber-400 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
        <Trophy size={13} /> Líder do Bolão
      </span>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-amber-400">
            {lider.usuario?.nome?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{lider.usuario?.nome}</p>
            <p className="text-xs text-slate-500">{lider.acertos_placar_exato} placares exatos</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-amber-400">{lider.pontos_total}</p>
          <p className="text-xs text-slate-500">pontos</p>
        </div>
      </div>
    </div>
  );
}

function CardPendentes({ bolaoId, jogos, palpites }) {
  const agora = new Date();
  const pendentes = jogos.filter(j =>
    j.status === 'NAO_INICIADO' &&
    new Date(j.data_hora) > agora &&
    !palpites.some(p => p.jogo_id === j.id)
  );

  return (
    <div className={`card flex flex-col gap-2 ${pendentes.length > 0 ? 'border-amber-500/20' : ''}`}>
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
        <Target size={13} /> Palpites Pendentes
      </span>
      {pendentes.length === 0 ? (
        <p className="text-green-400 text-sm font-medium flex items-center gap-1">
          <CheckCircle size={14} /> Tudo em dia!
        </p>
      ) : (
        <div>
          <p className="text-2xl font-bold text-amber-400">{pendentes.length}</p>
          <p className="text-xs text-slate-500">{pendentes.length === 1 ? 'jogo sem palpite' : 'jogos sem palpite'}</p>
          <Link to={`/boloes/${bolaoId}/palpites`} className="text-xs text-primary-400 hover:underline mt-1 inline-block">
            Palpitar agora →
          </Link>
        </div>
      )}
    </div>
  );
}

function CardConsenso({ jogos, palpites }) {
  // Prioriza jogo ao vivo; se não houver, pega o último encerrado por data
  const jogoAtivo =
    jogos.find(j => j.status === 'AO_VIVO') ||
    jogos
      .filter(j => j.status === 'ENCERRADO')
      .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))[0];

  if (!jogoAtivo) return (
    <div className="card flex flex-col gap-2">
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
        <Users2 size={13} /> Consenso da Galera
      </span>
      <p className="text-slate-500 text-sm">Nenhum jogo em andamento</p>
    </div>
  );

  const palpitesJogo = palpites.filter(p => p.jogo_id === jogoAtivo.id);
  const total = palpitesJogo.length;

  if (total === 0) return (
    <div className="card flex flex-col gap-2">
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
        <Users2 size={13} /> Consenso da Galera
      </span>
      <p className="text-xs text-slate-400 font-medium mb-1">{jogoAtivo.selecao_casa} × {jogoAtivo.selecao_fora}</p>
      <p className="text-slate-500 text-sm">Nenhum palpite registrado</p>
    </div>
  );

  const vitCasa = palpitesJogo.filter(p => p.gols_casa > p.gols_fora).length;
  const empates = palpitesJogo.filter(p => p.gols_casa === p.gols_fora).length;
  const vitFora = palpitesJogo.filter(p => p.gols_casa < p.gols_fora).length;
  const pct = n => Math.round((n / total) * 100);

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
          <Users2 size={13} /> Consenso da Galera
        </span>
        <span className="text-xs text-slate-600">{total} palpites</span>
      </div>
      <p className="text-xs text-slate-400 font-medium">{jogoAtivo.selecao_casa} × {jogoAtivo.selecao_fora}</p>
      <div className="space-y-2">
        {[
          { label: jogoAtivo.selecao_casa, val: pct(vitCasa), color: 'bg-green-500' },
          { label: 'Empate', val: pct(empates), color: 'bg-slate-500' },
          { label: jogoAtivo.selecao_fora, val: pct(vitFora), color: 'bg-blue-500' },
        ].map(({ label, val, color }) => (
          <div key={label}>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{label}</span><span className="font-bold text-white">{val}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full`} style={{ width: `${val}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardConfrontoLider({ ranking, userId }) {
  const eu = ranking.find(r => r.usuario?.id === userId);
  const lider = ranking[0];

  if (!eu || !lider || eu.usuario?.id === lider.usuario?.id) return null;

  const diff = eu.pontos_total - lider.pontos_total;
  const acimaDe = ranking.filter(r => r.pontos_total > eu.pontos_total).length;

  return (
    <div className="card flex flex-col gap-3">
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
        <Swords size={13} /> Confronto com o Líder
      </span>
      <div className="flex items-center gap-3">
        <div className="flex-1 text-center">
          <p className="text-xl font-bold text-primary-400">{eu.pontos_total}</p>
          <p className="text-xs text-slate-500">Você</p>
        </div>
        <div className="text-slate-700 font-bold text-lg">VS</div>
        <div className="flex-1 text-center">
          <p className="text-xl font-bold text-amber-400">{lider.pontos_total}</p>
          <p className="text-xs text-slate-500 truncate">{lider.usuario?.nome?.split(' ')[0]}</p>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500">
        {diff === 0
          ? 'Empatados com o líder!'
          : diff < 0
            ? <span>Você está <span className="text-red-400 font-semibold">{Math.abs(diff)} pts</span> atrás — {acimaDe} {acimaDe === 1 ? 'pessoa' : 'pessoas'} na sua frente</span>
            : <span>Você está <span className="text-green-400 font-semibold">{diff} pts</span> à frente!</span>
        }
      </p>
    </div>
  );
}

// ── Página Principal ──────────────────────────────────────

export default function BolaoDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const { data: bolao, isLoading } = useBolao(id);
  const { data: ranking = [] } = useRanking(id);
  const { data: palpites = [] } = usePalpites(id);
  const { data: jogos = [] } = useJogos();  // todos os jogos, sem filtro de bolão

  const isSubPage = ![`/boloes/${id}`, `/boloes/${id}/`].includes(location.pathname);

  function copiarCodigo() {
    navigator.clipboard.writeText(bolao.codigo_convite);
    toast.success('Código copiado!');
  }

  if (isLoading) return <div className="card animate-pulse h-64 bg-slate-800" />;

  if (!bolao) return (
    <div className="card text-center py-16 text-slate-500">
      <p>Bolão não encontrado</p>
      <Link to="/boloes" className="text-primary-400 hover:underline mt-2 inline-block">Voltar</Link>
    </div>
  );

  const isCriador = bolao.criador_id === user?.id;

  const tabs = [
    { to: `/boloes/${id}/palpites`, icon: Target, label: 'Palpites' },
    { to: `/boloes/${id}/ranking`, icon: Trophy, label: 'Ranking' },
    { to: `/boloes/${id}/estatisticas`, icon: BarChart2, label: 'Stats' },
    ...(isCriador ? [{ to: `/boloes/${id}/participantes`, icon: Users, label: 'Membros' }] : []),
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge ${bolao.publico ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                {bolao.publico ? 'Público' : 'Privado'}
              </span>
              {!bolao.ativo && <span className="badge bg-red-500/20 text-red-400">Encerrado</span>}
            </div>
            <h1 className="text-2xl font-bold text-white truncate">{bolao.nome}</h1>
            {bolao.descricao && <p className="text-slate-400 mt-2 text-sm">{bolao.descricao}</p>}
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-xs text-slate-500 mb-1">Código de convite</p>
            <button
              onClick={copiarCodigo}
              className="flex items-center gap-2 font-mono text-lg font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              {bolao.codigo_convite}
              <Copy size={14} className="text-slate-500" />
            </button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-4 gap-3 text-center text-xs">
          {[
            { label: 'Vencedor', pts: bolao.pts_acertou_vencedor },
            { label: 'Empate', pts: bolao.pts_acertou_empate },
            { label: 'Saldo', pts: bolao.pts_acertou_saldo },
            { label: 'Exato', pts: bolao.pts_acertou_placar_exato },
          ].map(({ label, pts }) => (
            <div key={label}>
              <p className="text-slate-500">{label}</p>
              <p className="font-bold text-primary-400 text-base">+{pts}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cards — só na raiz do bolão */}
      {!isSubPage && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CardProximoJogo jogos={jogos} palpites={palpites} />
            <CardSuaPosicao ranking={ranking} userId={user?.id} />
            <CardLider ranking={ranking} />
            <CardPendentes bolaoId={id} jogos={jogos} palpites={palpites} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CardConsenso jogos={jogos} palpites={palpites} />
            <CardConfrontoLider ranking={ranking} userId={user?.id} />
          </div>
        </>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 -mb-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Conteúdo da aba ou prompt */}
      {isSubPage ? (
        <Routes>
          <Route path="palpites" element={<PalpitesPage />} />
          <Route path="ranking" element={<RankingPage />} />
          <Route path="estatisticas" element={<EstatisticasPage />} />
          <Route path="participantes" element={<ParticipantesPage />} />
          <Route path="jogos" element={<JogosPage />} />
        </Routes>
      ) : (
        <div className="card text-center py-8 text-slate-500">
          <Trophy size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Selecione uma aba acima para navegar</p>
        </div>
      )}
    </div>
  );
}
