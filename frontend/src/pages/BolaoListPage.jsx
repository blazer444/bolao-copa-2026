import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoloes, useEntrarBolao } from '../hooks';
import { Plus, Trophy, ChevronRight, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BolaoListPage() {
  const { data: boloes = [], isLoading } = useBoloes();
  const entrar = useEntrarBolao();
  const [codigo, setCodigo] = useState('');
  const [showEntrar, setShowEntrar] = useState(false);

  async function handleEntrar(e) {
    e.preventDefault();
    if (!codigo.trim()) return;
    try {
      await entrar.mutateAsync(codigo.trim());
      setCodigo('');
      setShowEntrar(false);
    } catch {}
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Meus Bolões</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowEntrar(!showEntrar)} className="btn-ghost text-sm">
            <Hash size={14} className="inline mr-1" /> Entrar com código
          </button>
          <Link to="/boloes/novo" className="btn-primary text-sm flex items-center gap-1.5">
            <Plus size={16} /> Criar bolão
          </Link>
        </div>
      </div>

      {/* Entrar por código */}
      {showEntrar && (
        <form onSubmit={handleEntrar} className="card flex gap-3">
          <input
            className="input flex-1"
            placeholder="Código do bolão (ex: A3F9B2C1)"
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase())}
            maxLength={10}
          />
          <button type="submit" disabled={entrar.isPending} className="btn-primary whitespace-nowrap">
            {entrar.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-28 bg-slate-800" />)}
        </div>
      ) : boloes.length === 0 ? (
        <div className="card text-center py-16">
          <Trophy size={48} className="mx-auto mb-4 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-300 mb-2">Nenhum bolão ainda</h2>
          <p className="text-slate-500 mb-6">Crie seu primeiro bolão ou entre com um código</p>
          <Link to="/boloes/novo" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Criar bolão
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {boloes.map(b => (
            <Link
              key={b.id}
              to={`/boloes/${b.id}`}
              className="card hover:border-slate-600 transition-all group flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors truncate">
                    {b.nome}
                  </h3>
                  {b.descricao && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{b.descricao}</p>}
                </div>
                <ChevronRight size={18} className="text-slate-600 group-hover:text-primary-400 transition-colors flex-shrink-0 mt-0.5 ml-3" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${b.publico ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                  {b.publico ? 'Público' : 'Privado'}
                </span>
                {!b.ativo && <span className="badge bg-red-500/20 text-red-400">Encerrado</span>}
                <span className="badge bg-slate-800 text-slate-400 font-mono tracking-widest">
                  #{b.codigo_convite}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
