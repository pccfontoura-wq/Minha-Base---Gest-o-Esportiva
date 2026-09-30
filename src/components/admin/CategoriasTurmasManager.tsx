import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  FormControl, InputLabel, Select, MenuItem, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Tooltip, Stack, Tabs, Tab 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '../../context/AuthContext';
import { Categoria, Turma } from '../../types';

export const CategoriasTurmasManager: React.FC = () => {
  const { 
    categorias, turmas, filiais, alunos, 
    addCategoria, updateCategoria, deleteCategoria, 
    addTurma, updateTurma, deleteTurma 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'turmas' | 'categorias'>('turmas');

  // Dialog States
  const [openTurmaDialog, setOpenTurmaDialog] = useState(false);
  const [editingTurmaId, setEditingTurmaId] = useState<string | null>(null);
  const [turmaNome, setTurmaNome] = useState('');
  const [turmaCategoriaId, setTurmaCategoriaId] = useState('');
  const [turmaFilialId, setTurmaFilialId] = useState('');
  const [turmaModalidade, setTurmaModalidade] = useState<'campo' | 'futsal'>('campo');
  const [turmaVagas, setTurmaVagas] = useState<number>(20);
  const [turmaDias, setTurmaDias] = useState<string>('Seg/Qua');
  const [turmaHoraInicio, setTurmaHoraInicio] = useState('14:00');
  const [turmaHoraFim, setTurmaHoraFim] = useState('15:30');

  // Category Dialog States
  const [openCatDialog, setOpenCatDialog] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catNome, setCatNome] = useState('');
  const [catIdadeMin, setCatIdadeMin] = useState<number>(10);
  const [catIdadeMax, setCatIdadeMax] = useState<number>(11);
  const [catModalidade, setCatModalidade] = useState<'campo' | 'futsal' | 'ambas'>('ambas');
  const [catDesc, setCatDesc] = useState('');

  // Handle Turma Actions
  const handleOpenTurmaModal = (turma?: Turma) => {
    if (turma) {
      setEditingTurmaId(turma.id);
      setTurmaNome(turma.nome);
      setTurmaCategoriaId(turma.categoriaId);
      setTurmaFilialId(turma.filialId);
      setTurmaModalidade(turma.modalidade);
      setTurmaVagas(turma.vagasMaximas);
      setTurmaDias(turma.diasHorarios[0]?.diaSemana || 'Seg/Qua');
      setTurmaHoraInicio(turma.diasHorarios[0]?.horaInicio || '14:00');
      setTurmaHoraFim(turma.diasHorarios[0]?.horaFim || '15:30');
    } else {
      setEditingTurmaId(null);
      setTurmaNome('');
      setTurmaCategoriaId(categorias[0]?.id || '');
      setTurmaFilialId(filiais[0]?.id || '');
      setTurmaModalidade('campo');
      setTurmaVagas(20);
      setTurmaDias('Seg/Qua');
      setTurmaHoraInicio('14:00');
      setTurmaHoraFim('15:30');
    }
    setOpenTurmaDialog(true);
  };

  const handleSaveTurma = async () => {
    if (!turmaNome.trim()) return;

    const diasHorarios = [
      {
        diaSemana: turmaDias,
        horaInicio: turmaHoraInicio,
        horaFim: turmaHoraFim,
      }
    ];

    if (editingTurmaId) {
      await updateTurma(editingTurmaId, {
        nome: turmaNome,
        categoriaId: turmaCategoriaId,
        filialId: turmaFilialId,
        modalidade: turmaModalidade,
        vagasMaximas: Number(turmaVagas),
        diasHorarios,
      });
    } else {
      await addTurma({
        nome: turmaNome,
        categoriaId: turmaCategoriaId,
        filialId: turmaFilialId,
        modalidade: turmaModalidade,
        vagasMaximas: Number(turmaVagas),
        diasHorarios,
        treinadorId: 'default-coach',
        ativo: true,
      });
    }
    setOpenTurmaDialog(false);
  };

  // Handle Category Actions
  const handleOpenCatModal = (cat?: Categoria) => {
    if (cat) {
      setEditingCatId(cat.id);
      setCatNome(cat.nome);
      setCatIdadeMin(cat.faixaEtariaMin);
      setCatIdadeMax(cat.faixaEtariaMax);
      setCatModalidade(cat.modalidade);
      setCatDesc(cat.descricao || '');
    } else {
      setEditingCatId(null);
      setCatNome('');
      setCatIdadeMin(8);
      setCatIdadeMax(9);
      setCatModalidade('ambas');
      setCatDesc('');
    }
    setOpenCatDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!catNome.trim()) return;

    if (editingCatId) {
      await updateCategoria(editingCatId, {
        nome: catNome,
        faixaEtariaMin: Number(catIdadeMin),
        faixaEtariaMax: Number(catIdadeMax),
        modalidade: catModalidade,
        descricao: catDesc,
      });
    } else {
      await addCategoria({
        nome: catNome,
        faixaEtariaMin: Number(catIdadeMin),
        faixaEtariaMax: Number(catIdadeMax),
        modalidade: catModalidade,
        descricao: catDesc,
      });
    }
    setOpenCatDialog(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Categorias & Turmas
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Estrutura de faixas etárias (Sub-7 a Sub-17), horários e turmas de Campo & Futsal.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {activeTab === 'turmas' ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenTurmaModal()}
            >
              Criar Nova Turma
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCatModal()}
            >
              Criar Nova Categoria
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab value="turmas" label={`Turmas Ativas (${turmas.length})`} sx={{ fontWeight: 700 }} />
          <Tab value="categorias" label={`Faixas Etárias / Categorias (${categorias.length})`} sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {/* Turmas Tab Content */}
      {activeTab === 'turmas' && (
        <Grid container spacing={3}>
          {turmas.map((turma) => {
            const alunosDaTurma = alunos.filter(a => a.turmaId === turma.id);
            const categoria = categorias.find(c => c.id === turma.categoriaId);
            const filial = filiais.find(f => f.id === turma.filialId);

            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={turma.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3.5 }}>
                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Chip
                        label={turma.modalidade === 'campo' ? '🌱 Futebol de Campo' : '⚡ Futsal'}
                        size="small"
                        sx={{
                          bgcolor: turma.modalidade === 'campo' ? '#dcfce7' : '#e0f2fe',
                          color: turma.modalidade === 'campo' ? '#15803d' : '#0369a1',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                      <Box>
                        <IconButton size="small" onClick={() => handleOpenTurmaModal(turma)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteTurma(turma.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                      {turma.nome}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                      Categoria: <strong>{categoria?.nome || 'Geral'}</strong>
                    </Typography>

                    <Stack spacing={1.2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ color: '#64748b' }} />
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                          {turma.diasHorarios.map(d => `${d.diaSemana} • ${d.horaInicio} às ${d.horaFim}`).join(', ')}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" sx={{ color: '#64748b' }} />
                        <Typography variant="body2" sx={{ color: '#334155' }}>
                          {filial?.nome || 'Unidade Principal'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon fontSize="small" sx={{ color: '#64748b' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1b5e20' }}>
                          {alunosDaTurma.length} / {turma.vagasMaximas} atletas matriculados
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Categorias Tab Content */}
      {activeTab === 'categorias' && (
        <TableContainer component={Card} sx={{ borderRadius: 3.5 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Categoria</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Faixa Etária</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Modalidade</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Descrição Pedagógica</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias.map((cat) => (
                <TableRow key={cat.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {cat.nome}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${cat.faixaEtariaMin} a ${cat.faixaEtariaMax} anos`}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cat.modalidade === 'campo' ? '🌱 Campo' : cat.modalidade === 'futsal' ? '⚡ Futsal' : '🌱 Campo & ⚡ Futsal'}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#64748b' }}>
                    {cat.descricao || 'Formação técnica de base'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenCatModal(cat)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteCategoria(cat.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal: Turma Form */}
      <Dialog
        open={openTurmaDialog}
        onClose={() => setOpenTurmaDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingTurmaId ? '✏️ Editar Turma' : '⚽ Criar Nova Turma'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Nome da Turma"
            fullWidth
            required
            placeholder="Ex: Sub-11 Campo Ter/Qui Tarde"
            value={turmaNome}
            onChange={(e) => setTurmaNome(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel>Modalidade</InputLabel>
            <Select
              value={turmaModalidade}
              label="Modalidade"
              onChange={(e) => setTurmaModalidade(e.target.value as any)}
            >
              <MenuItem value="campo">🌱 Futebol de Campo</MenuItem>
              <MenuItem value="futsal">⚡ Futsal</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Categoria / Faixa Etária</InputLabel>
            <Select
              value={turmaCategoriaId}
              label="Categoria / Faixa Etária"
              onChange={(e) => setTurmaCategoriaId(e.target.value)}
            >
              {categorias.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nome} ({c.faixaEtariaMin}-{c.faixaEtariaMax} anos)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Filial / Unidade</InputLabel>
            <Select
              value={turmaFilialId}
              label="Filial / Unidade"
              onChange={(e) => setTurmaFilialId(e.target.value)}
            >
              {filiais.map(f => (
                <MenuItem key={f.id} value={f.id}>
                  {f.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Dias da Semana"
                placeholder="Ex: Seg/Qua ou Ter/Qui/Sáb"
                value={turmaDias}
                onChange={(e) => setTurmaDias(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Vagas Máximas"
                type="number"
                value={turmaVagas}
                onChange={(e) => setTurmaVagas(Number(e.target.value))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Horário de Início"
                type="time"
                value={turmaHoraInicio}
                onChange={(e) => setTurmaHoraInicio(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Horário de Término"
                type="time"
                value={turmaHoraFim}
                onChange={(e) => setTurmaHoraFim(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenTurmaDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveTurma}>
            Salvar Turma
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Categoria Form */}
      <Dialog
        open={openCatDialog}
        onClose={() => setOpenCatDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingCatId ? '✏️ Editar Categoria' : '🏆 Nova Categoria'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Nome da Categoria"
            fullWidth
            required
            placeholder="Ex: Sub-9, Sub-11, Sub-13, Sub-15"
            value={catNome}
            onChange={(e) => setCatNome(e.target.value)}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Idade Mínima"
                type="number"
                value={catIdadeMin}
                onChange={(e) => setCatIdadeMin(Number(e.target.value))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Idade Máxima"
                type="number"
                value={catIdadeMax}
                onChange={(e) => setCatIdadeMax(Number(e.target.value))}
                fullWidth
              />
            </Grid>
          </Grid>

          <FormControl fullWidth>
            <InputLabel>Modalidade Aplicável</InputLabel>
            <Select
              value={catModalidade}
              label="Modalidade Aplicável"
              onChange={(e) => setCatModalidade(e.target.value as any)}
            >
              <MenuItem value="ambas">🌱 Campo & ⚡ Futsal (Ambos)</MenuItem>
              <MenuItem value="campo">🌱 Futebol de Campo Apenas</MenuItem>
              <MenuItem value="futsal">⚡ Futsal Apenas</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Diretriz Pedagógica da Categoria"
            fullWidth
            multiline
            rows={2}
            placeholder="Ex: Foco em coordenação motora, domínio com as duas pernas e ludicidade"
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenCatDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveCategory}>
            Salvar Categoria
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
