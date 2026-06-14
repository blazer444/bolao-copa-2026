import { useParams, Link } from 'react-router-dom';
import { useRanking, useBolao, useEvolucaoRanking } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Share2, Copy, TrendingUp, Swords } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CORES = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#06b6d4', '#f43f5e'];

function GraficoEvolucao({ bolaoId }) {
  const { data, isLoading } = useEvolucaoRanking(bolaoId);

  if (isLoading) return <div className="card animate-pulse h-64 bg-slate-800" />;
  if (!data || !data.series?.length) return null;

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-primary-400" />
        Evolução da pontuação
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data.series}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="rodada" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={Math.ceil(data.series.length / 6)} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {data.jogadores.map((nome, i) => (
            <Line
              key={nome}
              type="monotone"
              dataKey={nome}
              stroke={CORES[i % CORES.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PodiumIcon({ pos }) {
  if (pos === 1) return <Trophy size={20} className="text-amber-400" />;
  if (pos === 2) return <Medal size={20} className="text-slate-300" />;
  if (pos === 3) return <Medal size={20} className="text-amber-700" />;
  return <span className="text-slate-500 font-bold text-sm w-5 text-center">{pos}°</span>;
}

export default function RankingPage() {
  const { id: bolaoId } = useParams();
  const { user } = useAuth();
  const { data: ranking = [], isLoading } = useRanking(bolaoId);
  const { data: bolao } = useBolao(bolaoId);

  function copiarLink() {
    const url = `${window.location.origin}/ranking/publico/${bolaoId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  }

  function compartilharWhatsapp() {
    const url = `${window.location.origin}/ranking/publico/${bolaoId}`;
    const texto = ranking
      .slice(0, 5)
      .map(r => `${r.posicao}° ${r.usuario.nome} — ${r.pontos_total} pts`)
      .join('%0A');
    window.open(`https://wa.me/?text=🏆 Bolão Copa 2026 — ${bolao?.nome}%0A${texto}%0A%0AVer ranking: ${url}`);
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="card animate-pulse h-16 bg-slate-800" />
        ))}
      </div>
    );
  }

  const minhaPosicao = ranking.find(r => r.usuario?.id === user?.id);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ranking</h1>
          {bolao && <p className="text-slate-400 text-sm mt-0.5">{bolao.nome}</p>}
        </div>
        {bolao?.publico && (
          <div className="flex gap-2">
            <button onClick={copiarLink} className="btn-ghost flex items-center gap-2 text-sm px-3 py-2">
              <Copy size={14} />
              Copiar link
            </button>
            <button onClick={compartilharWhatsapp} className="btn-ghost flex items-center gap-2 text-sm px-3 py-2">
              <Share2 size={14} />
              WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* Minha posição */}
      {minhaPosicao && (
        <div className="card border-primary-500/50 bg-primary-500/10">
          <p className="text-xs text-primary-400 font-semibold mb-1">SUA POSIÇÃO</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-display text-white">{minhaPosicao.posicao}°</span>
              <div>
                <p className="font-semibold text-white">{minhaPosicao.usuario?.nome}</p>
                <p className="text-sm text-slate-400">{minhaPosicao.total_palpites} palpites</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-400">{minhaPosicao.pontos_total}</p>
              <p className="text-xs text-slate-500">pontos</p>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de evolução */}
      <GraficoEvolucao bolaoId={bolaoId} />

      {/* Ranking completo */}
      <div className="space-y-2">
        {ranking.map((item) => (
          <div
            key={item.usuario?.id}
            className={`card flex items-center gap-4 transition-all ${
              item.sou_eu ? 'border-primary-500/30 bg-primary-500/5' : ''
            } ${item.posicao <= 3 ? 'border-amber-500/20' : ''}`}
          >
            <div className="flex items-center justify-center w-8 flex-shrink-0">
              <PodiumIcon pos={item.posicao} />
            </div>

            {item.usuario?.avatar_url ? (
              <img src={item.usuario.avatar_url} alt={item.usuario.nome} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {item.usuario?.nome?.[0]?.toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate ${item.sou_eu ? 'text-primary-400' : 'text-white'}`}>
                {item.usuario?.nome} {item.sou_eu && '(você)'}
              </p>
              <p className="text-xs text-slate-500">{item.total_palpites} palpites</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className={`text-lg font-bold ${item.posicao === 1 ? 'text-amber-400' : 'text-white'}`}>
                {item.pontos_total}
              </p>
              <p className="text-xs text-slate-500">pts</p>
            </div>

            {!item.sou_eu && user?.id && (
              <Link
                to={`/boloes/${bolaoId}/confronto/${user.id}/${item.usuario?.id}`}
                className="text-slate-500 hover:text-primary-400 transition-colors p-1.5 flex-shrink-0"
                title="Comparar com este jogador"
              >
                <Swords size={16} />
              </Link>
            )}
          </div>
        ))}

        {ranking.length === 0 && (
          <div className="card text-center py-12 text-slate-500">
            <Trophy size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum palpite ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
