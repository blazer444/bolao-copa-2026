// RecuperarSenhaPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RecuperarSenhaPage() {
  const { recuperarSenha } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await recuperarSenha(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md card space-y-5">
        <h1 className="text-xl font-bold text-white">Recuperar senha</h1>
        {sent ? (
          <p className="text-green-400">Email enviado! Verifique sua caixa de entrada.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email" required className="input"
              placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}
        <Link to="/login" className="block text-center text-sm text-slate-400 hover:text-slate-200">← Voltar ao login</Link>
      </div>
    </div>
  );
}
