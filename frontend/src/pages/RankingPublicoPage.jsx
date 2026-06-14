import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { rankingService } from '../services';
import { Trophy, Medal } from 'lucide-react';

export default function RankingPublicoPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['ranking-publico', id],
    queryFn: () => rankingService.publico(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        <p>Ranking não encontrado ou não é público.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-6">
          <div className="w-14 h-14 copa-gradient rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Trophy size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{data.bolao}</h1>
          <p className="text-slate-400 text-sm mt-1">Ranking — Bolão Copa 2026</p>
        </div>

        <div className="space-y-2">
          {data.ranking.map((item) => (
            <div key={item.posicao} className={`card flex items-center gap-4 ${item.posicao <= 3 ? 'border-amber-500/20' : ''}`}>
              <div className="w-8 flex items-center justify-center flex-shrink-0">
                {item.posicao === 1 ? <Trophy size={20} className="text-amber-400" />
                  : item.posicao === 2 ? <Medal size={20} className="text-slate-300" />
                  : item.posicao === 3 ? <Medal size={20} className="text-amber-700" />
                  : <span className="text-slate-500 font-bold text-sm">{item.posicao}°</span>}
              </div>
              {item.avatar ? (
                <img src={item.avatar} alt={item.nome} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                  {item.nome?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-white">{item.nome}</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${item.posicao === 1 ? 'text-amber-400' : 'text-white'}`}>{item.pontos}</p>
                <p className="text-xs text-slate-500">pts</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600 pt-4">
          Powered by Bolão Copa 2026
        </p>
      </div>
    </div>
  );
}
