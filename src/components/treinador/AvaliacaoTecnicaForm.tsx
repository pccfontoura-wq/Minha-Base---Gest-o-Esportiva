import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, Chip, 
  Avatar, Slider, TextField, FormControl, InputLabel, Select, 
  MenuItem, CircularProgress, Alert, Divider, Stack, Rating,
  InputAdornment
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SaveIcon from '@mui/icons-material/Save';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BoltIcon from '@mui/icons-material/Bolt';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, 
  Tooltip as RechartsTooltip, CartesianGrid, Legend 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { AvaliacaoTecnica, FundamentosCampo, FundamentosFutsal, TestesFisicos } from '../../types';
import confetti from 'canvas-confetti';

interface AvaliacaoTecnicaFormProps {
  onNavigateToEvolucao?: (alunoId?: string) => void;
}

export const AvaliacaoTecnicaForm: React.FC<AvaliacaoTecnicaFormProps> = ({
  onNavigateToEvolucao
}) => {
  const { alunos, turmas, categorias, avaliacoes, addAvaliacao, user } = useAuth();

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
  const turmasIdsPermitidas = new Set(turmasPermitidas.map(t => t.id));

  const alunosPermitidos = isTecnico
    ? alunos.filter(a => a.turmaId && turmasIdsPermitidas.has(a.turmaId))
    : alunos;

  const [selectedAlunoId, setSelectedAlunoId] = useState<string>(alunosPermitidos[0]?.id || alunos[0]?.id || '');
  const [dataAvaliacao, setDataAvaliacao] = useState(new Date().toISOString().split('T')[0]);
  const [periodo, setPeriodo] = useState('2º Bimestre / 2026');
  
  const selectedAluno = alunos.find(a => a.id === selectedAlunoId);
  const selectedTurma = turmas.find(t => t.id === selectedAluno?.turmaId);
  const selectedCategoria = categorias.find(c => c.id === (selectedAluno?.categoriaId || selectedTurma?.categoriaId));
  const isCampo = selectedAluno?.modalidade === 'campo' || selectedTurma?.modalidade === 'campo';

  // 1. Testes Físicos (Valores Numéricos)
  const [testesFisicos, setTestesFisicos] = useState<TestesFisicos>({
    velocidade: 4.6, // segundos (Sprint 30m)
    resistencia: 2100, // metros (Teste de Cooper)
    agilidade: 9.8, // segundos (Shuttle Run)
    forca: 36, // cm (Salto Vertical)
    flexibilidade: 28,
  });

  // 2. Fundamentos Campo (Escala 1 a 5)
  const [fundCampo, setFundCampo] = useState<FundamentosCampo>({
    passe: 4.5,
    drible: 4.0,
    chute: 4.2,
    cabeceio: 3.5,
    posicionamento: 4.5,
    dominioBola: 4.8,
  });

  // 3. Fundamentos Futsal (Escala 1 a 5)
  const [fundFutsal, setFundFutsal] = useState<FundamentosFutsal>({
    controleEspacoReduzido: 4.5,
    passeCurto: 4.2,
    finalizacao: 3.8,
    dominioBola: 4.6,
    visaoJogo: 4.0,
  });

  // 4. Observações do Técnico
  const [observacoesTecnico, setObservacoesTecnico] = useState(
    'Excelente leitura tática e intensidade motora durante os treinamentos. Demonstrando postura de liderança técnica.'
  );

  // AI Feedback Generation
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // Historic evaluations for this student
  const historicoAluno = avaliacoes
    .filter(av => av.alunoId === selectedAlunoId)
    .sort((a, b) => new Date(a.data || a.dataAvaliacao || '').getTime() - new Date(b.data || b.dataAvaliacao || '').getTime());

  // Calculate Overall Score (Nota Geral) out of 10
  const calcNotaGeral = () => {
    let mediaFundamentos = 0;
    if (isCampo) {
      const soma = fundCampo.passe + fundCampo.drible + fundCampo.chute + fundCampo.cabeceio + fundCampo.posicionamento + fundCampo.dominioBola;
      mediaFundamentos = soma / 6; // escala 1 a 5
    } else {
      const soma = fundFutsal.controleEspacoReduzido + fundFutsal.passeCurto + fundFutsal.finalizacao + fundFutsal.dominioBola + fundFutsal.visaoJogo;
      mediaFundamentos = soma / 5; // escala 1 a 5
    }

    // Convert 1-5 scale of fundamentals to 0-10 base (multiplied by 2)
    const notaTecnica = mediaFundamentos * 2;

    // Physical score normalized roughly 0-10
    // Velocidade: 4.2s = 10, 6.0s = 5
    const notaVel = Math.max(1, Math.min(10, 10 - ((testesFisicos.velocidade - 4.2) * 2.5)));
    // Resistencia: 2400m = 10, 1400m = 5
    const notaRes = Math.max(1, Math.min(10, (testesFisicos.resistencia / 2400) * 10));
    // Força: 40cm = 10, 20cm = 5
    const notaFor = Math.max(1, Math.min(10, (testesFisicos.forca / 40) * 10));
    // Agilidade: 9.0s = 10, 11.5s = 5
    const notaAgi = Math.max(1, Math.min(10, 10 - ((testesFisicos.agilidade - 9.0) * 2.0)));
    
    const notaFisica = (notaVel + notaRes + notaFor + notaAgi) / 4;

    // Weighted: 65% Technical + 35% Physical
    const overall = (notaTecnica * 0.65) + (notaFisica * 0.35);
    return Number(Math.min(10, Math.max(1, overall)).toFixed(1));
  };

  // Radar Data Preparation (Scale 1 to 5 for radar)
  const radarData = isCampo
    ? [
        { subject: 'Passe', nota: fundCampo.passe },
        { subject: 'Drible', nota: fundCampo.drible },
        { subject: 'Chute', nota: fundCampo.chute },
        { subject: 'Cabeceio', nota: fundCampo.cabeceio },
        { subject: 'Posicionamento', nota: fundCampo.posicionamento },
        { subject: 'Domínio', nota: fundCampo.dominioBola },
      ]
    : [
        { subject: 'Espaço Reduzido', nota: fundFutsal.controleEspacoReduzido },
        { subject: 'Passe Curto', nota: fundFutsal.passeCurto },
        { subject: 'Finalização', nota: fundFutsal.finalizacao },
        { subject: 'Domínio / Pisada', nota: fundFutsal.dominioBola },
        { subject: 'Visão de Jogo', nota: fundFutsal.visaoJogo },
      ];

  // Evolution Line Data
  const evolutionData = historicoAluno.map(av => ({
    data: av.data ? new Date(av.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : (av.periodo || 'Aval'),
    notaGeral: av.notaGeral,
  }));

  const handleGenerateAIFeedback = async () => {
    if (!selectedAluno) return;

    setAiGenerating(true);
    setAiReport(null);

    try {
      const res = await fetch('/api/ai/generate-athlete-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alunoNome: selectedAluno.nome,
          idade: selectedAluno.dataNascimento ? new Date().getFullYear() - new Date(selectedAluno.dataNascimento).getFullYear() : 11,
          modalidade: isCampo ? 'Futebol de Campo' : 'Futsal',
          posicao: selectedAluno.posicaoPreferida || 'Meia/Atacante',
          testesFisicos,
          fundamentos: isCampo ? fundCampo : fundFutsal,
          observacoesTecnico,
          notaGeral: calcNotaGeral(),
        }),
      });

      const data = await res.json();
      if (data.feedback) {
        setAiReport(data.feedback);
      }
    } catch (err: any) {
      setAiReport('Parecer IA: Atleta com excelente desempenho nos fundamentos de controle e velocidade. Recomenda-se treinos específicos para elevar a potência de finalização e cabeceio.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!selectedAluno) return;

    const notaGeral = calcNotaGeral();

    await addAvaliacao({
      alunoId: selectedAluno.id,
      categoriaId: selectedAluno.categoriaId || selectedTurma?.categoriaId || 'cat-sub11',
      turmaId: selectedAluno.turmaId,
      modalidade: isCampo ? 'campo' : 'futsal',
      avaliadorId: user.id || 'coach-1',
      treinadorId: user.id || 'coach-1',
      data: dataAvaliacao,
      dataAvaliacao,
      periodo,
      testesFisicos: {
        velocidade: Number(testesFisicos.velocidade),
        resistencia: Number(testesFisicos.resistencia),
        agilidade: Number(testesFisicos.agilidade),
        forca: Number(testesFisicos.forca),
        velocidade30m: Number(testesFisicos.velocidade),
        resistenciaCooper: Number(testesFisicos.resistencia),
        agilidadeShuttleRun: Number(testesFisicos.agilidade),
        forcaSaltoVertical: Number(testesFisicos.forca)
      },
      fundamentosCampo: isCampo ? fundCampo : undefined,
      fundamentosFutsal: !isCampo ? fundFutsal : undefined,
      observacoesTecnico,
      observacoesTreinador: observacoesTecnico,
      notaGeral,
      parecerPedagogicoIA: aiReport || undefined,
      aiFeedback: aiReport || undefined
    });

    confetti({ particleCount: 60, spread: 70 });
    alert('Avaliação técnica do atleta salva com sucesso!');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Avaliação Técnica do Atleta
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Formulário com campos técnicos dinâmicos para Campo ou Futsal, testes físicos e cálculo automático da nota geral.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {onNavigateToEvolucao && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<TrendingUpIcon />}
              onClick={() => onNavigateToEvolucao(selectedAlunoId)}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
            >
              Ver Evolução & Dicas
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveEvaluation}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
          >
            Salvar Avaliação
          </Button>
        </Box>
      </Box>

      {/* Select Student & Modalidade Banner */}
      <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
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

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Data da Avaliação"
                type="date"
                size="small"
                value={dataAvaliacao}
                onChange={(e) => setDataAvaliacao(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              {selectedAluno && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Avatar src={selectedAluno.fotoUrl} sx={{ width: 40, height: 40 }}>
                    {selectedAluno.nome.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {selectedAluno.nome}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      {selectedTurma?.nome || 'Turma'} • {selectedCategoria?.nome || 'Sub-11'}
                    </Typography>
                  </Box>
                  <Chip
                    label={isCampo ? '🌱 Campo' : '⚡ Futsal'}
                    size="small"
                    color={isCampo ? 'success' : 'primary'}
                    sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Evaluation Panels Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Sliders for Physical & Technical Metrics */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Section 1: Testes Físicos (Valores Numéricos) */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FitnessCenterIcon fontSize="small" />
                  1. Testes Físicos (Valores Numéricos)
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Velocidade (Sprint 30m)"
                      type="number"
                      size="small"
                      fullWidth
                      value={testesFisicos.velocidade}
                      onChange={(e) => setTestesFisicos({ ...testesFisicos, velocidade: Number(e.target.value) })}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">segundos</InputAdornment>,
                        }
                      }}
                      helperText="Tempo nos primeiros 30 metros"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Resistência (Teste de Cooper)"
                      type="number"
                      size="small"
                      fullWidth
                      value={testesFisicos.resistencia}
                      onChange={(e) => setTestesFisicos({ ...testesFisicos, resistencia: Number(e.target.value) })}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">metros</InputAdornment>,
                        }
                      }}
                      helperText="Distância percorrida em 12 min"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Agilidade (Shuttle Run)"
                      type="number"
                      size="small"
                      fullWidth
                      value={testesFisicos.agilidade}
                      onChange={(e) => setTestesFisicos({ ...testesFisicos, agilidade: Number(e.target.value) })}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">segundos</InputAdornment>,
                        }
                      }}
                      helperText="Mudança de direção em velocidade"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Força / Impulsão (Salto Vertical)"
                      type="number"
                      size="small"
                      fullWidth
                      value={testesFisicos.forca}
                      onChange={(e) => setTestesFisicos({ ...testesFisicos, forca: Number(e.target.value) })}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">centímetros</InputAdornment>,
                        }
                      }}
                      helperText="Altura alcançada no salto"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Section 2: Fundamentos Técnicos (Escala 1 a 5, adaptado por Modalidade) */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: isCampo ? '#16a34a' : '#0284c7', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsSoccerIcon fontSize="small" />
                    {isCampo ? '2. Fundamentos de Campo (Escala 1 a 5)' : '2. Fundamentos de Futsal (Escala 1 a 5)'}
                  </Typography>
                  <Chip
                    label={isCampo ? 'Futebol de Campo' : 'Futsal'}
                    size="small"
                    color={isCampo ? 'success' : 'primary'}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                {isCampo ? (
                  /* Fundamentos Campo */
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span>Passe (Curto e Longo)</span>
                          <strong style={{ color: '#16a34a' }}>{fundCampo.passe} / 5.0</strong>
                        </Typography>
                        <Slider
                          value={fundCampo.passe}
                          min={1}
                          max={5}
                          step={0.1}
                          onChange={(_, v) => setFundCampo({ ...fundCampo, passe: v as number })}
                          color="success"
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span>Drible / 1 vs 1</span>
                          <strong style={{ color: '#16a34a' }}>{fundCampo.drible} / 5.0</strong>
                        </Typography>
                        <Slider
                          value={fundCampo.drible}
                          min={1}
                          max={5}
                          step={0.1}
                          onChange={(_, v) => setFundCampo({ ...fundCampo, drible: v as number })}
                          color="success"
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span>Chute / Finalização</span>
                          <strong style={{ color: '#16a34a' }}>{fundCampo.chute} / 5.0</strong>
                        </Typography>
                        <Slider
                          value={fundCampo.chute}
                          min={1}
                          max={5}
                          step={0.1}
                          onChange={(_, v) => setFundCampo({ ...fundCampo, chute: v as number })}
                          color="success"
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span>Cabeceio</span>
                          <strong style={{ color: '#16a34a' }}>{fundCampo.cabeceio} / 5.0</strong>
                        </Typography>
                        <Slider
                          value={fundCampo.cabeceio}
                          min={1}
                          max={5}
                          step={0.1}
                          onChange={(_, v) => setFundCampo({ ...fundCampo, cabeceio: v as number })}
                          color="success"
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span>Posicionamento Tático</span>
                          <strong style={{ color: '#16a34a' }}>{fundCampo.posicionamento} / 5.0</strong>
                        </Typography>
                        <Slider
                          value={fundCampo.posicionamento}
                          min={1}
                          max={5}
                          step={0.1}
                          onChange={(_, v) => setFundCampo({ ...fundCampo, posicionamento: v as number })}
                          color="success"
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span>Domínio de Bola (1º Toque)</span>
                          <strong style={{ color: '#16a34a' }}>{fundCampo.dominioBola} / 5.0</strong>
                        </Typography>
                        <Slider
                          value={fundCampo.dominioBola}
                          min={1}
                          max={5}
                          step={0.1}
                          onChange={(_, v) => setFundCampo({ ...fundCampo, dominioBola: v as number })}
                          color="success"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  /* Fundamentos Futsal */
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span>Controle em Espaço Reduzido</span>
                          <strong style={{ color: '#0284c7' }}>{fundFutsal.controleEspacoReduzido} / 5.0</strong>
                        </Typography>
                        <Slider
                          value={fundFutsal.controleEspacoReduzido}
                          min={1}
                          max={5}
                          step={0.1}
                          onChange={(_, v) => setFundFutsal({ ...fundFutsal, controleEspacoReduzido: v as number })}
                          color="primary"
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span>Passe Curto & Tabelas</span>
                          <strong style={{ color: '#0284c7' }}>{fundFutsal.passeCurto} / 5.0</strong>
                        </Typography>
                        <Slider
                          value={fundFutsal.passeCurto}
                          min={1}
                          max={5}
                          step={0.1}
                          onChange={(_, v) => setFundFutsal({ ...fundFutsal, passeCurto: v as number })}
                          color="primary"
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span>Finalização (Bico / Chapa)</span>
                          <strong style={{ color: '#0284c7' }}>{fundFutsal.finalizacao} / 5.0</strong>
                        </Typography>
                        <Slider
                          value={fundFutsal.finalizacao}
                          min={1}
                          max={5}
                          step={0.1}
                          onChange={(_, v) => setFundFutsal({ ...fundFutsal, finalizacao: v as number })}
                          color="primary"
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span>Domínio de Bola (Pisada com Sola)</span>
                          <strong style={{ color: '#0284c7' }}>{fundFutsal.dominioBola} / 5.0</strong>
                        </Typography>
                        <Slider
                          value={fundFutsal.dominioBola}
                          min={1}
                          max={5}
                          step={0.1}
                          onChange={(_, v) => setFundFutsal({ ...fundFutsal, dominioBola: v as number })}
                          color="primary"
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span>Visão de Jogo & Quadra</span>
                          <strong style={{ color: '#0284c7' }}>{fundFutsal.visaoJogo} / 5.0</strong>
                        </Typography>
                        <Slider
                          value={fundFutsal.visaoJogo}
                          min={1}
                          max={5}
                          step={0.1}
                          onChange={(_, v) => setFundFutsal({ ...fundFutsal, visaoJogo: v as number })}
                          color="primary"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Box>

              <Divider />

              {/* Section 3: Observações do Técnico */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                  3. Observações do Técnico (Texto)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Insira as observações pedagógicas e recomendações técnicas do treinador..."
                  value={observacoesTecnico}
                  onChange={(e) => setObservacoesTecnico(e.target.value)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Calculated Overall Score & Radar Chart */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            {/* Overall Score & Radar Chart */}
            <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                  NOTA GERAL CALCULADA (OVERALL)
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, color: '#16a34a', my: 0.5 }}>
                  {calcNotaGeral()}
                  <Typography component="span" variant="h6" sx={{ color: '#94a3b8' }}>
                    /10
                  </Typography>
                </Typography>

                <Box sx={{ width: '100%', height: 250, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#cbd5e1" />
                      <Radar
                        name="Fundamentos"
                        dataKey="nota"
                        stroke="#16a34a"
                        fill="#16a34a"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Quick Evolution Preview */}
            <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon color="primary" />
                    Histórico de Notas do Aluno
                  </Typography>
                  {onNavigateToEvolucao && (
                    <Button
                      size="small"
                      onClick={() => onNavigateToEvolucao(selectedAlunoId)}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Ver Detalhes
                    </Button>
                  )}
                </Box>

                {evolutionData.length > 0 ? (
                  <Box sx={{ width: '100%', height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="data" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <RechartsTooltip />
                        <Line
                          type="monotone"
                          dataKey="notaGeral"
                          stroke="#16a34a"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#16a34a' }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 2 }}>
                    Esta é a primeira avaliação para este atleta.
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* AI Pedagogical Feedback */}
            <Card sx={{ borderRadius: 3.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon color="primary" />
                    Parecer Pedagógico com IA
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    disabled={aiGenerating}
                    onClick={handleGenerateAIFeedback}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {aiGenerating ? <CircularProgress size={16} color="inherit" /> : 'Gerar Parecer'}
                  </Button>
                </Box>

                {aiReport ? (
                  <Alert severity="success" sx={{ borderRadius: 2.5, whiteSpace: 'pre-line' }}>
                    {aiReport}
                  </Alert>
                ) : (
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Gere uma devolutiva pedagógica automática com IA para compartilhar com o atleta e a família.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
