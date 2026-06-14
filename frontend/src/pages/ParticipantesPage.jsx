import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bolaoService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { useBolao } from '../hooks';
import { Users, Trash2, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ParticipantesPage() {
    const { id: bolaoId } = useParams();
    const { user } = useAuth();
    const qc = useQueryClient();
    const { data: bolao } = useBolao(bolaoId);

    const { data: participantes = [], isLoading } = useQuery({
        queryKey: ['participantes', bolaoId],
        queryFn: () => bolaoService.participantes(bolaoId),
        enabled: !!bolaoId,
    });

    const remover = useMutation({
        mutationFn: (usuarioId) => bolaoService.removerParticipante(bolaoId, usuarioId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['participantes', bolaoId] });
            toast.success('Participante removido');
        },
    });

    const isCriador = bolao?.criador_id === user?.id;

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-16 bg-slate-800" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-slide-up">
            <div>
                <h1 className="text-2xl font-bold text-white">Membros</h1>
                <p className="text-slate-400 text-sm mt-1">{participantes.length} participante(s)</p>
            </div>

            <div className="space-y-2">
                {participantes.map((p) => {
                    const ehCriador = p.usuarios?.id === bolao?.criador_id;
                    return (
                        <div key={p.usuarios?.id} className="card flex items-center gap-4">
                            {p.usuarios?.avatar_url ? (
                                <img src={p.usuarios.avatar_url} alt={p.usuarios.nome} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {p.usuarios?.nome?.[0]?.toUpperCase()}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate flex items-center gap-1.5">
                                    {p.usuarios?.nome}
                                    {ehCriador && <Crown size={14} className="text-amber-400" />}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {p.pontuacoes?.[0]?.pontos_total ?? 0} pts · {p.pontuacoes?.[0]?.total_palpites ?? 0} palpites
                                </p>
                            </div>

                            {isCriador && !ehCriador && (
                                <button
                                    onClick={() => remover.mutate(p.usuarios?.id)}
                                    disabled={remover.isPending}
                                    className="text-slate-500 hover:text-red-400 transition-colors p-2"
                                    title="Remover participante"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    );
                })}

                {participantes.length === 0 && (
                    <div className="card text-center py-12 text-slate-500">
                        <Users size={40} className="mx-auto mb-3 opacity-30" />
                        <p>Nenhum participante encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
}