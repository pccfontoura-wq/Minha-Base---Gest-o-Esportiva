import React, { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, FormControl, InputLabel,
  Select, MenuItem, Chip, Avatar, Button, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Rating
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddIcon from '@mui/icons-material/Add';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import BoltIcon from '@mui/icons-material/Bolt';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useAuth } from '../../context/AuthContext';
import { AvaliacaoTecnica } from '../../types';
import { ProgressoHistoricoChart } from './ProgressoHistoricoChart';
import { ExportarRelatorioPdfDialog } from './ExportarRelatorioPdfDialog';

interface EvolucaoAtletaProps {
  onNavigateToAvaliacao?: () => void;
  selectedAlunoIdProp?: string;
}

export const EvolucaoAtleta: React.FC<EvolucaoAtletaProps> = ({
  onNavigateToAvaliacao,
  selectedAlunoIdProp
}) => {
  const { tenant, user, alunos, turmas, categorias, responsaveis, avaliacoes, dicasTreino, addDicaTreino } = useAuth();

  // Determine allowed athletes according to user role
  const isResponsavel = user.papel === 'responsavel';
  const isTecnico = user.papel === 'tecnico' || user.papel === 'treinador';

  const alunosPermitidos = useMemo(() => {
    if (isResponsavel) {
      return alunos.filter(a => a.responsavelId === user.id || a.responsavelId === user.username || a.responsavelId === 'resp-1' || a.responsavelId === 'resp-2');
    }
    if (isTecnico) {
      // Allow students from coach's turmas or all students if coach
      const turmasDoTecnico = turmas.filter(t => t.tecnicoId === user.id || t.treinadorId === user.id).map(t => t.id);
      if (turmasDoTecnico.length > 0) {
        return alunos.filter(a => turmasDoTecnico.includes(a.turmaId));
      }
      return alunos;
    }
    return alunos;
  }, [alunos, turmas, user, isResponsavel, isTecnico]);

  // Selected student state
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>(() => {
    if (selectedAlunoIdProp && alunosPermitidos.some(a => a.id === selectedAlunoIdProp)) {
      return selectedAlunoIdProp;
    }
    return alunosPermitidos[0]?.id || '';
  });

  // New training tip modal (for coaches / admins)
  const [openNovaDicaDialog, setOpenNovaDicaDialog] = useState(false);
  const [openExportPdfDialog, setOpenExportPdfDialog] = useState(false);
  const [novaDica, setNovaDica] = useState({
    fundamentoRelacionado: 'passe',
    titulo: '',
    descricao: '',
    modalidade: 'ambas' as 'campo' | 'futsal' | 'ambas'
  });

  const selectedAluno = alunos.find(a => a.id === selectedAlunoId);
  const selectedTurma = turmas.find(t => t.id === selectedAluno?.turmaId);
  const selectedCategoria = categorias.find(c => c.id === (selectedAluno?.categoriaId || selectedTurma?.categoriaId));
  const selectedResponsavel = responsaveis.find(r => r.id === selectedAluno?.responsavelId || r.alunosIds?.includes(selectedAlunoId));
  const isCampo = selectedAluno?.modalidade === 'campo' || selectedTurma?.modalidade === 'campo';

  // Get historical evaluations for selected student, sorted chronologically
  const historicoAluno: AvaliacaoTecnica[] = useMemo(() => {
    return avaliacoes
      .filter(av => av.alunoId === selectedAlunoId)
      .sort((a, b) => {
        const dateA = new Date(a.data || a.dataAvaliacao || '2026-01-01').getTime();
        const dateB = new Date(b.data || b.dataAvaliacao || '2026-01-01').getTime();
        return dateA - dateB;
      });
  }, [avaliacoes, selectedAlunoId]);

  // Latest evaluation
  const ultimaAvaliacao = historicoAluno.length > 0 ? historicoAluno[historicoAluno.length - 1] : null;
  const penultimaAvaliacao = historicoAluno.length > 1 ? historicoAluno[historicoAluno.length - 2] : null;

  // Calculate overall score difference
  const notaGeralDiff = useMemo(() => {
    if (!ultimaAvaliacao || !penultimaAvaliacao) return null;
    const diff = ultimaAvaliacao.notaGeral - penultimaAvaliacao.notaGeral;
    return Number(diff.toFixed(1));
  }, [ultimaAvaliacao, penultimaAvaliacao]);

  // Identify lowest scored fundamentals from the most recent evaluation
  const rankingFundamentos = useMemo(() => {
    if (!ultimaAvaliacao) return [];

    const scores: { chave: string; nome: string; nota: number; tipo: 'campo' | 'futsal' | 'fisico' }[] = [];

    if (isCampo && ultimaAvaliacao.fundamentosCampo) {
      const fc = ultimaAvaliacao.fundamentosCampo as any;
      if (fc.passe !== undefined) scores.push({ chave: 'passe', nome: 'Passe', nota: fc.passe, tipo: 'campo' });
      if (fc.drible !== undefined) scores.push({ chave: 'drible', nome: 'Drible', nota: fc.drible, tipo: 'campo' });
      if (fc.chute !== undefined) scores.push({ chave: 'chute', nome: 'Chute / Finalização', nota: fc.chute, tipo: 'campo' });
      if (fc.cabeceio !== undefined) scores.push({ chave: 'cabeceio', nome: 'Cabeceio', nota: fc.cabeceio, tipo: 'campo' });
      if (fc.posicionamento !== undefined) scores.push({ chave: 'posicionamento', nome: 'Posicionamento', nota: fc.posicionamento, tipo: 'campo' });
      if (fc.dominioBola !== undefined) scores.push({ chave: 'dominioBola', nome: 'Domínio de Bola', nota: fc.dominioBola, tipo: 'campo' });
    } else if (!isCampo && ultimaAvaliacao.fundamentosFutsal) {
      const ff = ultimaAvaliacao.fundamentosFutsal as any;
      if (ff.controleEspacoReduzido !== undefined) scores.push({ chave: 'controleEspacoReduzido', nome: 'Controle em Espaço Reduzido', nota: ff.controleEspacoReduzido, tipo: 'futsal' });
      if (ff.passeCurto !== undefined) scores.push({ chave: 'passeCurto', nome: 'Passe Curto', nota: ff.passeCurto, tipo: 'futsal' });
      if (ff.finalizacao !== undefined) scores.push({ chave: 'finalizacao', nome: 'Finalização', nota: ff.finalizacao, tipo: 'futsal' });
      if (ff.dominioBola !== undefined) scores.push({ chave: 'dominioBola', nome: 'Domínio de Bola (Pisada)', nota: ff.dominioBola, tipo: 'futsal' });
      if (ff.visaoJogo !== undefined) scores.push({ chave: 'visaoJogo', nome: 'Visão de Jogo', nota: ff.visaoJogo, tipo: 'futsal' });
    }

    // Sort ascending by score (lowest first)
    return scores.sort((a, b) => a.nota - b.nota);
  }, [ultimaAvaliacao, isCampo]);

  // Automatic Training Tips Recommendation based on athlete's lowest scores
  const dicasRecomendadas = useMemo(() => {
    if (!ultimaAvaliacao || rankingFundamentos.length === 0) {
      // Fallback: show general tips matching modality
      return dicasTreino.filter(d => d.modalidade === 'ambas' || d.modalidade === (isCampo ? 'campo' : 'futsal')).slice(0, 3);
    }

    // Lowest 3 fundamentals
    const menoresFundamentos = rankingFundamentos.slice(0, 3);
    const menoresChaves = menoresFundamentos.map(f => f.chave.toLowerCase());

    // Filter dicasTreino matching these lowest scored fundamentals
    const matched = dicasTreino.filter(dica => {
      const modalidadeOk = dica.modalidade === 'ambas' || dica.modalidade === (isCampo ? 'campo' : 'futsal');
      if (!modalidadeOk) return false;
      const fRel = dica.fundamentoRelacionado.toLowerCase();
      return menoresChaves.some(chave => chave.includes(fRel) || fRel.includes(chave));
    });

    // If we have matched tips, return them; otherwise complement with general tips
    if (matched.length > 0) {
      const extra = dicasTreino.filter(d => !matched.some(m => m.id === d.id) && (d.modalidade === 'ambas' || d.modalidade === (isCampo ? 'campo' : 'futsal')));
      return [...matched, ...extra].slice(0, 4);
    }

    return dicasTreino.filter(d => d.modalidade === 'ambas' || d.modalidade === (isCampo ? 'campo' : 'futsal')).slice(0, 3);
  }, [ultimaAvaliacao, rankingFundamentos, dicasTreino, isCampo]);

  // Handle adding new training tip
  const handleSalvarNovaDica = async () => {
    if (!novaDica.titulo.trim() || !novaDica.descricao.trim()) return;
    await addDicaTreino({
      fundamentoRelacionado: novaDica.fundamentoRelacionado,
      titulo: novaDica.titulo.trim(),
      descricao: novaDica.descricao.trim(),
      modalidade: novaDica.modalidade,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setOpenNovaDicaDialog(false);
    setNovaDica({
      fundamentoRelacionado: 'passe',
      titulo: '',
      descricao: '',
      modalidade: 'ambas'
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Screen Title & Quick Actions */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: '#16a34a', fontSize: 30 }} />
            Evolução do Atleta & Dicas de Treino
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Acompanhe o desenvolvimento histórico da nota geral, testes físicos e receba recomendações automáticas de treino.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="success"
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => setOpenExportPdfDialog(true)}
            disabled={!selectedAluno || historicoAluno.length === 0}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              borderColor: '#16a34a',
              color: '#15803d',
              bgcolor: 'rgba(22, 163, 74, 0.05)',
              '&:hover': { bgcolor: 'rgba(22, 163, 74, 0.12)', borderColor: '#15803d' }
            }}
          >
            Exportar Relatório PDF
          </Button>

          {!isResponsavel && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setOpenNovaDicaDialog(true)}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
            >
              Nova Dica de Treino
            </Button>
          )}

          {!isResponsavel && onNavigateToAvaliacao && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AssessmentIcon />}
              onClick={onNavigateToAvaliacao}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
            >
              Nova Avaliação Técnica
            </Button>
          )}
        </Box>
      </Box>

      {/* Athlete Selector Card */}
      <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2.5} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Selecione o Atleta</InputLabel>
                <Select
                  value={selectedAlunoId}
                  label="Selecione o Atleta"
                  onChange={(e) => setSelectedAlunoId(e.target.value)}
                >
                  {alunosPermitidos.map(a => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.nome} (#{a.numeroCamisa || 10} - {a.posicaoPreferida || 'Atleta'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedAluno && (
              <Grid size={{ xs: 12, md: 7 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  <Avatar src={selectedAluno.fotoUrl} sx={{ width: 46, height: 46, border: '2px solid #16a34a' }}>
                    {selectedAluno.nome.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 140 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {selectedAluno.nome}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {selectedTurma?.nome || 'Turma Ativa'} • {selectedCategoria?.nome || 'Sub-11'}
                    </Typography>
                  </Box>
                  <Chip
                    label={isCampo ? '🌱 Campo' : '⚡ Futsal'}
                    size="small"
                    color={isCampo ? 'success' : 'primary'}
                    sx={{ fontWeight: 700, borderRadius: 1.5 }}
                  />
                  <Chip
                    label={`${historicoAluno.length} Avaliações`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderRadius: 1.5 }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PictureAsPdfIcon fontSize="small" />}
                    onClick={() => setOpenExportPdfDialog(true)}
                    disabled={historicoAluno.length === 0}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      borderRadius: 1.5,
                      bgcolor: '#1b5e20',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#144618', boxShadow: 'none' }
                    }}
                  >
                    Boletim PDF p/ Pais
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* KPI Cards Overview */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Última Nota Geral
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#16a34a' }}>
                  {ultimaAvaliacao ? ultimaAvaliacao.notaGeral : '--'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>/10</Typography>
              </Box>
              {notaGeralDiff !== null && (
                <Typography variant="caption" sx={{ color: notaGeralDiff >= 0 ? '#16a34a' : '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {notaGeralDiff >= 0 ? `+${notaGeralDiff} pts` : `${notaGeralDiff} pts`} vs avaliação anterior
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SpeedIcon fontSize="small" sx={{ color: '#0284c7' }} />
                Velocidade (Sprint)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {ultimaAvaliacao?.testesFisicos?.velocidade || (ultimaAvaliacao?.testesFisicos as any)?.velocidade30m || '--'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>seg (30m)</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                Arranque e aceleração inicial
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimerIcon fontSize="small" sx={{ color: '#eab308' }} />
                Resistência Cardio
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {ultimaAvaliacao?.testesFisicos?.resistencia || (ultimaAvaliacao?.testesFisicos as any)?.resistenciaCooper || '--'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>metros (Cooper)</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                Capacidade aeróbica em jogo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BoltIcon fontSize="small" sx={{ color: '#8b5cf6' }} />
                Força / Impulsão
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {ultimaAvaliacao?.testesFisicos?.forca || (ultimaAvaliacao?.testesFisicos as any)?.forcaSaltoVertical || '--'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>cm (Salto)</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                Potência de membros inferiores
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Charts & Analytics Section */}
      <Grid container spacing={3}>
        {/* Left Column: Recharts Historical Progress Visualization */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <ProgressoHistoricoChart
            historicoAluno={historicoAluno}
            isCampo={isCampo}
            nomeAluno={selectedAluno?.nome}
          />
        </Grid>

        {/* Right Column: Fundamentals Status & Coach Observations */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SportsSoccerIcon color="primary" />
                Fundamentos Técnicos
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', mb: 2 }}>
                Escala de 1 a 5 na última avaliação ({isCampo ? 'Campo' : 'Futsal'})
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
                {rankingFundamentos.map((item) => (
                  <Box
                    key={item.chave}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.2,
                      bgcolor: item.nota <= 3.5 ? 'rgba(234, 179, 8, 0.08)' : '#f8fafc',
                      borderRadius: 2,
                      border: item.nota <= 3.5 ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid #e2e8f0',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {item.nome}
                      </Typography>
                      {item.nota <= 3.5 && (
                        <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600 }}>
                          Foco de Aprimoramento
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={item.nota} max={5} precision={0.1} readOnly size="small" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: item.nota <= 3.5 ? '#b45309' : '#16a34a', fontFamily: 'monospace' }}>
                        {item.nota.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {rankingFundamentos.length === 0 && (
                  <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>
                    Sem dados de fundamentos ainda.
                  </Typography>
                )}
              </Box>

              {/* Observações do Técnico da Última Avaliação */}
              {ultimaAvaliacao && (ultimaAvaliacao.observacoesTecnico || ultimaAvaliacao.observacoesTreinador) && (
                <Box sx={{ mt: 2.5, p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                    Parecer do Treinador ({ultimaAvaliacao.data || ultimaAvaliacao.dataAvaliacao || 'Última Avaliação'})
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1e293b', fontStyle: 'italic' }}>
                    "{ultimaAvaliacao.observacoesTecnico || ultimaAvaliacao.observacoesTreinador}"
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Module 3: Dicas de Treino Recomendadas Automaticamente */}
      <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1, mb: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbIcon sx={{ color: '#eab308' }} />
                Dicas de Treino Personalizadas
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Exercícios e orientações recomendadas automaticamente com base nos fundamentos com menor nota na última avaliação.
              </Typography>
            </Box>

            <Chip
              icon={<CheckCircleIcon />}
              label="Recomendação Inteligente"
              color="success"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <Grid container spacing={2.5}>
            {dicasRecomendadas.map((dica) => {
              // Check if this tip relates to a low score fundamental for highlight
              const relatesToLowScore = rankingFundamentos.some(
                rf => rf.nota <= 3.5 && (dica.fundamentoRelacionado.toLowerCase().includes(rf.chave.toLowerCase()) || rf.chave.toLowerCase().includes(dica.fundamentoRelacionado.toLowerCase()))
              );

              return (
                <Grid key={dica.id} size={{ xs: 12, md: 6 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      p: 2.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      bgcolor: relatesToLowScore ? 'rgba(254, 240, 138, 0.15)' : '#f8fafc',
                      borderColor: relatesToLowScore ? '#facc15' : '#e2e8f0',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                      }
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                        <Chip
                          label={`Fundamento: ${dica.fundamentoRelacionado.toUpperCase()}`}
                          size="small"
                          color={relatesToLowScore ? 'warning' : 'default'}
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                        <Chip
                          label={dica.modalidade === 'ambas' ? 'Campo & Futsal' : dica.modalidade === 'campo' ? 'Campo' : 'Futsal'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>

                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, lineHeight: 1.3 }}>
                        {dica.titulo}
                      </Typography>

                      <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                        {dica.descricao}
                      </Typography>
                    </Box>

                    {relatesToLowScore && (
                      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #facc15', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ color: '#eab308', fontSize: 18 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#854d0e' }}>
                          Prioridade alta para o ciclo atual de treinos do atleta!
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Modal Dialog: Cadastrar Nova Dica de Treino (Admin / Treinador) */}
      <Dialog open={openNovaDicaDialog} onClose={() => setOpenNovaDicaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightbulbIcon sx={{ color: '#eab308' }} />
          Cadastrar Nova Dica de Treino
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Fundamento Relacionado</InputLabel>
            <Select
              value={novaDica.fundamentoRelacionado}
              label="Fundamento Relacionado"
              onChange={(e) => setNovaDica({ ...novaDica, fundamentoRelacionado: e.target.value })}
            >
              <MenuItem value="passe">Passe (Curto e Longo)</MenuItem>
              <MenuItem value="drible">Drible / 1 vs 1</MenuItem>
              <MenuItem value="chute">Chute / Finalização</MenuItem>
              <MenuItem value="cabeceio">Cabeceio</MenuItem>
              <MenuItem value="posicionamento">Posicionamento Tático</MenuItem>
              <MenuItem value="dominioBola">Domínio de Bola</MenuItem>
              <MenuItem value="controleEspacoReduzido">Controle em Espaço Reduzido (Futsal)</MenuItem>
              <MenuItem value="passeCurto">Passe Curto & Tabela (Futsal)</MenuItem>
              <MenuItem value="finalizacao">Finalização Rápida (Futsal)</MenuItem>
              <MenuItem value="visaoJogo">Visão de Jogo</MenuItem>
              <MenuItem value="velocidade">Velocidade & Arranque</MenuItem>
              <MenuItem value="resistencia">Resistência Cardiorrespiratória</MenuItem>
              <MenuItem value="agilidade">Agilidade & Mudança de Direção</MenuItem>
              <MenuItem value="forca">Força & Impulsão</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Modalidade Aplicável</InputLabel>
            <Select
              value={novaDica.modalidade}
              label="Modalidade Aplicável"
              onChange={(e) => setNovaDica({ ...novaDica, modalidade: e.target.value as any })}
            >
              <MenuItem value="ambas">Ambas (Campo e Futsal)</MenuItem>
              <MenuItem value="campo">Futebol de Campo</MenuItem>
              <MenuItem value="futsal">Futsal</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Título da Dica / Exercício"
            placeholder="Ex: Domínio Orientado com Pisada no Futsal"
            fullWidth
            size="small"
            value={novaDica.titulo}
            onChange={(e) => setNovaDica({ ...novaDica, titulo: e.target.value })}
          />

          <TextField
            label="Descrição Detalhada do Exercício / Orientação Técnica"
            placeholder="Descreva passo a passo como o atleta deve treinar esse fundamento..."
            fullWidth
            multiline
            rows={4}
            value={novaDica.descricao}
            onChange={(e) => setNovaDica({ ...novaDica, descricao: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenNovaDicaDialog(false)} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSalvarNovaDica}
            disabled={!novaDica.titulo.trim() || !novaDica.descricao.trim()}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Salvar Dica de Treino
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Dialog: Exportar Relatório Consolidado em PDF para os Pais */}
      <ExportarRelatorioPdfDialog
        open={openExportPdfDialog}
        onClose={() => setOpenExportPdfDialog(false)}
        tenant={tenant}
        user={user}
        aluno={selectedAluno}
        turma={selectedTurma}
        categoria={selectedCategoria}
        responsavel={selectedResponsavel}
        isCampo={isCampo}
        historicoAluno={historicoAluno}
        dicasRecomendadas={dicasRecomendadas}
      />
    </Box>
  );
};
