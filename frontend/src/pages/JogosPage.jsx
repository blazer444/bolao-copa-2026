// JogosPage.jsx
import { useJogos } from '../hooks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function JogosPage() {
  const { data: jogos = [], isLoading } = useJogos();
  if (isLoading) return <div className="card animate-pulse h-64 bg-slate-800" />;
  return (
    <div className="space-y-4 animate-slide-up">
      <h1 className="text-2xl font-bold text-white">Jogos</h1>
      <div className="space-y-3">
        {jogos.map(j => (
          <div key={j.id} className="card flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2">
              {j.bandeira_casa && <img src={j.bandeira_casa} className="w-7 h-7 object-contain" alt="" />}
              <span className="font-semibold text-sm">{j.selecao_casa}</span>
            </div>
            <div className="text-center">
              {j.resultados ? (
                <span className="font-display text-xl">{j.resultados.gols_casa} × {j.resultados.gols_fora}</span>
              ) : (
                <span className="text-sm text-slate-400">{format(new Date(j.data_hora), 'dd/MM HH:mm', { locale: ptBR })}</span>
              )}
            </div>
            <div className="flex-1 flex items-center justify-end gap-2">
              <span className="font-semibold text-sm text-right">{j.selecao_fora}</span>
              {j.bandeira_fora && <img src={j.bandeira_fora} className="w-7 h-7 object-contain" alt="" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
