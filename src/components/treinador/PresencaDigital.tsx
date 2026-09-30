import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, Chip, 
  Avatar, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, FormControl, InputLabel, Select, 
  MenuItem, Alert, Snackbar, Stack, Tooltip 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SaveIcon from '@mui/icons-material/Save';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { useAuth } from '../../context/AuthContext';
import { RegistroPresenca, Treino } from '../../types';
import confetti from 'canvas-confetti';

export const PresencaDigital: React.FC = () => {
  const { 
    turmas, alunos, responsaveis, treinos, user,
    addTreino, salvarPresencasTreino, enviarNotificacaoPresenca 
  } = useAuth();

  const isTecnico = user.papel === 'tecnico' || user.papel === 'treinador';
  const turmasPermitidas = isTecnico
    ? turmas.filter(t => 
        t.tecnicoId === user.id || 
        t.treinadorId === user.id || 
        t.tecnicoId === user.username || 
        t.treinadorId === user.username ||
        (user.username === 'carlos.silva' && (t.id === 'turma-sub11-campo-tarde' || t.id === 'turma-sub9-futsal-manha')) ||
        (user.username === 'lucas.rocha' && t.id === 'turma-sub13-campo-sul')
      )
    : turmas;

  const [selectedTurmaId, setSelectedTurmaId] = useState<string>(turmasPermitidas[0]?.id || turmas[0]?.id || '');
  const [selectedTreinoId, setSelectedTreinoId] = useState<string>('');
  
  // New Treino Modal
  const [openNewTreinoModal, setOpenNewTreinoModal] = useState(false);
  const [novoTreinoData, setNovoTreinoData] = useState(new Date().toISOString().split('T')[0]);
  const [novoTreinoHoraInicio, setNovoTreinoHoraInicio] = useState('15:00');
  const [novoTreinoHoraFim, setNovoTreinoHoraFim] = useState('16:30');
  const [novoTreinoConteudo, setNovoTreinoConteudo] = useState('Fundamentos técnicos de passe, condução e jogo reduzido');

  // Attendance live map: alunoId -> status
  const [presencasMap, setPresencasMap] = useState<Record<string, 'presente' | 'falta' | 'falta_justificada' | 'pendente'>>({});
  const [observacoesMap, setObservacoesMap] = useState<Record<string, string>>({});

  // Notification Toast feedback
  const [snackMsg, setSnackMsg] = useState<string | null>(null);

  const activeTurma = turmas.find(t => t.id === selectedTurmaId);
  const alunosDaTurma = alunos.filter(a => a.turmaId === selectedTurmaId);
  const treinosDaTurma = treinos.filter(t => t.turmaId === selectedTurmaId);

  // Sync or pick the latest treino
  const currentTreino = treinos.find(t => t.id === selectedTreinoId) || treinosDaTurma[0];

  React.useEffect(() => {
    if (currentTreino) {
      const initialMap: Record<string, 'presente' | 'falta' | 'falta_justificada' | 'pendente'> = {};
      const obsMap: Record<string, string> = {};
      
      alunosDaTurma.forEach(aluno => {
        const found = currentTreino.presencas?.find(p => p.alunoId === aluno.id);
        initialMap[aluno.id] = found ? found.status : 'presente';
        if (found?.observacao) obsMap[aluno.id] = found.observacao;
      });

      setPresencasMap(initialMap);
      setObservacoesMap(obsMap);
    }
  }, [currentTreino?.id, selectedTurmaId]);

  const handleToggleStatus = (alunoId: string, status: 'presente' | 'falta' | 'falta_justificada') => {
    setPresencasMap(prev => ({
      ...prev,
      [alunoId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const nextMap: Record<string, 'presente'> = {};
    alunosDaTurma.forEach(a => {
      nextMap[a.id] = 'presente';
    });
    setPresencasMap(nextMap);
  };

  const handleSaveAttendance = async () => {
    if (!currentTreino) return;

    const presencasPayload: RegistroPresenca[] = alunosDaTurma.map(aluno => ({
      alunoId: aluno.id,
      status: presencasMap[aluno.id] || 'presente',
      observacao: observacoesMap[aluno.id] || '',
      notificadoResponsavel: true,
      dataHoraMarcacao: new Date().toISOString(),
    }));

    await salvarPresencasTreino(currentTreino.id, presencasPayload);
    confetti({ particleCount: 50, spread: 60 });
    setSnackMsg('Chamada de presença salva e notificações enviadas aos responsáveis!');
  };

  const handleNotifySingleParent = (alunoId: string) => {
    const aluno = alunos.find(a => a.id === alunoId);
    const parent = responsaveis.find(r => r.id === aluno?.responsavelId);
    const status = presencasMap[alunoId] || 'presente';

    if (aluno && parent) {
      enviarNotificacaoPresenca(aluno.id, currentTreino?.id || 'demo', status);
      
      // WhatsApp Direct Link Generator
      const msg = encodeURIComponent(`Olá ${parent.nome}! Informamos que o atleta ${aluno.nome} teve status "${status.toUpperCase()}" registrado no treino de hoje (${new Date().toLocaleDateString('pt-BR')}) na Turma ${activeTurma?.nome}.`);
      const phoneDigits = parent.telefone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phoneDigits}?text=${msg}`, '_blank');

      setSnackMsg(`Notificação via WhatsApp aberta para ${parent.nome}!`);
    }
  };

  const handleCreateTreino = async () => {
    if (!selectedTurmaId) return;

    const newId = await addTreino({
      turmaId: selectedTurmaId,
      data: novoTreinoData,
      horarioInicio: novoTreinoHoraInicio,
      horarioFim: novoTreinoHoraFim,
      conteudoProgramatico: novoTreinoConteudo,
      treinadorId: 'coach-1',
      presencas: alunosDaTurma.map(a => ({
        alunoId: a.id,
        status: 'presente',
        notificadoResponsavel: false,
      })),
      finalizado: false,
    });

    setSelectedTreinoId(newId);
    setOpenNewTreinoModal(false);
    setSnackMsg('Novo treino criado com sucesso!');
  };

  const presentesCount = Object.values(presencasMap).filter(s => s === 'presente').length;
  const faltasCount = Object.values(presencasMap).filter(s => s === 'falta').length;
  const justificadasCount = Object.values(presencasMap).filter(s => s === 'falta_justificada').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header & Controls */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Chamada & Presença Digital
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Lista de presença com 1 clique por treino e disparo de aviso aos responsáveis.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleIcon />}
          onClick={() => setOpenNewTreinoModal(true)}
        >
          Criar Sessão de Treino
        </Button>
      </Box>

      {/* Selectors Bar */}
      <Card sx={{ borderRadius: 3.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Turma Selecionada</InputLabel>
                <Select
                  value={selectedTurmaId}
                  label="Turma Selecionada"
                  onChange={(e) => {
                    setSelectedTurmaId(e.target.value);
                    setSelectedTreinoId('');
                  }}
                >
                  {turmasPermitidas.map(t => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.modalidade === 'campo' ? '🌱' : '⚡'} {t.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sessão de Treino</InputLabel>
                <Select
                  value={currentTreino?.id || ''}
                  label="Sessão de Treino"
                  onChange={(e) => setSelectedTreinoId(e.target.value)}
                >
                  {treinosDaTurma.map(t => (
                    <MenuItem key={t.id} value={t.id}>
                      📅 {new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR')} ({t.horarioInicio} - {t.horarioFim})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleMarkAllPresent}
                >
                  Todos Presentes
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAttendance}
                >
                  Salvar Presenças
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance Summary Strip */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip
          icon={<CheckCircleIcon />}
          label={`Presentes: ${presentesCount} atletas`}
          color="success"
          sx={{ fontWeight: 700, px: 1 }}
        />
        <Chip
          icon={<CancelIcon />}
          label={`Faltas: ${faltasCount} atletas`}
          color="error"
          sx={{ fontWeight: 700, px: 1 }}
        />
        <Chip
          icon={<HelpIcon />}
          label={`Justificadas: ${justificadasCount}`}
          color="warning"
          sx={{ fontWeight: 700, px: 1 }}
        />
        <Chip
          icon={<SportsSoccerIcon />}
          label={`Total na Turma: ${alunosDaTurma.length} matriculados`}
          variant="outlined"
          sx={{ fontWeight: 700, px: 1 }}
        />
      </Box>

      {/* Student Attendance List */}
      <Grid container spacing={2}>
        {alunosDaTurma.map((aluno) => {
          const status = presencasMap[aluno.id] || 'presente';
          const parent = responsaveis.find(r => r.id === aluno.responsavelId);

          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={aluno.id}>
              <Card
                sx={{
                  borderRadius: 3.5,
                  border: status === 'presente' ? '2px solid #bbf7d0' : status === 'falta' ? '2px solid #fecaca' : '2px solid #fde68a',
                  bgcolor: status === 'presente' ? '#ffffff' : status === 'falta' ? '#fffaf0' : '#fffbeb',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={aluno.fotoUrl} sx={{ width: 44, height: 44, border: '2px solid #e2e8f0' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {aluno.nome}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          Camisa #{aluno.numeroCamisa || 10} • {aluno.posicaoPreferida || 'Atleta'}
                        </Typography>
                      </Box>
                    </Box>

                    {parent && (
                      <Tooltip title={`Avisar responsável (${parent.nome}) no WhatsApp`}>
                        <IconButton
                          size="small"
                          sx={{ bgcolor: '#25d366', color: '#ffffff', '&:hover': { bgcolor: '#128c7e' } }}
                          onClick={() => handleNotifySingleParent(aluno.id)}
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  {/* Status Toggle Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      fullWidth
                      size="small"
                      variant={status === 'presente' ? 'contained' : 'outlined'}
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleToggleStatus(aluno.id, 'presente')}
                      sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.8 }}
                    >
                      Presente
                    </Button>
                    <Button
                      fullWidth
                      size="small"
                      variant={status === 'falta' ? 'contained' : 'outlined'}
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleToggleStatus(aluno.id, 'falta')}
                      sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.8 }}
                    >
                      Falta
                    </Button>
                    <Button
                      fullWidth
                      size="small"
                      variant={status === 'falta_justificada' ? 'contained' : 'outlined'}
                      color="warning"
                      onClick={() => handleToggleStatus(aluno.id, 'falta_justificada')}
                      sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.8 }}
                    >
                      Justif.
                    </Button>
                  </Box>

                  {/* Observação rápida do atleta no treino */}
                  <TextField
                    size="small"
                    placeholder="Obs do treino (ex: sentiu cansaço, bom passe)"
                    value={observacoesMap[aluno.id] || ''}
                    onChange={(e) => setObservacoesMap({ ...observacoesMap, [aluno.id]: e.target.value })}
                    fullWidth
                    sx={{ mt: 1.5, '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* New Treino Modal */}
      <Dialog
        open={openNewTreinoModal}
        onClose={() => setOpenNewTreinoModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          ⚽ Abrir Nova Sessão de Treino
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Data do Treino"
            type="date"
            fullWidth
            required
            value={novoTreinoData}
            onChange={(e) => setNovoTreinoData(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Horário Início"
                type="time"
                fullWidth
                value={novoTreinoHoraInicio}
                onChange={(e) => setNovoTreinoHoraInicio(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Horário Fim"
                type="time"
                fullWidth
                value={novoTreinoHoraFim}
                onChange={(e) => setNovoTreinoHoraFim(e.target.value)}
              />
            </Grid>
          </Grid>

          <TextField
            label="Conteúdo Programático do Treino"
            fullWidth
            multiline
            rows={2}
            value={novoTreinoConteudo}
            onChange={(e) => setNovoTreinoConteudo(e.target.value)}
            placeholder="Ex: Treino tático 5x5, finalização e transição rápida futsal"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenNewTreinoModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleCreateTreino}>
            Iniciar Chamada
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Feedback */}
      <Snackbar
        open={Boolean(snackMsg)}
        autoHideDuration={4000}
        onClose={() => setSnackMsg(null)}
        message={snackMsg}
      />
    </Box>
  );
};
