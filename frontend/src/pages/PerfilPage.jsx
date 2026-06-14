import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usuarioService } from '../services';
import toast from 'react-hot-toast';

export default function PerfilPage() {
  const { user } = useAuth();
  const [nome, setNome] = useState(user?.user_metadata?.nome || '');
  const [loading, setLoading] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await usuarioService.atualizar({ nome });
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
      <form onSubmit={handleSave} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Nome</label>
          <input className="input" value={nome} onChange={e => setNome(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
          <input className="input opacity-60" value={user?.email || ''} disabled />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}
