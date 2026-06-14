import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCriarBolao } from '../hooks';
import { ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CriarBolaoPage() {
  const navigate = useNavigate();
  const criar = useCriarBolao();

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    publico: false,
    pts_acertou_vencedor: 3,
    pts_acertou_empate: 3,
    pts_acertou_saldo: 5,
    pts_acertou_placar_exato: 10,
  });

  const [showPontuacao, setShowPontuacao] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const bolao = await criar.mutateAsync(form);
    navigate(`/boloes/${bolao.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <Link to="/boloes" className="text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Criar Bolão</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-300">Informações</h2>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Nome do bolão *</label>
            <input
              required
              className="input"
              placeholder="Ex: Bolão da Firma 2026"
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Descrição</label>
            <textarea
              className="input resize-none h-24"
              placeholder="Descrição opcional do bolão..."
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, publico: !f.publico }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.publico ? 'bg-primary-500' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.publico ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-slate-200">Ranking público</p>
              <p className="text-xs text-slate-500">Permite compartilhar o ranking sem login</p>
            </div>
          </div>
        </div>

        {/* Pontuação */}
        <div className="card space-y-4">
          <button
            type="button"
            onClick={() => setShowPontuacao(!showPontuacao)}
            className="flex items-center gap-2 font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Settings size={16} />
            Pontuação
            <span className="text-xs text-slate-500 font-normal ml-1">{showPontuacao ? '▲ ocultar' : '▼ personalizar'}</span>
          </button>

          {!showPontuacao && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Acertou vencedor', value: form.pts_acertou_vencedor },
                { label: 'Acertou empate', value: form.pts_acertou_empate },
                { label: 'Acertou saldo', value: form.pts_acertou_saldo },
                { label: 'Placar exato', value: form.pts_acertou_placar_exato },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-slate-400">
                  <span>{label}</span>
                  <span className="font-bold text-slate-200">+{value}</span>
                </div>
              ))}
            </div>
          )}

          {showPontuacao && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'pts_acertou_vencedor', label: 'Acertou vencedor' },
                { key: 'pts_acertou_empate', label: 'Acertou empate' },
                { key: 'pts_acertou_saldo', label: 'Acertou saldo de gols' },
                { key: 'pts_acertou_placar_exato', label: 'Placar exato' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-slate-500 mb-1">{label}</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="input text-center"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={criar.isPending} className="btn-primary w-full py-3">
          {criar.isPending ? 'Criando...' : 'Criar Bolão'}
        </button>
      </form>
    </div>
  );
}
