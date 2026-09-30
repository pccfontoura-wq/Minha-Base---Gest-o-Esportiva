import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';
import { appTheme } from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';

// Auth Components
import { LoginScreen } from './components/auth/LoginScreen';
import { PrimeiroAcessoTrocaSenha } from './components/auth/PrimeiroAcessoTrocaSenha';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CategoriasTurmasManager } from './components/admin/CategoriasTurmasManager';
import { AlunosResponsaveisManager } from './components/admin/AlunosResponsaveisManager';
import { CobrancasManager } from './components/admin/CobrancasManager';
import { ComunicadosManager } from './components/admin/ComunicadosManager';
import { TenantSettings } from './components/admin/TenantSettings';
import { UsuariosManager } from './components/admin/UsuariosManager';

// Coach Components
import { PresencaDigital } from './components/treinador/PresencaDigital';
import { AvaliacaoTecnicaForm } from './components/treinador/AvaliacaoTecnicaForm';
import { PlanoDeTreinoIA } from './components/treinador/PlanoDeTreinoIA';
import { AnaliseFotoAtleta } from './components/treinador/AnaliseFotoAtleta';

// Parent Components
import { ResponsavelDashboard } from './components/responsavel/ResponsavelDashboard';

// Athlete Evolution & Training Tips
import { EvolucaoAtleta } from './components/evolucao/EvolucaoAtleta';

const MainLayout: React.FC = () => {
  const { user } = useAuth();

  // Set initial view based on role
  const getDefaultView = () => {
    if (user.papel === 'tecnico' || user.papel === 'treinador') return 'treinos-chamada';
    if (user.papel === 'responsavel') return 'portal-filho';
    return 'dashboard-admin';
  };

  const [activeTab, setActiveTab] = useState<string>(getDefaultView());
  const [selectedAlunoEvolucao, setSelectedAlunoEvolucao] = useState<string | undefined>(undefined);

  // Keep view synchronized if role is switched via demo toggle
  React.useEffect(() => {
    if (user.papel === 'tecnico' || user.papel === 'treinador') {
      setActiveTab('treinos-chamada');
    } else if (user.papel === 'responsavel') {
      setActiveTab('portal-filho');
    } else if (user.papel === 'master' || user.papel === 'admin') {
      setActiveTab('dashboard-admin');
    }
  }, [user.papel]);

  const renderActiveView = () => {
    switch (activeTab) {
      // Admin Views
      case 'dashboard-admin':
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={setActiveTab} />;
      case 'turmas-categorias':
      case 'admin-categorias-turmas':
        return <CategoriasTurmasManager />;
      case 'alunos-responsaveis':
      case 'admin-alunos-responsaveis':
        return <AlunosResponsaveisManager />;
      case 'cobrancas-pix':
      case 'admin-cobrancas':
        return <CobrancasManager />;
      case 'usuarios-admin':
      case 'admin-usuarios':
        return <UsuariosManager />;
      case 'comunicados-admin':
      case 'admin-comunicados':
      case 'comunicados-pais':
        return <ComunicadosManager />;
      case 'config-escola':
      case 'admin-config':
        return <TenantSettings />;

      // Coach Views
      case 'treinos-chamada':
      case 'coach-presenca':
        return <PresencaDigital />;
      case 'avaliacao-tecnica':
      case 'coach-avaliacao':
        return (
          <AvaliacaoTecnicaForm
            onNavigateToEvolucao={(alunoId) => {
              if (alunoId) setSelectedAlunoEvolucao(alunoId);
              setActiveTab('evolucao-atleta');
            }}
          />
        );
      case 'plano-treino-ia':
      case 'coach-treinos-ia':
        return <PlanoDeTreinoIA />;
      case 'analise-foto':
      case 'coach-analise-foto':
        return <AnaliseFotoAtleta />;

      // Athlete Evolution & Training Tips (Master, Admin, Coach, Parent)
      case 'evolucao-atleta':
      case 'atleta-evolucao':
      case 'dicas-treino':
        return (
          <EvolucaoAtleta
            selectedAlunoIdProp={selectedAlunoEvolucao}
            onNavigateToAvaliacao={() => setActiveTab('avaliacao-tecnica')}
          />
        );

      // Parent Views
      case 'portal-filho':
      case 'parent-dashboard':
      case 'minhas-cobrancas':
      case 'parent-financeiro':
        return <ResponsavelDashboard />;

      default:
        return <AdminDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content View */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            minHeight: 'calc(100vh - 68px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Container maxWidth="xl" sx={{ p: '0 !important', flexGrow: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderActiveView()}
              </motion.div>
            </AnimatePresence>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // 1. If not authenticated, show Login screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // 2. If authenticated but requires first-access password change (e.g. pcfontoura)
  if (user.precisaTrocarSenha) {
    return <PrimeiroAcessoTrocaSenha />;
  }

  // 3. Otherwise, render full application
  return <MainLayout />;
};

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
