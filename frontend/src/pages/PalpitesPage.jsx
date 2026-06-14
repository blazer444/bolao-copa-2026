import { useParams } from 'react-router-dom';
import { useJogos, usePalpites, useCriarPalpite, useAtualizarPalpite, useConsenso } from '../hooks';
import { useBolao } from '../hooks';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lock, CheckCircle, Users } from 'lucide-react';

function ConsensoGalera({ bolaoId, jogoId, jogoComecou }) {
  const { data, isLoading } = useConsenso(bolaoId, jogoId, jogoComecou);

  if (!jogoComecou) return null;
  if (isLoading) return <p className="text-xs text-slate-500">Carregando consenso...</p>;
  if (!data || data.total_palpites === 0) return null;

  const top3 = data.placares.slice(0, 3);

  return (
    <div className="border-t border-slate-800 pt-3 space-y-1.5">
      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <Users size={12} /> Consenso da galera ({data.total_palpites} palpite{data.total_palpites > 1 ? 's' : ''})
      </p>
      {top3.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="font-mono font-semibold text-slate-300 w-10">{p.gols_casa} x {p.gols_fora}</span>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${p.percentual}%` }} />
          </div>
          <span className="text-slate-500 w-10 text-right">{p.percentual}%</span>
        </div>
      ))}
    </div>
  );
}

function PalpiteCard({ jogo, palpite, bolaoId }) {
  const criar = useCriarPalpite();
  const atualizar = useAtualizarPalpite();

  const bloqueado = jogo.status !== 'NAO_INICIADO' || new Date(jogo.data_hora) <= new Date();

  const [gols, setGols] = useState({
    casa: palpite?.gols_casa ?? '',
    fora: palpite?.gols_fora ?? '',
  });

  async function salvar() {
    if (gols.casa === '' || gols.fora === '') return;
    const dados = {
      jogo_id: jogo.id,
      bolao_id: bolaoId,
      gols_casa: Number(gols.casa),
      gols_fora: Number(gols.fora),
    };
    if (palpite) {
      await atualizar.mutateAsync({ id: palpite.id, ...dados });
    } else {
      await criar.mutateAsync(dados);
    }
  }

  const loading = criar.isPending || atualizar.isPending;

  return (
    <div className={`card space-y-4 ${bloqueado ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {format(new Date(jogo.data_hora), "dd 'de' MMM • HH:mm", { locale: ptBR })}
        </span>
        <div className="flex items-center gap-2">
          {bloqueado && <Lock size={14} className="text-slate-500" />}
          {palpite && <CheckCircle size={14} className="text-green-400" />}
          {jogo.status === 'AO_VIVO' && <span className="badge badge-live animate-pulse">Ao Vivo</span>}
          {jogo.status === 'ENCERRADO' && <span className="badge badge-done">Encerrado</span>}
        </div>
      </div>

      {/* Times */}
      <div className="flex items-center gap-4">
        {/* Casa */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {jogo.bandeira_casa && (
            <img src={jogo.bandeira_casa} alt={jogo.selecao_casa} className="w-10 h-10 object-contain" />
          )}
          <span className="text-sm font-semibold text-center">{jogo.selecao_casa}</span>
        </div>

        {/* Placar palpite */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="number"
            min="0"
            max="99"
            disabled={bloqueado}
            value={gols.casa}
            onChange={e => setGols(g => ({ ...g, casa: e.target.value }))}
            className="w-14 h-12 text-center text-xl font-bold input disabled:cursor-not-allowed"
          />
          <span className="text-slate-600 font-bold">×</span>
          <input
            type="number"
            min="0"
            max="99"
            disabled={bloqueado}
            value={gols.fora}
            onChange={e => setGols(g => ({ ...g, fora: e.target.value }))}
            className="w-14 h-12 text-center text-xl font-bold input disabled:cursor-not-allowed"
          />
        </div>

        {/* Fora */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {jogo.bandeira_fora && (
            <img src={jogo.bandeira_fora} alt={jogo.selecao_fora} className="w-10 h-10 object-contain" />
          )}
          <span className="text-sm font-semibold text-center">{jogo.selecao_fora}</span>
        </div>
      </div>

      {/* Resultado real (se encerrado) */}
      {jogo.status === 'ENCERRADO' && jogo.resultados && (
        <div className="text-center text-sm text-slate-500">
          Resultado: <span className="text-white font-bold">
            {jogo.resultados.gols_casa} × {jogo.resultados.gols_fora}
          </span>
          {palpite && (
            <span className="ml-3 badge badge-gold">+{palpite.pontos_obtidos} pts</span>
          )}
        </div>
      )}

      {/* Botão salvar */}
      {!bloqueado && (
        <button
          onClick={salvar}
          disabled={loading || gols.casa === '' || gols.fora === ''}
          className="btn-primary w-full text-sm py-2"
        >
          {loading ? 'Salvando...' : palpite ? 'Atualizar palpite' : 'Salvar palpite'}
        </button>
      )}

      {bloqueado && (
        <p className="text-center text-xs text-slate-600 flex items-center justify-center gap-1">
          <Lock size={11} /> Palpites encerrados
        </p>
      )}

      <ConsensoGalera bolaoId={bolaoId} jogoId={jogo.id} jogoComecou={bloqueado} />
    </div>
  );
}

export default function PalpitesPage() {
  const { id: bolaoId } = useParams();
  const { data: jogos = [], isLoading: jogosLoading } = useJogos();
  const { data: palpites = [], isLoading: palpitesLoading } = usePalpites(bolaoId);

  const isLoading = jogosLoading || palpitesLoading;

  const palpiteMap = Object.fromEntries(palpites.map(p => [p.jogo_id, p]));

  const jogosOrdenados = [...jogos].sort((a, b) => {
    // Não iniciados primeiro, depois ao vivo, depois encerrados
    const ordem = { NAO_INICIADO: 0, AO_VIVO: 1, ENCERRADO: 2 };
    return ordem[a.status] - ordem[b.status] || new Date(a.data_hora) - new Date(b.data_hora);
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="card animate-pulse h-48 bg-slate-800" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Meus Palpites</h1>
        <p className="text-slate-400 text-sm mt-1">
          {palpites.length} de {jogos.length} palpites feitos
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {jogosOrdenados.map(jogo => (
          <PalpiteCard
            key={jogo.id}
            jogo={jogo}
            palpite={palpiteMap[jogo.id]}
            bolaoId={bolaoId}
          />
        ))}
      </div>
    </div>
  );
}
