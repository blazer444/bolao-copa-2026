import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.senha);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — hero */}
      <div className="hidden lg:flex flex-1 copa-gradient items-center justify-center p-12">
        <div className="text-center text-white">
          <Trophy size={80} className="mx-auto mb-6 opacity-90" />
          <h1 className="font-display text-6xl tracking-widest mb-4">COPA 2026</h1>
          <p className="text-xl opacity-80 font-light">Faça seus palpites e dispute<br />com seus amigos!</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-8 py-12 bg-slate-950">
        <div className="max-w-sm mx-auto w-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 copa-gradient rounded-xl flex items-center justify-center lg:hidden">
              <Trophy size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Entrar</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="••••••••"
                  value={form.senha}
                  onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/recuperar-senha" className="text-sm text-primary-400 hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-primary-400 font-medium hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
