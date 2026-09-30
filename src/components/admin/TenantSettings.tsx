import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, TextField, 
  FormControl, InputLabel, Select, MenuItem, Dialog, 
  DialogTitle, DialogContent, DialogActions, IconButton, 
  Alert, Stack, Chip 
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../../context/AuthContext';
import { Filial } from '../../types';

export const TenantSettings: React.FC = () => {
  const { 
    user, tenant, allTenants, switchTenant, createTenant, 
    updateTenant, filiais, addFilial, updateFilial, deleteFilial 
  } = useAuth();

  const isMaster = user.papel === 'master' || Boolean(user.isMaster);

  // Tenant form state
  const [nome, setNome] = useState(tenant.nome);
  const [cnpj, setCnpj] = useState(tenant.cnpj || '');
  const [email, setEmail] = useState(tenant.email || '');
  const [telefone, setTelefone] = useState(tenant.telefone || '');
  const [endereco, setEndereco] = useState(tenant.endereco || '');
  const [cidade, setCidade] = useState(tenant.cidade || '');
  const [estado, setEstado] = useState(tenant.estado || '');
  const [chavePix, setChavePix] = useState(tenant.chavePixPadrao || '');
  const [corPrimaria, setCorPrimaria] = useState(tenant.corPrimaria || '#1b5e20');
  const [modalidades, setModalidades] = useState<('campo' | 'futsal')[]>(tenant.modalidadesAtivas || ['campo', 'futsal']);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Institution Modal (Master Only)
  const [openNewInstDialog, setOpenNewInstDialog] = useState(false);
  const [newInstNome, setNewInstNome] = useState('');
  const [newInstCnpj, setNewInstCnpj] = useState('');
  const [newInstEmail, setNewInstEmail] = useState('');
  const [newInstTelefone, setNewInstTelefone] = useState('');
  const [newInstCidade, setNewInstCidade] = useState('São Paulo');
  const [newInstEstado, setNewInstEstado] = useState('SP');
  const [newInstCor, setNewInstCor] = useState('#1b5e20');

  useEffect(() => {
    setNome(tenant.nome);
    setCnpj(tenant.cnpj || '');
    setEmail(tenant.email || '');
    setTelefone(tenant.telefone || '');
    setEndereco(tenant.endereco || '');
    setCidade(tenant.cidade || '');
    setEstado(tenant.estado || '');
    setChavePix(tenant.chavePixPadrao || '');
    setCorPrimaria(tenant.corPrimaria || '#1b5e20');
    setModalidades(tenant.modalidadesAtivas || ['campo', 'futsal']);
  }, [tenant]);

  const handleCreateNewInstitution = async () => {
    if (!newInstNome.trim() || !isMaster) return;
    await createTenant({
      nome: newInstNome.trim(),
      cnpj: newInstCnpj.trim(),
      email: newInstEmail.trim(),
      telefone: newInstTelefone.trim(),
      cidade: newInstCidade.trim(),
      estado: newInstEstado.trim(),
      corPrimaria: newInstCor,
      modalidadesAtivas: ['campo', 'futsal'],
      plano: 'pro',
    });
    setOpenNewInstDialog(false);
    setNewInstNome('');
    setNewInstCnpj('');
    setNewInstEmail('');
    setNewInstTelefone('');
  };

  // Filial Dialog
  const [openFilialDialog, setOpenFilialDialog] = useState(false);
  const [editingFilialId, setEditingFilialId] = useState<string | null>(null);
  const [filialNome, setFilialNome] = useState('');
  const [filialEndereco, setFilialEndereco] = useState('');
  const [filialTelefone, setFilialTelefone] = useState('');
  const [filialResp, setFilialResp] = useState('');

  const handleSaveTenant = async () => {
    await updateTenant({
      nome,
      cnpj,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      chavePixPadrao: chavePix,
      corPrimaria,
      modalidadesAtivas: modalidades,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleOpenFilial = (f?: Filial) => {
    if (f) {
      setEditingFilialId(f.id);
      setFilialNome(f.nome);
      setFilialEndereco(f.endereco);
      setFilialTelefone(f.telefone);
      setFilialResp(f.responsavelLocal || '');
    } else {
      setEditingFilialId(null);
      setFilialNome('');
      setFilialEndereco('');
      setFilialTelefone('(11) 9');
      setFilialResp('');
    }
    setOpenFilialDialog(true);
  };

  const handleSaveFilial = async () => {
    if (!filialNome.trim()) return;

    if (editingFilialId) {
      await updateFilial(editingFilialId, {
        nome: filialNome,
        endereco: filialEndereco,
        telefone: filialTelefone,
        responsavelLocal: filialResp,
      });
    } else {
      await addFilial({
        nome: filialNome,
        endereco: filialEndereco,
        telefone: filialTelefone,
        responsavelLocal: filialResp,
      });
    }
    setOpenFilialDialog(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {isMaster ? 'Gestão de Instituições & Filiais' : 'Cadastro da Instituição & Filiais'}
            </Typography>
            <Chip
              icon={isMaster ? <AdminPanelSettingsIcon sx={{ fontSize: '15px !important' }} /> : <LockIcon sx={{ fontSize: '14px !important' }} />}
              label={isMaster ? 'Visão Global Master' : 'Acesso Restrito à Sua Instituição'}
              size="small"
              sx={{
                bgcolor: isMaster ? '#fef08a' : '#dcfce7',
                color: isMaster ? '#854d0e' : '#166534',
                fontWeight: 700,
                fontSize: '0.72rem'
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            {isMaster
              ? 'Como usuário Master, você possui visão de todas as instituições cadastradas e pode criar novas instituições.'
              : `Gerencie os dados cadastrais e filiais exclusivamente da sua instituição vinculada (${tenant.nome}).`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {isMaster && (
            <Button
              id="btn-nova-instituicao-master"
              variant="outlined"
              color="primary"
              startIcon={<AddBusinessIcon />}
              onClick={() => setOpenNewInstDialog(true)}
            >
              Cadastrar Nova Instituição
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveTenant}
          >
            Salvar Alterações
          </Button>
        </Box>
      </Box>

      {/* Master-Only Overview of All Registered Institutions */}
      {isMaster && (
        <Card sx={{ borderRadius: 3.5, border: '1.5px solid #fde047', bgcolor: '#fefce8' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminPanelSettingsIcon sx={{ color: '#854d0e' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#713f12' }}>
                  Todas as Instituições Cadastradas ({allTenants.length}) — Visão Exclusiva Master
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#854d0e', fontWeight: 600 }}>
                Clique em uma instituição para visualizar ou editar seus dados isolados
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {allTenants.map((inst) => {
                const isSelected = inst.id === tenant.id;
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={inst.id}>
                    <Box
                      onClick={() => switchTenant(inst.id)}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: '#ffffff',
                        border: isSelected ? '2px solid #1b5e20' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {inst.nome}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                          CNPJ: {inst.cnpj || 'Não informado'} • {inst.cidade}/{inst.estado}
                        </Typography>
                      </Box>
                      {isSelected && <CheckCircleIcon color="success" />}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {savedSuccess && (
        <Alert severity="success" sx={{ borderRadius: 3 }}>
          Configurações da escola salvas com sucesso no banco de dados!
        </Alert>
      )}

      {/* Main Form Cards */}
      <Grid container spacing={3}>
        {/* Dados da Escolinha */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ borderRadius: 3.5 }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="primary" />
                Dados Institucionais da Escola
              </Typography>

              <TextField
                label="Nome Oficial da Escolinha / Clube"
                fullWidth
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="CNPJ"
                    fullWidth
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Telefone / WhatsApp Comercial"
                    fullWidth
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="E-mail de Contato"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Chave PIX Oficial (para mensalidades)"
                    fullWidth
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                    helperText="Chave utilizada para gerar o QR Code e Copia e Cola aos pais"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    label="Endereço Principal"
                    fullWidth
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label="Cidade"
                    fullWidth
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label="UF"
                    fullWidth
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                  />
                </Grid>
              </Grid>

              {/* Modalidades & Cores */}
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  ⚽ Modalidades e Identidade Visual
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Modalidades Praticadas</InputLabel>
                      <Select
                        multiple
                        value={modalidades}
                        label="Modalidades Praticadas"
                        onChange={(e) => setModalidades(typeof e.target.value === 'string' ? [e.target.value as any] : e.target.value)}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        <MenuItem value="campo">🌱 Futebol de Campo</MenuItem>
                        <MenuItem value="futsal">⚡ Futsal</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Cor Primária do Clube</InputLabel>
                      <Select
                        value={corPrimaria}
                        label="Cor Primária do Clube"
                        onChange={(e) => setCorPrimaria(e.target.value)}
                      >
                        <MenuItem value="#1b5e20">Verde Gramado (#1b5e20)</MenuItem>
                        <MenuItem value="#0284c7">Azul Celeste (#0284c7)</MenuItem>
                        <MenuItem value="#dc2626">Vermelho Rubro (#dc2626)</MenuItem>
                        <MenuItem value="#0f172a">Preto Nobre (#0f172a)</MenuItem>
                        <MenuItem value="#7c3aed">Roxo / Violeta (#7c3aed)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Filiais / Unidades */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ borderRadius: 3.5, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Filiais & Unidades ({filiais.length})
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddLocationAltIcon />}
                  onClick={() => handleOpenFilial()}
                >
                  Nova Filial
                </Button>
              </Box>

              <Stack spacing={2}>
                {filiais.map((f) => (
                  <Box key={f.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {f.nome}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.3 }}>
                          📍 {f.endereco}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5 }}>
                          📞 {f.telefone} • Coord: {f.responsavelLocal || 'Coordenação'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleOpenFilial(f)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteFilial(f.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filial Modal */}
      <Dialog
        open={openFilialDialog}
        onClose={() => setOpenFilialDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingFilialId ? '✏️ Editar Filial' : '📍 Cadastrar Nova Filial / Polo'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Nome da Unidade / Filial"
            fullWidth
            required
            placeholder="Ex: Unidade Centro - Arena Society, Unidade Zona Norte"
            value={filialNome}
            onChange={(e) => setFilialNome(e.target.value)}
          />

          <TextField
            label="Endereço Completo"
            fullWidth
            required
            placeholder="Rua, Número, Bairro, Cidade - UF"
            value={filialEndereco}
            onChange={(e) => setFilialEndereco(e.target.value)}
          />

          <TextField
            label="Telefone da Unidade"
            fullWidth
            value={filialTelefone}
            onChange={(e) => setFilialTelefone(e.target.value)}
          />

          <TextField
            label="Responsável Local / Coordenador"
            fullWidth
            placeholder="Ex: Prof. Carlos Silva"
            value={filialResp}
            onChange={(e) => setFilialResp(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenFilialDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveFilial}>
            Salvar Filial
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Institution Modal (Master Only) */}
      {isMaster && (
        <Dialog
          open={openNewInstDialog}
          onClose={() => setOpenNewInstDialog(false)}
          maxWidth="sm"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>
            🏛️ Cadastrar Nova Instituição (Master)
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              A instituição cadastrada ficará disponível para vínculo de usuários e login isolado.
            </Typography>
            <TextField
              label="Nome da Instituição"
              fullWidth
              required
              placeholder="Ex: Academia Gol de Placa"
              value={newInstNome}
              onChange={(e) => setNewInstNome(e.target.value)}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="CNPJ"
                  fullWidth
                  placeholder="00.000.000/0001-00"
                  value={newInstCnpj}
                  onChange={(e) => setNewInstCnpj(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Telefone Comercial"
                  fullWidth
                  placeholder="(11) 99999-9999"
                  value={newInstTelefone}
                  onChange={(e) => setNewInstTelefone(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="E-mail Institucional"
                  fullWidth
                  value={newInstEmail}
                  onChange={(e) => setNewInstEmail(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Cidade"
                  fullWidth
                  value={newInstCidade}
                  onChange={(e) => setNewInstCidade(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField
                  label="UF"
                  fullWidth
                  value={newInstEstado}
                  onChange={(e) => setNewInstEstado(e.target.value)}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth>
              <InputLabel>Cor Primária da Instituição</InputLabel>
              <Select
                value={newInstCor}
                label="Cor Primária da Instituição"
                onChange={(e) => setNewInstCor(e.target.value)}
              >
                <MenuItem value="#1b5e20">Verde Gramado (#1b5e20)</MenuItem>
                <MenuItem value="#0284c7">Azul Celeste (#0284c7)</MenuItem>
                <MenuItem value="#dc2626">Vermelho Rubro (#dc2626)</MenuItem>
                <MenuItem value="#0f172a">Preto Nobre (#0f172a)</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenNewInstDialog(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={!newInstNome.trim()}
              onClick={handleCreateNewInstitution}
            >
              Criar Instituição
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};
