import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  FormControl, InputLabel, Select, MenuItem, IconButton, 
  Tooltip, Stack, Avatar 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useAuth } from '../../context/AuthContext';
import { TTSPlayer } from '../common/TTSPlayer';

export const ComunicadosManager: React.FC = () => {
  const { comunicados, turmas, filiais, addComunicado, deleteComunicado, user } = useAuth();

  const [openModal, setOpenModal] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [destinatarioTipo, setDestinatarioTipo] = useState<'todos' | 'turma' | 'filial'>('todos');
  const [destTurmaId, setDestTurmaId] = useState('');
  const [destFilialId, setDestFilialId] = useState('');
  const [urgencia, setUrgencia] = useState<'normal' | 'alta' | 'urgente'>('normal');

  const handleSendComunicado = async () => {
    if (!titulo.trim() || !mensagem.trim()) return;

    await addComunicado({
      titulo,
      mensagem,
      dataEnvio: new Date().toISOString(),
      autor: user.nome || 'Coordenação Técnica',
      urgencia,
      destinatarios: {
        tipo: destinatarioTipo,
        turmaId: destinatarioTipo === 'turma' ? destTurmaId : undefined,
        filialId: destinatarioTipo === 'filial' ? destFilialId : undefined,
      },
    });

    setOpenModal(false);
    setTitulo('');
    setMensagem('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Mural de Comunicados & Notificações
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Envie avisos gerais para toda a escola, por turma ou por filial com leitura em áudio por voz.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setDestTurmaId(turmas[0]?.id || '');
            setDestFilialId(filiais[0]?.id || '');
            setOpenModal(true);
          }}
        >
          Publicar Novo Comunicado
        </Button>
      </Box>

      {/* Announcements Stream */}
      <Stack spacing={2.5}>
        {comunicados.map((com) => {
          const turmaDest = turmas.find(t => t.id === com.destinatarios?.turmaId);
          const filialDest = filiais.find(f => f.id === com.destinatarios?.filialId);

          return (
            <Card key={com.id} sx={{ borderRadius: 3.5, borderLeft: com.urgencia === 'alta' ? '5px solid #f59e0b' : com.urgencia === 'urgente' ? '5px solid #dc2626' : '5px solid #1b5e20' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {com.titulo}
                    </Typography>

                    {com.urgencia === 'alta' && (
                      <Chip label="Destaque / Alta Prioridade" size="small" color="warning" sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }} />
                    )}
                    {com.urgencia === 'urgente' && (
                      <Chip label="Urgente" size="small" color="error" sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }} />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TTSPlayer text={`${com.titulo}. ${com.mensagem}`} title={com.titulo} variant="chip" />
                    {user.papel === 'admin' && (
                      <Tooltip title="Excluir Comunicado">
                        <IconButton size="small" color="error" onClick={() => deleteComunicado(com.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ color: '#334155', my: 2, lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {com.mensagem}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#1b5e20', fontSize: '0.75rem' }}>
                      {com.autor?.charAt(0) || 'C'}
                    </Avatar>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Enviado por: {com.autor} • {new Date(com.dataEnvio).toLocaleDateString('pt-BR')} às {new Date(com.dataEnvio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Destinatários:
                    </Typography>
                    {com.destinatarios?.tipo === 'todos' && (
                      <Chip icon={<GroupIcon />} label="Toda a Escolinha" size="small" sx={{ fontWeight: 600, height: 22, fontSize: '0.7rem' }} />
                    )}
                    {com.destinatarios?.tipo === 'turma' && (
                      <Chip label={`Turma: ${turmaDest?.nome || 'Específica'}`} size="small" color="primary" sx={{ fontWeight: 600, height: 22, fontSize: '0.7rem' }} />
                    )}
                    {com.destinatarios?.tipo === 'filial' && (
                      <Chip icon={<LocationOnIcon />} label={`Filial: ${filialDest?.nome || 'Específica'}`} size="small" color="secondary" sx={{ fontWeight: 600, height: 22, fontSize: '0.7rem' }} />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* New Comunicado Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          📢 Publicar Novo Comunicado
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Título do Comunicado"
            fullWidth
            required
            placeholder="Ex: Torneio de Fim de Semana, Lembrete de Uniforme"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <TextField
            label="Conteúdo da Mensagem"
            fullWidth
            required
            multiline
            rows={4}
            placeholder="Digite o texto detalhado do comunicado para os pais e atletas..."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Destinatários</InputLabel>
                <Select
                  value={destinatarioTipo}
                  label="Destinatários"
                  onChange={(e) => setDestinatarioTipo(e.target.value as any)}
                >
                  <MenuItem value="todos">Toda a Escolinha (Geral)</MenuItem>
                  <MenuItem value="turma">Turma Específica</MenuItem>
                  <MenuItem value="filial">Filial / Unidade Específica</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Nível de Urgência</InputLabel>
                <Select
                  value={urgencia}
                  label="Nível de Urgência"
                  onChange={(e) => setUrgencia(e.target.value as any)}
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="alta">Alta / Destaque</MenuItem>
                  <MenuItem value="urgente">Urgente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {destinatarioTipo === 'turma' && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Selecione a Turma Alvo</InputLabel>
                  <Select
                    value={destTurmaId}
                    label="Selecione a Turma Alvo"
                    onChange={(e) => setDestTurmaId(e.target.value)}
                  >
                    {turmas.map(t => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {destinatarioTipo === 'filial' && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Selecione a Filial Alvo</InputLabel>
                  <Select
                    value={destFilialId}
                    label="Selecione a Filial Alvo"
                    onChange={(e) => setDestFilialId(e.target.value)}
                  >
                    {filiais.map(f => (
                      <MenuItem key={f.id} value={f.id}>
                        {f.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleSendComunicado}>
            Disparar Comunicado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
