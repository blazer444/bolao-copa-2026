import { useParams, Link, NavLink } from 'react-router-dom';
import { useBolao } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Target, BarChart2, Users, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BolaoDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: bolao, isLoading } = useBolao(id);

  function copiarCodigo() {
    navigator.clipboard.writeText(bolao.codigo_convite);
    toast.success('Código copiado!');
  }

  if (isLoading) {
    return <div className="card animate-pulse h-64 bg-slate-800" />;
  }

  if (!bolao) {
    return (
      <div className="card text-center py-16 text-slate-500">
        <p>Bolão não encontrado</p>
        <Link to="/boloes" className="text-primary-400 hover:underline mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

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

        {/* Tabela de pontuação */}
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

      {/* Instrução inicial */}
      <div className="card text-center py-10 text-slate-500">
        <Trophy size={32} className="mx-auto mb-3 opacity-30" />
        <p>Selecione uma aba acima para navegar</p>
      </div>
    </div>
  );
}
