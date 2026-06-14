import { useParams, Link } from 'react-router-dom';
import { useConfrontoDireto } from '../hooks';
import { ArrowLeft, Trophy, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ConfrontoPage() {
  const { id: bolaoId, usuarioA, usuarioB } = useParams();
  const { data, isLoading } = useConfrontoDireto(bolaoId, usuarioA, usuarioB);

  if (isLoading) {
    return <div className="card animate-pulse h-64 bg-slate-800" />;
  }

  if (!data) {
    return <div className="card text-center py-12 text-slate-500">Confronto não encontrado</div>;
  }

  const { usuario_a, usuario_b, vitorias_a, vitorias_b, empates, confrontos } = data;

  return (
    <div className="space-y-6 animate-slide-up">
      <Link to={`/boloes/${bolaoId}/ranking`} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm">
        <ArrowLeft size={16} /> Voltar ao ranking
      </Link>

      {/* Placar geral */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold mx-auto mb-2">
              {usuario_a?.nome?.[0]?.toUpperCase()}
            </div>
            <p className="font-semibold text-white text-sm truncate">{usuario_a?.nome}</p>
          </div>

          <div className="flex-shrink-0 text-center px-4">
            <p className="text-3xl font-display tracking-wider text-white">
              {vitorias_a} <span className="text-slate-600 text-xl">×</span> {vitorias_b}
            </p>
            <p className="text-xs text-slate-500 mt-1">{empates} empate{empates !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex-1 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold mx-auto mb-2">
              {usuario_b?.nome?.[0]?.toUpperCase()}
            </div>
            <p className="font-semibold text-white text-sm truncate">{usuario_b?.nome}</p>
          </div>
        </div>
      </div>

      {/* Jogo a jogo */}
      <div className="space-y-2">
        {confrontos.map((c, i) => {
          const aGanhou = c.calculado && c.palpite_a.pontos > c.palpite_b.pontos;
          const bGanhou = c.calculado && c.palpite_b.pontos > c.palpite_a.pontos;

          return (
            <div key={i} className="card">
              <p className="text-xs text-slate-500 text-center mb-2">
                {c.jogo?.selecao_casa} x {c.jogo?.selecao_fora}
                {c.jogo?.data_hora && ` · ${format(new Date(c.jogo.data_hora), 'dd/MM', { locale: ptBR })}`}
                {c.jogo?.resultados && ` · Real: ${c.jogo.resultados.gols_casa}x${c.jogo.resultados.gols_fora}`}
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className={`flex-1 text-center rounded-lg py-2 ${aGanhou ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800'}`}>
                  <p className="font-mono font-bold text-white">{c.palpite_a.gols_casa} x {c.palpite_a.gols_fora}</p>
                  {c.calculado && (
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1">
                      {aGanhou && <Trophy size={10} className="text-amber-400" />}
                      {!aGanhou && !bGanhou && <Minus size={10} />}
                      +{c.palpite_a.pontos} pts
                    </p>
                  )}
                </div>
                <div className={`flex-1 text-center rounded-lg py-2 ${bGanhou ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800'}`}>
                  <p className="font-mono font-bold text-white">{c.palpite_b.gols_casa} x {c.palpite_b.gols_fora}</p>
                  {c.calculado && (
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1">
                      {bGanhou && <Trophy size={10} className="text-amber-400" />}
                      {!aGanhou && !bGanhou && <Minus size={10} />}
                      +{c.palpite_b.pontos} pts
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {confrontos.length === 0 && (
          <div className="card text-center py-12 text-slate-500">
            <p>Nenhum jogo em comum com palpites de ambos ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
