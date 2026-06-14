// ─── CadastroPage.jsx ────────────────────────────────────
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, User, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function CadastroPage() {
  const { cadastro } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await cadastro(form.nome, form.email, form.senha);
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 copa-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Criar conta</h1>
          <p className="text-slate-400 mt-1 text-sm">Entre no Bolão Copa 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {[
            { key: 'nome', icon: User, type: 'text', placeholder: 'Seu nome completo' },
            { key: 'email', icon: Mail, type: 'email', placeholder: 'seu@email.com' },
            { key: 'senha', icon: Lock, type: 'password', placeholder: '••••••••' },
          ].map(({ key, icon: Icon, type, placeholder }) => (
            <div key={key}>
              <div className="relative">
                <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={type}
                  required
                  className="input pl-10"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary-400 font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

export default CadastroPage;
