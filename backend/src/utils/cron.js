import cron from 'node-cron';
import { sincronizarJogos, sincronizarResultados } from '../services/football-api.service.js';

export function startCronJobs() {
  // Sincroniza lista de jogos todo dia às 6h (BRT)
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Sincronizando jogos...');
    try {
      await sincronizarJogos();
    } catch (err) {
      console.error('[CRON] Erro ao sincronizar jogos:', err.message);
    }
  });

  // Sincroniza resultados a cada 5 minutos (durante a Copa)
  cron.schedule('*/5 * * * *', async () => {
    try {
      await sincronizarResultados();
    } catch (err) {
      console.error('[CRON] Erro ao sincronizar resultados:', err.message);
    }
  });

  console.log('⏰ Cron jobs iniciados');
}
