import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import RecuperarSenhaPage from './pages/RecuperarSenhaPage';
import DashboardPage from './pages/DashboardPage';
import BolaoListPage from './pages/BolaoListPage';
import BolaoDetailPage from './pages/BolaoDetailPage';
import CriarBolaoPage from './pages/CriarBolaoPage';
import JogosPage from './pages/JogosPage';
import PalpitesPage from './pages/PalpitesPage';
import RankingPage from './pages/RankingPage';
import RankingPublicoPage from './pages/RankingPublicoPage';
import EstatisticasPage from './pages/EstatisticasPage';
import PerfilPage from './pages/PerfilPage';
import ParticipantesPage from './pages/ParticipantesPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/cadastro" element={<PublicRoute><CadastroPage /></PublicRoute>} />
          <Route path="/recuperar-senha" element={<PublicRoute><RecuperarSenhaPage /></PublicRoute>} />
          <Route path="/ranking/publico/:id" element={<RankingPublicoPage />} />

          {/* Private */}
          <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="boloes" element={<BolaoListPage />} />
            <Route path="boloes/novo" element={<CriarBolaoPage />} />

            {/* BolaoDetailPage como pai, sub-rotas como filhos via Outlet */}
            <Route path="boloes/:id" element={<BolaoDetailPage />}>
              <Route path="jogos" element={<JogosPage />} />
              <Route path="palpites" element={<PalpitesPage />} />
              <Route path="ranking" element={<RankingPage />} />
              <Route path="estatisticas" element={<EstatisticasPage />} />
              <Route path="participantes" element={<ParticipantesPage />} />
            </Route>

            <Route path="perfil" element={<PerfilPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
