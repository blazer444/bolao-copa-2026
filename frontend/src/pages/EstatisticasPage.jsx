// EstatisticasPage.jsx
import { useParams } from 'react-router-dom';
import { useEstatisticasUsuario } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { BarChart2, Target, TrendingUp } from 'lucide-react';

export default function EstatisticasPage() {
  const { id: bolaoId } = useParams();
  const { user } = useAuth();
  const { data: stats, isLoading } = useEstatisticasUsuario(bolaoId, user?.id);

  if (isLoading) return <div className="card animate-pulse h-64 bg-slate-800" />;

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-white">Suas Estatísticas</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: Target, label: 'Total de pontos', value: stats?.pontos_total ?? 0, color: 'text-primary-400' },
          { icon: TrendingUp, label: 'Palpites feitos', value: stats?.total_palpites ?? 0, color: 'text-blue-400' },
          { icon: BarChart2, label: '% acerto', value: `${stats?.percentual_acerto ?? 0}%`, color: 'text-green-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
