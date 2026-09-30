import React from 'react';
import { 
  Box, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Typography 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PaidIcon from '@mui/icons-material/Paid';
import CampaignIcon from '@mui/icons-material/Campaign';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const isMaster = user.papel === 'master' || user.isMaster;
  const isMasterOrAdmin = isMaster || user.papel === 'admin';
  const isTecnico = user.papel === 'tecnico' || user.papel === 'treinador';
  const isResponsavel = user.papel === 'responsavel';

  const roleLabel = isMasterOrAdmin 
    ? (user.papel === 'master' ? 'Master Admin' : 'Gestão da Escola') 
    : isTecnico 
    ? 'Área Técnica (Treinador)' 
    : 'Portal da Família';

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        bgcolor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        minHeight: 'calc(100vh - 68px)',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        {/* Role Header Badge */}
        <Box sx={{ mb: 2, px: 1 }}>
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: '#94a3b8',
              display: 'block',
              mb: 0.5,
            }}
          >
            Módulos • {roleLabel}
          </Typography>
        </Box>

        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          {/* Master & Admin Navigation */}
          {isMasterOrAdmin && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'dashboard-admin'}
                  onClick={() => setActiveTab('dashboard-admin')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(27, 94, 32, 0.1)', color: '#1b5e20', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'dashboard-admin' ? '#1b5e20' : '#64748b' }}>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Visão Geral"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'dashboard-admin' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'turmas-categorias'}
                  onClick={() => setActiveTab('turmas-categorias')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(27, 94, 32, 0.1)', color: '#1b5e20', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'turmas-categorias' ? '#1b5e20' : '#64748b' }}>
                    <GroupsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Turmas & Categorias"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'turmas-categorias' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'alunos-responsaveis'}
                  onClick={() => setActiveTab('alunos-responsaveis')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(27, 94, 32, 0.1)', color: '#1b5e20', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'alunos-responsaveis' ? '#1b5e20' : '#64748b' }}>
                    <PersonAddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Alunos & Matrículas"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'alunos-responsaveis' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'evolucao-atleta'}
                  onClick={() => setActiveTab('evolucao-atleta')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(27, 94, 32, 0.1)', color: '#1b5e20', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'evolucao-atleta' ? '#1b5e20' : '#64748b' }}>
                    <TrendingUpIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Evolução dos Atletas"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'evolucao-atleta' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'cobrancas-pix'}
                  onClick={() => setActiveTab('cobrancas-pix')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(27, 94, 32, 0.1)', color: '#1b5e20', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'cobrancas-pix' ? '#1b5e20' : '#64748b' }}>
                    <PaidIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Cobranças & PIX"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'cobrancas-pix' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'usuarios-admin'}
                  onClick={() => setActiveTab('usuarios-admin')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(27, 94, 32, 0.1)', color: '#1b5e20', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'usuarios-admin' ? '#1b5e20' : '#64748b' }}>
                    <ManageAccountsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Usuários & Acessos"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'usuarios-admin' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'comunicados-admin'}
                  onClick={() => setActiveTab('comunicados-admin')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(27, 94, 32, 0.1)', color: '#1b5e20', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'comunicados-admin' ? '#1b5e20' : '#64748b' }}>
                    <CampaignIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mural de Comunicados"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'comunicados-admin' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'config-escola'}
                  onClick={() => setActiveTab('config-escola')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(27, 94, 32, 0.1)', color: '#1b5e20', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'config-escola' ? '#1b5e20' : '#64748b' }}>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={isMaster ? 'Instituições & Filiais' : 'Dados da Instituição'}
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'config-escola' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          )}

          {/* Coach / Tecnico Navigation */}
          {isTecnico && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'treinos-chamada'}
                  onClick={() => setActiveTab('treinos-chamada')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'treinos-chamada' ? '#0284c7' : '#64748b' }}>
                    <HowToRegIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Presença Digital"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'treinos-chamada' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'avaliacao-tecnica'}
                  onClick={() => setActiveTab('avaliacao-tecnica')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'avaliacao-tecnica' ? '#0284c7' : '#64748b' }}>
                    <AssessmentIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Avaliação Técnica"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'avaliacao-tecnica' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'evolucao-atleta'}
                  onClick={() => setActiveTab('evolucao-atleta')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'evolucao-atleta' ? '#0284c7' : '#64748b' }}>
                    <TrendingUpIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Evolução & Dicas"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'evolucao-atleta' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'plano-treino-ia'}
                  onClick={() => setActiveTab('plano-treino-ia')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'plano-treino-ia' ? '#0284c7' : '#64748b' }}>
                    <AutoAwesomeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Planejador IA (CBF/FIFA)" 
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'plano-treino-ia' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'analise-foto'}
                  onClick={() => setActiveTab('analise-foto')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'analise-foto' ? '#0284c7' : '#64748b' }}>
                    <CameraAltIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Análise de Foto IA"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'analise-foto' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'comunicados-admin'}
                  onClick={() => setActiveTab('comunicados-admin')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'comunicados-admin' ? '#0284c7' : '#64748b' }}>
                    <CampaignIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mural de Avisos"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'comunicados-admin' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          )}

          {/* Parent / Responsavel Navigation */}
          {isResponsavel && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'portal-filho'}
                  onClick={() => setActiveTab('portal-filho')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'portal-filho' ? '#16a34a' : '#64748b' }}>
                    <ChildCareIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Boletim & Presença"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'portal-filho' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'evolucao-atleta'}
                  onClick={() => setActiveTab('evolucao-atleta')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'evolucao-atleta' ? '#16a34a' : '#64748b' }}>
                    <TrendingUpIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Evolução & Dicas"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'evolucao-atleta' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'minhas-cobrancas'}
                  onClick={() => setActiveTab('minhas-cobrancas')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'minhas-cobrancas' ? '#16a34a' : '#64748b' }}>
                    <QrCode2Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mensalidades & PIX"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'minhas-cobrancas' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  selected={activeTab === 'comunicados-pais'}
                  onClick={() => setActiveTab('comunicados-pais')}
                  sx={{
                    borderRadius: 2.5,
                    '&.Mui-selected': { bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', fontWeight: 700 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'comunicados-pais' ? '#16a34a' : '#64748b' }}>
                    <CampaignIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Avisos & Eventos"
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: activeTab === 'comunicados-pais' ? 700 : 500 } } }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Box>
  );
};
