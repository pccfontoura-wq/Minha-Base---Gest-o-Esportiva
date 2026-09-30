import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Box, Button, Chip, Menu, 
  MenuItem, ListItemIcon, ListItemText, Divider, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControl, InputLabel, 
  Select, Tooltip, Avatar 
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsIcon from '@mui/icons-material/Sports';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { TrocarSenhaDialog } from '../auth/TrocarSenhaDialog';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ setActiveTab }) => {
  const { 
    tenant, user, allTenants, switchTenant, createTenant, 
    switchRole, logout 
  } = useAuth();

  const [tenantAnchorEl, setTenantAnchorEl] = useState<null | HTMLElement>(null);
  const [roleAnchorEl, setRoleAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const [openNewTenantDialog, setOpenNewTenantDialog] = useState(false);
  const [openTrocarSenhaDialog, setOpenTrocarSenhaDialog] = useState(false);

  // New tenant form state
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newCnpj, setNewCnpj] = useState('');
  const [newCity, setNewCity] = useState('São Paulo');
  const [newState, setNewState] = useState('SP');
  const [newColor, setNewColor] = useState('#1b5e20');
  const [newModalities, setNewModalities] = useState<('campo' | 'futsal')[]>(['campo', 'futsal']);

  const handleCreateTenant = async () => {
    if (!newSchoolName.trim()) return;
    await createTenant({
      nome: newSchoolName,
      cnpj: newCnpj,
      cidade: newCity,
      estado: newState,
      corPrimaria: newColor,
      modalidadesAtivas: newModalities,
      plano: 'pro',
    });
    setOpenNewTenantDialog(false);
    setNewSchoolName('');
  };

  const isMaster = user.papel === 'master' || Boolean(user.isMaster);

  const getRoleLabel = (papel: UserRole) => {
    switch (papel) {
      case 'master': return 'Master Admin (Todas Instituições)';
      case 'admin': return 'Admin da Instituição';
      case 'tecnico':
      case 'treinador': return 'Técnico / Treinador';
      case 'responsavel': return 'Responsável (Pai/Mãe)';
    }
  };

  const getRoleIcon = (papel: UserRole) => {
    switch (papel) {
      case 'master': return <AdminPanelSettingsIcon fontSize="small" sx={{ color: '#eab308' }} />;
      case 'admin': return <AdminPanelSettingsIcon fontSize="small" sx={{ color: user.isMaster ? '#eab308' : '#1e293b' }} />;
      case 'tecnico':
      case 'treinador': return <SportsIcon fontSize="small" sx={{ color: '#0284c7' }} />;
      case 'responsavel': return <FamilyRestroomIcon fontSize="small" sx={{ color: '#16a34a' }} />;
    }
  };

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 68, px: { xs: 2, md: 4 } }}>
          {/* Logo & Tenant Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: tenant.corPrimaria || '#1b5e20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              }}
            >
              <SportsSoccerIcon fontSize="medium" />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.2rem' }, color: '#0f172a' }}>
                  {tenant.nome}
                </Typography>
                <Chip
                  label={isMaster ? 'Visão Global Master' : 'Instituição Vinculada'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: isMaster ? '#fef08a' : 'rgba(27, 94, 32, 0.08)',
                    color: isMaster ? '#854d0e' : '#1b5e20',
                    fontWeight: 700,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {tenant.cidade && `${tenant.cidade} - ${tenant.estado}`} • Modalidades:
                </Typography>
                {tenant.modalidadesAtivas.map(m => (
                  <Chip
                    key={m}
                    label={m === 'campo' ? '🌱 Campo' : '⚡ Futsal'}
                    size="small"
                    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Controls: Tenant Switcher (ONLY FOR MASTER), Profile Switcher & User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Institution (Tenant) Selector - Strictly restricted to Master user */}
            {isMaster && (
              <Tooltip title="Visão exclusiva Master: Alternar ou cadastrar instituição">
                <Button
                  id="btn-header-trocar-escolinha"
                  variant="outlined"
                  size="small"
                  startIcon={<SwapHorizIcon />}
                  onClick={(e) => setTenantAnchorEl(e.currentTarget)}
                  sx={{
                    borderColor: '#cbd5e1',
                    color: '#334155',
                    borderRadius: 2,
                    px: 1.5,
                    display: { xs: 'none', sm: 'inline-flex' }
                  }}
                >
                  Instituições ({allTenants.length})
                </Button>
              </Tooltip>
            )}

            {/* Role Switcher Button */}
            <Button
              id="btn-header-trocar-perfil"
              variant="contained"
              size="small"
              onClick={(e) => setRoleAnchorEl(e.currentTarget)}
              startIcon={getRoleIcon(user.papel)}
              sx={{
                bgcolor: user.papel === 'admin' ? '#0f172a' : user.papel === 'treinador' ? '#0284c7' : '#16a34a',
                color: '#ffffff',
                fontWeight: 600,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: user.papel === 'admin' ? '#1e293b' : user.papel === 'treinador' ? '#0369a1' : '#15803d',
                },
              }}
            >
              <Box sx={{ textAlign: 'left', display: { xs: 'none', md: 'block' }, mr: 0.5 }}>
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', opacity: 0.85, lineHeight: 1 }}>
                  Visão Atual:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                  {getRoleLabel(user.papel)}
                </Typography>
              </Box>
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {user.papel.toUpperCase()}
              </Box>
            </Button>

            {/* User Account Avatar / Menu */}
            <Box
              id="btn-header-menu-usuario"
              onClick={(e) => setUserAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                bgcolor: '#f8fafc',
                '&:hover': { bgcolor: '#f1f5f9' },
                transition: 'background-color 0.2s',
              }}
            >
              <Avatar
                src={user.fotoUrl}
                alt={user.nome}
                sx={{ width: 34, height: 34, bgcolor: '#1e3a8a', fontSize: '0.9rem', fontWeight: 700 }}
              >
                {user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', lg: 'block' }, pr: 1, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#0f172a' }}>
                  {user.username || user.nome.split(' ')[0]}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', display: 'block' }}>
                  {user.isMaster ? 'Master User' : user.papel}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Account Menu */}
      <Menu
        anchorEl={userAnchorEl}
        open={Boolean(userAnchorEl)}
        onClose={() => setUserAnchorEl(null)}
        slotProps={{ paper: { sx: { width: 280, borderRadius: 3, p: 1, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {user.nome}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
            Login: <b>{user.username || 'usuario'}</b>
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
            {user.email}
          </Typography>
          {user.isMaster && (
            <Chip
              label="Conta Master"
              size="small"
              sx={{
                mt: 0.8,
                bgcolor: '#fef08a',
                color: '#854d0e',
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 20
              }}
            />
          )}
        </Box>

        <MenuItem
          id="menu-item-alterar-senha"
          onClick={() => {
            setUserAnchorEl(null);
            setOpenTrocarSenhaDialog(true);
          }}
          sx={{ borderRadius: 2, my: 0.5 }}
        >
          <ListItemIcon>
            <LockResetIcon fontSize="small" sx={{ color: '#0284c7' }} />
          </ListItemIcon>
          <ListItemText primary="Alterar Minha Senha" secondary="Definir nova senha pessoal" />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          id="menu-item-logout"
          onClick={() => {
            setUserAnchorEl(null);
            logout();
          }}
          sx={{ borderRadius: 2, color: '#ef4444', fontWeight: 600 }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText primary="Sair do Sistema" secondary="Encerrar sessão atual" />
        </MenuItem>
      </Menu>

      {/* Dialog for Trocar Senha */}
      <TrocarSenhaDialog
        open={openTrocarSenhaDialog}
        onClose={() => setOpenTrocarSenhaDialog(false)}
      />

      {/* Tenant Menu (Only accessible to Master) */}
      {isMaster && (
        <Menu
          anchorEl={tenantAnchorEl}
          open={Boolean(tenantAnchorEl)}
          onClose={() => setTenantAnchorEl(null)}
          slotProps={{ paper: { sx: { width: 340, borderRadius: 3, p: 1, mt: 1 } } }}
        >
          <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem' }}>
            Todas as Instituições (Visão Master)
          </Typography>
          {allTenants.map((t) => (
            <MenuItem
              key={t.id}
              selected={t.id === tenant.id}
              onClick={() => {
                switchTenant(t.id);
                setTenantAnchorEl(null);
              }}
              sx={{ borderRadius: 2, my: 0.5 }}
            >
              <ListItemIcon>
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: t.corPrimaria || '#1b5e20' }} />
              </ListItemIcon>
              <ListItemText
                primary={t.nome}
                secondary={`${t.cidade || 'Brasil'} • Plano ${t.plano.toUpperCase()}`}
                slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.9rem' } } }}
              />
              {t.id === tenant.id && <CheckCircleIcon color="success" fontSize="small" />}
            </MenuItem>
          ))}
          <Divider sx={{ my: 1 }} />
          <MenuItem
            onClick={() => {
              setTenantAnchorEl(null);
              setOpenNewTenantDialog(true);
            }}
            sx={{ color: '#1b5e20', fontWeight: 600, borderRadius: 2 }}
          >
            <ListItemIcon>
              <AddBusinessIcon fontSize="small" sx={{ color: '#1b5e20' }} />
            </ListItemIcon>
            <ListItemText primary="+ Cadastrar Nova Instituição" />
          </MenuItem>
        </Menu>
      )}

      {/* Role / Profile Menu */}
      <Menu
        anchorEl={roleAnchorEl}
        open={Boolean(roleAnchorEl)}
        onClose={() => setRoleAnchorEl(null)}
        slotProps={{ paper: { sx: { width: 300, borderRadius: 3, p: 1, mt: 1 } } }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Alternar Perfil de Acesso
        </Typography>

        {isMaster && (
          <MenuItem
            selected={user.papel === 'master'}
            onClick={() => {
              switchRole('master');
              setActiveTab('dashboard-admin');
              setRoleAnchorEl(null);
            }}
            sx={{ borderRadius: 2, my: 0.5 }}
          >
            <ListItemIcon>
              <AdminPanelSettingsIcon sx={{ color: '#854d0e' }} />
            </ListItemIcon>
            <ListItemText
              primary="Master Admin"
              secondary="Visão de todas as instituições e controle global"
              slotProps={{ primary: { sx: { fontWeight: 600 } } }}
            />
          </MenuItem>
        )}

        <MenuItem
          selected={user.papel === 'admin'}
          onClick={() => {
            switchRole('admin');
            setActiveTab('dashboard-admin');
            setRoleAnchorEl(null);
          }}
          sx={{ borderRadius: 2, my: 0.5 }}
        >
          <ListItemIcon>
            <AdminPanelSettingsIcon sx={{ color: '#0f172a' }} />
          </ListItemIcon>
          <ListItemText
            primary="Admin da Escolinha"
            secondary="Gestão de turmas, alunos, filiais, financeiro PIX e comunicados"
            slotProps={{ primary: { sx: { fontWeight: 600 } } }}
          />
        </MenuItem>

        <MenuItem
          selected={user.papel === 'tecnico' || user.papel === 'treinador'}
          onClick={() => {
            switchRole('tecnico');
            setActiveTab('treinos-chamada');
            setRoleAnchorEl(null);
          }}
          sx={{ borderRadius: 2, my: 0.5 }}
        >
          <ListItemIcon>
            <SportsIcon sx={{ color: '#0284c7' }} />
          </ListItemIcon>
          <ListItemText
            primary="Técnico / Treinador"
            secondary="Presença digital, avaliação técnica campo/futsal e planos IA"
            slotProps={{ primary: { sx: { fontWeight: 600 } } }}
          />
        </MenuItem>

        <MenuItem
          selected={user.papel === 'responsavel'}
          onClick={() => {
            switchRole('responsavel');
            setActiveTab('portal-filho');
            setRoleAnchorEl(null);
          }}
          sx={{ borderRadius: 2, my: 0.5 }}
        >
          <ListItemIcon>
            <FamilyRestroomIcon sx={{ color: '#16a34a' }} />
          </ListItemIcon>
          <ListItemText
            primary="Responsável (Pai / Mãe)"
            secondary="Boletim técnico do filho, frequência, PIX e avisos"
            slotProps={{ primary: { sx: { fontWeight: 600 } } }}
          />
        </MenuItem>
      </Menu>

      {/* Dialog for New Escolinha (Tenant) */}
      <Dialog
        open={openNewTenantDialog}
        onClose={() => setOpenNewTenantDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          ⚽ Cadastrar Nova Escola de Futebol (Tenant)
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Cada escolinha funciona de forma 100% isolada e personalizada no sistema SaaS.
          </Typography>

          <TextField
            label="Nome da Escolinha / Academia"
            fullWidth
            required
            placeholder="Ex: Arena Futsal Kids, Escola Craque do Amanhã"
            value={newSchoolName}
            onChange={(e) => setNewSchoolName(e.target.value)}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 2 }}>
            <TextField
              label="CNPJ (opcional)"
              placeholder="00.000.000/0001-00"
              value={newCnpj}
              onChange={(e) => setNewCnpj(e.target.value)}
            />
            <TextField
              label="Cidade"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
            />
            <TextField
              label="Estado"
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Cor Primária do Clube</InputLabel>
              <Select
                value={newColor}
                label="Cor Primária do Clube"
                onChange={(e) => setNewColor(e.target.value)}
              >
                <MenuItem value="#1b5e20">Verde Gramado (#1b5e20)</MenuItem>
                <MenuItem value="#0284c7">Azul Celeste (#0284c7)</MenuItem>
                <MenuItem value="#dc2626">Vermelho Rubro (#dc2626)</MenuItem>
                <MenuItem value="#0f172a">Preto & Dourado (#0f172a)</MenuItem>
                <MenuItem value="#7c3aed">Roxo / Violeta (#7c3aed)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Modalidades Oferecidas</InputLabel>
              <Select
                multiple
                value={newModalities}
                label="Modalidades Oferecidas"
                onChange={(e) => setNewModalities(typeof e.target.value === 'string' ? [e.target.value as any] : e.target.value)}
                renderValue={(selected) => (selected as string[]).join(', ')}
              >
                <MenuItem value="campo">🌱 Futebol de Campo</MenuItem>
                <MenuItem value="futsal">⚡ Futsal (Quadra)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenNewTenantDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateTenant}
            disabled={!newSchoolName.trim()}
          >
            Criar Escolinha
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
