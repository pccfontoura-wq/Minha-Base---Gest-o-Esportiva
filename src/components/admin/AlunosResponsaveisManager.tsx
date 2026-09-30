import React, { useState, useRef } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  FormControl, InputLabel, Select, MenuItem, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Avatar, Tooltip, InputAdornment, Stack, Tabs, Tab 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../../context/AuthContext';
import { Aluno, Responsavel } from '../../types';

export const AlunosResponsaveisManager: React.FC = () => {
  const { 
    alunos, responsaveis, turmas, filiais, 
    addAluno, updateAluno, deleteAluno, addResponsavel, 
    deleteResponsavel 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'alunos' | 'responsaveis'>('alunos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTurma, setFiltroTurma] = useState<string>('todas');

  // New Student Dialog
  const [openAlunoDialog, setOpenAlunoDialog] = useState(false);
  const [editingAlunoId, setEditingAlunoId] = useState<string | null>(null);
  
  // Student Form State
  const [nomeAluno, setNomeAluno] = useState('');
  const [dataNasc, setDataNasc] = useState('2015-05-10');
  const [fotoUrl, setFotoUrl] = useState('');
  const [documentoIdentidade, setDocumentoIdentidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefoneContato, setTelefoneContato] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [filialId, setFilialId] = useState('');
  const [posicao, setPosicao] = useState('Meia-Armador');
  const [peDominante, setPeDominante] = useState<'Destro' | 'Canhoto' | 'Ambidestro'>('Destro');
  const [numeroCamisa, setNumeroCamisa] = useState<number>(10);
  const [infoMedica, setInfoMedica] = useState('Atestado médico regular.');
  const [contatoEmergencia, setContatoEmergencia] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 280;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFotoUrl(compressedDataUrl);
        }
      };
      if (typeof ev.target?.result === 'string') {
        img.src = ev.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Parent linking state inside student form
  const [isNewParent, setIsNewParent] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [parentNome, setParentNome] = useState('');
  const [parentTelefone, setParentTelefone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentParentesco, setParentParentesco] = useState<'Pai' | 'Mãe' | 'Tutor Legal'>('Pai');

  // Matricula initial plan info
  const [planoNome, setPlanoNome] = useState('Plano Anual 2x por semana');
  const [valorMensalidade, setValorMensalidade] = useState(220);
  const [diaVencimento, setDiaVencimento] = useState(10);

  // Student Detail View Dialog
  const [selectedAlunoDetail, setSelectedAlunoDetail] = useState<Aluno | null>(null);

  const handleOpenAlunoModal = (aluno?: Aluno) => {
    if (aluno) {
      setEditingAlunoId(aluno.id);
      setNomeAluno(aluno.nome);
      setDataNasc(aluno.dataNascimento);
      setFotoUrl(aluno.fotoUrl || '');
      setDocumentoIdentidade(aluno.documentoIdentidade || '');
      setEndereco(aluno.endereco || '');
      setTelefoneContato(aluno.telefoneContato || aluno.contatoEmergencia || '');
      setTurmaId(aluno.turmaId);
      setFilialId(aluno.filialId);
      setPosicao(aluno.posicaoPreferida || '');
      setPeDominante(aluno.peDominante || 'Destro');
      setNumeroCamisa(aluno.numeroCamisa || 10);
      setInfoMedica(aluno.infoMedica || '');
      setContatoEmergencia(aluno.contatoEmergencia || aluno.telefoneContato || '');
      setSelectedParentId(aluno.responsavelId);
      setIsNewParent(false);
    } else {
      setEditingAlunoId(null);
      setNomeAluno('');
      setDataNasc('2015-06-15');
      setFotoUrl('https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80');
      setDocumentoIdentidade('');
      setEndereco('');
      setTelefoneContato('');
      setTurmaId(turmas[0]?.id || '');
      setFilialId(filiais[0]?.id || '');
      setPosicao('Atacante');
      setPeDominante('Destro');
      setNumeroCamisa(9);
      setInfoMedica('Sem restrições médicas registradas.');
      setContatoEmergencia('');
      setSelectedParentId(responsaveis[0]?.id || '');
      setIsNewParent(false);
      setParentNome('');
      setParentTelefone('');
      setParentEmail('');
    }
    setOpenAlunoDialog(true);
  };

  const handleSaveAluno = async () => {
    if (!nomeAluno.trim()) return;

    let targetParentId = selectedParentId;

    if (isNewParent && parentNome.trim()) {
      targetParentId = await addResponsavel({
        nome: parentNome,
        telefone: parentTelefone || telefoneContato || '(11) 99999-9999',
        email: parentEmail || `${parentNome.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        parentesco: parentParentesco,
        endereco: endereco || undefined,
        alunosIds: []
      });
    }

    const selectedTurma = turmas.find(t => t.id === turmaId);

    if (editingAlunoId) {
      await updateAluno(editingAlunoId, {
        nome: nomeAluno,
        dataNascimento: dataNasc,
        fotoUrl,
        documentoIdentidade: documentoIdentidade.trim(),
        endereco: endereco.trim(),
        telefoneContato: telefoneContato.trim(),
        turmaId,
        filialId,
        categoriaId: selectedTurma?.categoriaId || '',
        modalidade: selectedTurma?.modalidade || 'campo',
        posicaoPreferida: posicao,
        peDominante,
        numeroCamisa: Number(numeroCamisa),
        infoMedica,
        contatoEmergencia: contatoEmergencia.trim() || telefoneContato.trim(),
        responsavelId: targetParentId,
      });
    } else {
      await addAluno({
        nome: nomeAluno,
        dataNascimento: dataNasc,
        fotoUrl: fotoUrl || 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
        documentoIdentidade: documentoIdentidade.trim(),
        endereco: endereco.trim(),
        telefoneContato: telefoneContato.trim(),
        responsavelId: targetParentId,
        filialId,
        turmaId,
        categoriaId: selectedTurma?.categoriaId || '',
        modalidade: selectedTurma?.modalidade || 'campo',
        posicaoPreferida: posicao,
        peDominante,
        numeroCamisa: Number(numeroCamisa),
        infoMedica,
        contatoEmergencia: contatoEmergencia.trim() || telefoneContato.trim(),
        status: 'ativo',
      }, {
        plano: planoNome,
        valor: Number(valorMensalidade),
        diaVencimento: Number(diaVencimento)
      });
    }

    setOpenAlunoDialog(false);
  };

  const filteredAlunos = alunos.filter(a => {
    const matchSearch = a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.posicaoPreferida?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTurma = filtroTurma === 'todas' || a.turmaId === filtroTurma;
    return matchSearch && matchTurma;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Alunos & Responsáveis
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Cadastro de atletas, vínculos com turmas de campo/futsal e ficha médica completa.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => handleOpenAlunoModal()}
        >
          Matricular Novo Aluno
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab value="alunos" label={`Atletas / Alunos (${alunos.length})`} sx={{ fontWeight: 700 }} />
          <Tab value="responsaveis" label={`Pais & Responsáveis (${responsaveis.length})`} sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {activeTab === 'alunos' && (
        <>
          {/* Filter Bar */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Buscar aluno por nome ou posição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ minWidth: 280, flexGrow: 1 }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Turma</InputLabel>
              <Select
                value={filtroTurma}
                label="Filtrar por Turma"
                onChange={(e) => setFiltroTurma(e.target.value)}
              >
                <MenuItem value="todas">Todas as Turmas</MenuItem>
                {turmas.map(t => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Alunos Table */}
          <TableContainer component={Card} sx={{ borderRadius: 3.5 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Atleta</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Turma & Modalidade</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Posição / Camisa</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Responsável Legal</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAlunos.map((aluno) => {
                  const turma = turmas.find(t => t.id === aluno.turmaId);
                  const parent = responsaveis.find(r => r.id === aluno.responsavelId);

                  return (
                    <TableRow key={aluno.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={aluno.fotoUrl} sx={{ width: 42, height: 42, border: '2px solid #e2e8f0' }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                              {aluno.nome}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                              Nasc: {new Date(aluno.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR')} • {aluno.peDominante}
                              {aluno.documentoIdentidade ? ` • Doc: ${aluno.documentoIdentidade}` : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={turma?.modalidade === 'campo' ? '🌱 Campo' : '⚡ Futsal'}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              bgcolor: turma?.modalidade === 'campo' ? '#dcfce7' : '#e0f2fe',
                              color: turma?.modalidade === 'campo' ? '#15803d' : '#0369a1',
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                            {turma?.nome || 'Turma não atribuída'}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          #{aluno.numeroCamisa || 10} • {aluno.posicaoPreferida || 'Atacante'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {parent?.nome || 'Não vinculado'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {parent?.telefone || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label="Ativo"
                          size="small"
                          color="success"
                          sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Ver Dossiê do Atleta">
                            <IconButton size="small" color="primary" onClick={() => setSelectedAlunoDetail(aluno)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar Aluno">
                            <IconButton size="small" onClick={() => handleOpenAlunoModal(aluno)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir Aluno">
                            <IconButton size="small" color="error" onClick={() => deleteAluno(aluno.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Responsaveis Tab */}
      {activeTab === 'responsaveis' && (
        <Grid container spacing={2.5}>
          {responsaveis.map((resp) => {
            const filhos = alunos.filter(a => resp.alunosIds?.includes(a.id) || a.responsavelId === resp.id);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={resp.id}>
                <Card sx={{ height: '100%', borderRadius: 3.5 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Chip
                          label={resp.parentesco || 'Responsável Legal'}
                          size="small"
                          sx={{ bgcolor: 'rgba(27, 94, 32, 0.1)', color: '#1b5e20', fontWeight: 700, mb: 0.5 }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {resp.nome}
                        </Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => deleteResponsavel(resp.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Stack spacing={1} sx={{ mt: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" sx={{ color: '#64748b', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: '#334155' }}>
                          {resp.telefone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" sx={{ color: '#64748b', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: '#334155' }}>
                          {resp.email}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8 }}>
                        Atletas Vinculados ({filhos.length}):
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {filhos.map(f => (
                          <Chip
                            key={f.id}
                            avatar={<Avatar src={f.fotoUrl} />}
                            label={f.nome}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modal Form: Cadastrar / Editar Aluno */}
      <Dialog
        open={openAlunoDialog}
        onClose={() => setOpenAlunoDialog(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingAlunoId ? '✏️ Editar Atleta' : '⚽ Matrícula de Novo Atleta'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1b5e20' }}>
            1. Foto de Identificação & Dados Pessoais do Atleta
          </Typography>

          {/* Photo Upload & Preview Box */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#f8fafc',
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 2.5,
            }}
          >
            <Avatar
              src={fotoUrl}
              sx={{
                width: 76,
                height: 76,
                border: '3px solid #1b5e20',
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                fontSize: '1.75rem',
                fontWeight: 800,
                bgcolor: '#1b5e20',
              }}
            >
              {nomeAluno ? nomeAluno.charAt(0).toUpperCase() : 'A'}
            </Avatar>

            <Box sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handlePhotoFileChange}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PhotoCameraIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                >
                  Enviar Foto do Dispositivo
                </Button>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  A foto aparecerá na ficha oficial, chamada digital e relatórios do atleta.
                </Typography>
              </Box>

              <TextField
                label="Ou informe a URL da Foto do Atleta"
                size="small"
                fullWidth
                placeholder="https://exemplo.com/foto-atleta.jpg"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
              />
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="Nome Completo do Atleta"
                fullWidth
                required
                value={nomeAluno}
                onChange={(e) => setNomeAluno(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Data de Nascimento"
                type="date"
                fullWidth
                required
                value={dataNasc}
                onChange={(e) => setDataNasc(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Identidade do Atleta (RG / CPF / Certidão)"
                fullWidth
                required
                placeholder="Ex: 58.412.390-1 ou 123.456.789-00"
                value={documentoIdentidade}
                onChange={(e) => setDocumentoIdentidade(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon fontSize="small" sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Telefone de Contato / Emergência"
                fullWidth
                required
                placeholder="Ex: (11) 98765-4321"
                value={telefoneContato}
                onChange={(e) => {
                  setTelefoneContato(e.target.value);
                  setContatoEmergencia(e.target.value);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Endereço Residencial Completo"
                fullWidth
                required
                placeholder="Rua, Número, Complemento, Bairro, Cidade - UF, CEP"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon fontSize="small" sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Turma / Horário</InputLabel>
                <Select
                  value={turmaId}
                  label="Turma / Horário"
                  onChange={(e) => setTurmaId(e.target.value)}
                >
                  {turmas.map(t => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.nome} ({t.modalidade === 'campo' ? 'Campo' : 'Futsal'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Filial / Unidade</InputLabel>
                <Select
                  value={filialId}
                  label="Filial / Unidade"
                  onChange={(e) => setFilialId(e.target.value)}
                >
                  {filiais.map(f => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Posição Preferida"
                fullWidth
                placeholder="Ex: Meia-Armador, Atacante, Goleiro"
                value={posicao}
                onChange={(e) => setPosicao(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Pé Dominante</InputLabel>
                <Select
                  value={peDominante}
                  label="Pé Dominante"
                  onChange={(e) => setPeDominante(e.target.value as any)}
                >
                  <MenuItem value="Destro">Destro</MenuItem>
                  <MenuItem value="Canhoto">Canhoto</MenuItem>
                  <MenuItem value="Ambidestro">Ambidestro</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Número da Camisa"
                type="number"
                fullWidth
                value={numeroCamisa}
                onChange={(e) => setNumeroCamisa(Number(e.target.value))}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Informações Médicas & Restrições (Alergias, Remédios, Atestados)"
                fullWidth
                multiline
                rows={2}
                value={infoMedica}
                onChange={(e) => setInfoMedica(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Responsável Legal */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1b5e20', mt: 1 }}>
            2. Vínculo do Responsável Legal (Pai / Mãe / Tutor)
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={!isNewParent ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setIsNewParent(false)}
            >
              Selecionar Responsável Existente
            </Button>
            <Button
              variant={isNewParent ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setIsNewParent(true)}
            >
              + Cadastrar Novo Responsável
            </Button>
          </Box>

          {!isNewParent ? (
            <FormControl fullWidth>
              <InputLabel>Responsável Existente</InputLabel>
              <Select
                value={selectedParentId}
                label="Responsável Existente"
                onChange={(e) => setSelectedParentId(e.target.value)}
              >
                {responsaveis.map(r => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.nome} ({r.parentesco} - {r.telefone})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Nome do Pai/Mãe"
                  fullWidth
                  required
                  value={parentNome}
                  onChange={(e) => setParentNome(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Telefone / WhatsApp"
                  fullWidth
                  placeholder="(11) 98765-4321"
                  value={parentTelefone}
                  onChange={(e) => setParentTelefone(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label="E-mail"
                  fullWidth
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Parentesco</InputLabel>
                  <Select
                    value={parentParentesco}
                    label="Parentesco"
                    onChange={(e) => setParentParentesco(e.target.value as any)}
                  >
                    <MenuItem value="Pai">Pai</MenuItem>
                    <MenuItem value="Mãe">Mãe</MenuItem>
                    <MenuItem value="Tutor Legal">Tutor Legal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {/* Matrícula e Mensalidade */}
          {!editingAlunoId && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1b5e20', mt: 1 }}>
                3. Plano de Mensalidade & Cobrança PIX
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Nome do Plano"
                    fullWidth
                    value={planoNome}
                    onChange={(e) => setPlanoNome(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label="Mensalidade (R$)"
                    type="number"
                    fullWidth
                    value={valorMensalidade}
                    onChange={(e) => setValorMensalidade(Number(e.target.value))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label="Dia do Vencimento"
                    type="number"
                    fullWidth
                    value={diaVencimento}
                    onChange={(e) => setDiaVencimento(Number(e.target.value))}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenAlunoDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveAluno}>
            Concluir Matrícula
          </Button>
        </DialogActions>
      </Dialog>

      {/* Aluno Detail Dossier / Ficha do Atleta Dialog */}
      <Dialog
        open={Boolean(selectedAlunoDetail)}
        onClose={() => setSelectedAlunoDetail(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        {selectedAlunoDetail && (() => {
          const parentFicha = responsaveis.find(r => r.id === selectedAlunoDetail.responsavelId);
          const turmaFicha = turmas.find(t => t.id === selectedAlunoDetail.turmaId);
          return (
            <>
              <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                <Avatar
                  src={selectedAlunoDetail.fotoUrl}
                  sx={{ width: 68, height: 68, border: '3px solid #1b5e20', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {selectedAlunoDetail.nome}
                    </Typography>
                    <Chip
                      label="Ficha do Atleta"
                      size="small"
                      color="success"
                      sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mt: 0.3 }}>
                    Camisa #{selectedAlunoDetail.numeroCamisa} • {selectedAlunoDetail.posicaoPreferida} ({selectedAlunoDetail.peDominante})
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700 }}>
                    {turmaFicha?.nome || 'Turma Regular'} • Nascimento: {new Date(selectedAlunoDetail.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
              </DialogTitle>

              <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Dados de Identidade, Telefone e Endereço */}
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BadgeIcon fontSize="small" sx={{ color: '#1b5e20', fontSize: 16 }} />
                        Identidade do Atleta (RG / CPF)
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.3, fontFamily: 'monospace' }}>
                        {selectedAlunoDetail.documentoIdentidade || 'Não informado'}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ContactPhoneIcon fontSize="small" sx={{ color: '#0284c7', fontSize: 16 }} />
                        Telefone de Contato
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.3 }}>
                        {selectedAlunoDetail.telefoneContato || selectedAlunoDetail.contatoEmergencia || parentFicha?.telefone || 'Não informado'}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HomeIcon fontSize="small" sx={{ color: '#ea580c', fontSize: 16 }} />
                        Endereço Residencial
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, mt: 0.3 }}>
                        {selectedAlunoDetail.endereco || parentFicha?.endereco || 'Endereço não informado'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Responsável Legal */}
                {parentFicha && (
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#0f172a' }}>
                      Responsável Legal ({parentFicha.parentesco || 'Responsável'}):
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                      {parentFicha.nome} • {parentFicha.telefone} • {parentFicha.email}
                    </Typography>
                  </Box>
                )}

                {/* Ficha Médica */}
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MedicalInformationIcon color="primary" fontSize="small" />
                    Ficha Médica & Cuidados Especiais:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155' }}>
                    {selectedAlunoDetail.infoMedica || 'Nenhuma restrição registrada.'}
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    const alunoToEdit = selectedAlunoDetail;
                    setSelectedAlunoDetail(null);
                    handleOpenAlunoModal(alunoToEdit);
                  }}
                >
                  Editar Ficha
                </Button>
                <Button onClick={() => setSelectedAlunoDetail(null)} variant="contained" color="primary">
                  Fechar
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
};
