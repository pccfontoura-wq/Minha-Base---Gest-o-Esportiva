import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Avatar, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select,
  MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tooltip, Switch, FormControlLabel,
  Alert, Stack, InputAdornment
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SportsIcon from '@mui/icons-material/Sports';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import { useAuth } from '../../context/AuthContext';
import { Usuario, UserRole } from '../../types';

export const UsuariosManager: React.FC = () => {
  const { 
    usuarios, filiais, tenant, allTenants, cadastrarUsuario, updateUsuario, 
    trocarSenhaUsuario, toggleAtivoUsuario, user: currentUser 
  } = useAuth();

  const isMaster = currentUser.papel === 'master' || Boolean(currentUser.isMaster);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  
  // Dialogs
  const [openModal, setOpenModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<Usuario | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('senha123');
  const [papel, setPapel] = useState<UserRole>('tecnico');
  const [instituicaoId, setInstituicaoId] = useState<string>(tenant.id);
  const [filialId, setFilialId] = useState<string>('');
  const [telefone, setTelefone] = useState('');
  const [ativo, setAtivo] = useState(true);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setNome('');
    setEmail('');
    setUsername('');
    setSenha('senha123');
    setPapel('tecnico');
    setInstituicaoId(tenant.id);
    setFilialId(filiais[0]?.id || '');
    setTelefone('');
    setAtivo(true);
    setOpenModal(true);
  };

  const handleOpenEdit = (u: Usuario) => {
    setEditingUser(u);
    setNome(u.nome);
    setEmail(u.email);
    setUsername(u.username || '');
    setSenha(u.senha || '');
    setPapel(u.papel);
    setInstituicaoId(u.tenantId || tenant.id);
    setFilialId(u.filialId || '');
    setTelefone(u.telefone || '');
    setAtivo(u.ativo !== false);
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!nome.trim() || !email.trim()) return;
    const targetTenantId = isMaster ? instituicaoId : tenant.id;

    if (editingUser) {
      await updateUsuario(editingUser.id, {
        nome,
        email,
        username: username || email.split('@')[0],
        papel: !isMaster && papel === 'master' ? 'admin' : papel,
        tenantId: targetTenantId,
        filialId: filialId || undefined,
        telefone,
        ativo,
      });
      setAlertSuccess(`Usuário ${nome} atualizado com sucesso!`);
    } else {
      await cadastrarUsuario({
        nome,
        email,
        username: username || email.split('@')[0],
        senha: senha || 'senha123',
        papel: !isMaster && papel === 'master' ? 'admin' : papel,
        tenantId: targetTenantId,
        filialId: filialId || undefined,
        telefone,
        ativo,
        precisaTrocarSenha: true,
      });
      setAlertSuccess(`Novo usuário ${nome} vinculado à instituição cadastrado com sucesso!`);
    }

    setOpenModal(false);
  };

  const handleSavePassword = async () => {
    if (!selectedUserForPassword || !newPassword.trim()) return;
    await trocarSenhaUsuario(selectedUserForPassword.id, newPassword);
    setAlertSuccess(`Senha de ${selectedUserForPassword.nome} alterada com sucesso!`);
    setOpenPasswordModal(false);
    setNewPassword('');
    setSelectedUserForPassword(null);
  };

  const filteredUsers = usuarios.filter(u => {
    // Non-master admins ONLY see users belonging to their own institution (and never Master users)
    if (!isMaster) {
      if (u.tenantId !== tenant.id) return false;
      if (u.isMaster || u.papel === 'master') return false;
    }

    const matchesSearch = 
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'todos' || u.papel === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole, isMaster?: boolean) => {
    if (isMaster || role === 'master') {
      return (
        <Chip
          icon={<AdminPanelSettingsIcon sx={{ fontSize: '14px !important', color: '#854d0e !important' }} />}
          label="Master Admin"
          size="small"
          sx={{ bgcolor: '#fef08a', color: '#854d0e', fontWeight: 700, fontSize: '0.7rem' }}
        />
      );
    }
    if (role === 'admin') {
      return (
        <Chip
          icon={<AdminPanelSettingsIcon sx={{ fontSize: '14px !important', color: '#1e293b !important' }} />}
          label="Admin da Escola"
          size="small"
          sx={{ bgcolor: '#f1f5f9', color: '#1e293b', fontWeight: 700, fontSize: '0.7rem' }}
        />
      );
    }
    if (role === 'tecnico' || role === 'treinador') {
      return (
        <Chip
          icon={<SportsIcon sx={{ fontSize: '14px !important', color: '#0284c7 !important' }} />}
          label="Técnico / Treinador"
          size="small"
          sx={{ bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 700, fontSize: '0.7rem' }}
        />
      );
    }
    return (
      <Chip
        icon={<FamilyRestroomIcon sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
        label="Responsável (Pais)"
        size="small"
        sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: '0.7rem' }}
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            👥 Gestão de Usuários & Contas de Acesso
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Cadastre, edite perfis e controle permissões (Master, Admin, Técnico e Responsável).
          </Typography>
        </Box>

        <Button
          id="btn-cadastrar-usuario"
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenAdd}
          sx={{
            bgcolor: '#1b5e20',
            fontWeight: 700,
            borderRadius: 2.5,
            px: 2.5,
            py: 1,
            '&:hover': { bgcolor: '#14532d' }
          }}
        >
          Novo Usuário
        </Button>
      </Box>

      {alertSuccess && (
        <Alert severity="success" onClose={() => setAlertSuccess(null)} sx={{ borderRadius: 2 }}>
          {alertSuccess}
        </Alert>
      )}

      {/* Filters and Stats */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Buscar por nome, e-mail ou login..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 280, flexGrow: 1 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }
              }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Papel</InputLabel>
              <Select
                value={roleFilter}
                label="Filtrar por Papel"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="todos">Todos os Papéis</MenuItem>
                <MenuItem value="master">Master</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="tecnico">Técnico / Treinador</MenuItem>
                <MenuItem value="responsavel">Responsável</MenuItem>
              </Select>
            </FormControl>

            <Chip 
              label={`Total: ${filteredUsers.length} usuários`} 
              size="small" 
              sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} 
            />
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Usuário / Identificação</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Login / E-mail</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Instituição Vinculada</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Papel (Perfil)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Filial Vinculada</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((u) => {
                const filial = filiais.find(f => f.id === u.filialId);
                const inst = allTenants.find(t => t.id === u.tenantId) || tenant;
                const isUserActive = u.ativo !== false;

                return (
                  <TableRow key={u.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={u.fotoUrl}
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: u.isMaster || u.papel === 'master' ? '#854d0e' : '#0284c7',
                            fontWeight: 700,
                            fontSize: '0.9rem'
                          }}
                        >
                          {u.nome ? u.nome.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {u.nome}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {u.telefone || 'Sem telefone'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {u.username || u.email.split('@')[0]}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {u.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={u.isMaster || u.papel === 'master' ? 'Todas (Master Global)' : inst.nome}
                        size="small"
                        sx={{
                          bgcolor: u.isMaster || u.papel === 'master' ? '#fef08a' : '#f1f5f9',
                          color: u.isMaster || u.papel === 'master' ? '#854d0e' : '#0f172a',
                          fontWeight: 600,
                          fontSize: '0.72rem'
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {getRoleBadge(u.papel, u.isMaster)}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: filial ? '#0f172a' : '#94a3b8' }}>
                        {filial ? filial.nome.split('-')[0] : 'Todas as Filiais'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={isUserActive ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} /> : <BlockIcon sx={{ fontSize: '14px !important' }} />}
                        label={isUserActive ? 'Ativo' : 'Inativo'}
                        size="small"
                        color={isUserActive ? 'success' : 'default'}
                        variant={isUserActive ? 'filled' : 'outlined'}
                        sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Alterar Senha do Usuário">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedUserForPassword(u);
                              setOpenPasswordModal(true);
                            }}
                            sx={{ color: '#0284c7' }}
                          >
                            <LockResetIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Editar Usuário">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(u)}
                            sx={{ color: '#475569' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {currentUser.id !== u.id && (
                          <Tooltip title={isUserActive ? 'Desativar Acesso' : 'Ativar Acesso'}>
                            <Switch
                              size="small"
                              checked={isUserActive}
                              onChange={() => toggleAtivoUsuario(u.id)}
                              color="success"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal: Novo / Editar Usuário */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingUser ? '✏️ Editar Usuário' : '➕ Cadastrar Novo Usuário'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Nome Completo"
            fullWidth
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="E-mail"
              fullWidth
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Nome de Usuário (Login)"
              fullWidth
              value={username}
              placeholder="Ex: joao.silva"
              onChange={(e) => setUsername(e.target.value)}
            />
          </Box>

          {!editingUser && (
            <TextField
              label="Senha Inicial Provisória"
              fullWidth
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              helperText="O usuário será orientado a redefinir a senha no primeiro acesso."
            />
          )}

          <FormControl fullWidth required disabled={!isMaster}>
            <InputLabel>Instituição Vinculada</InputLabel>
            <Select
              value={isMaster ? instituicaoId : tenant.id}
              label="Instituição Vinculada"
              onChange={(e) => setInstituicaoId(e.target.value)}
            >
              {isMaster ? (
                allTenants.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.nome} ({t.cidade}/{t.estado})
                  </MenuItem>
                ))
              ) : (
                <MenuItem value={tenant.id}>{tenant.nome}</MenuItem>
              )}
            </Select>
          </FormControl>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Papel / Perfil de Acesso</InputLabel>
              <Select
                value={papel}
                label="Papel / Perfil de Acesso"
                onChange={(e) => setPapel(e.target.value as UserRole)}
              >
                {isMaster && (
                  <MenuItem value="master">👑 Master (Visão de Todas as Instituições)</MenuItem>
                )}
                <MenuItem value="admin">💼 Admin da Instituição (Gestão Local)</MenuItem>
                <MenuItem value="tecnico">⚽ Técnico / Professor (Suas Turmas)</MenuItem>
                <MenuItem value="responsavel">👨‍👩‍👧 Responsável (Dados do Filho)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Filial de Atuação</InputLabel>
              <Select
                value={filialId}
                label="Filial de Atuação"
                onChange={(e) => setFilialId(e.target.value)}
              >
                <MenuItem value="">Todas as Filiais / Global</MenuItem>
                {filiais.map(f => (
                  <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Telefone / WhatsApp"
            fullWidth
            value={telefone}
            placeholder="(11) 99999-9999"
            onChange={(e) => setTelefone(e.target.value)}
          />

          <FormControlLabel
            control={
              <Switch
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                color="success"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {ativo ? 'Conta Ativa (Pode fazer login)' : 'Conta Inativa (Acesso bloqueado)'}
              </Typography>
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!nome.trim() || !email.trim()}
            sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#14532d' } }}
          >
            {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Redefinir Senha do Usuário */}
      <Dialog
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          🔒 Redefinir Senha
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Defina uma nova senha para o usuário <b>{selectedUserForPassword?.nome}</b>:
          </Typography>
          <TextField
            label="Nova Senha"
            fullWidth
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenPasswordModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePassword}
            disabled={!newPassword || newPassword.length < 6}
            sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
          >
            Salvar Nova Senha
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
