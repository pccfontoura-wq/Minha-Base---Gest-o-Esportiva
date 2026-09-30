import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { AvaliacaoTecnica } from '../../types';

interface ProgressoHistoricoChartProps {
  historicoAluno: AvaliacaoTecnica[];
  isCampo: boolean;
  nomeAluno?: string;
}

interface FundamentoMeta {
  key: string;
  label: string;
  color: string;
}

const FUNDAMENTOS_CAMPO: FundamentoMeta[] = [
  { key: 'passe', label: 'Passe', color: '#0284c7' },
  { key: 'drible', label: 'Drible', color: '#d97706' },
  { key: 'chute', label: 'Chute / Finalização', color: '#dc2626' },
  { key: 'cabeceio', label: 'Cabeceio', color: '#7c3aed' },
  { key: 'posicionamento', label: 'Posicionamento', color: '#16a34a' },
  { key: 'dominioBola', label: 'Domínio de Bola', color: '#ea580c' },
];

const FUNDAMENTOS_FUTSAL: FundamentoMeta[] = [
  { key: 'controleEspacoReduzido', label: 'Controle Reduzido', color: '#0284c7' },
  { key: 'passeCurto', label: 'Passe Curto', color: '#16a34a' },
  { key: 'finalizacao', label: 'Finalização', color: '#dc2626' },
  { key: 'dominioBola', label: 'Domínio Pisada', color: '#ea580c' },
  { key: 'visaoJogo', label: 'Visão de Jogo', color: '#7c3aed' },
];

export const ProgressoHistoricoChart: React.FC<ProgressoHistoricoChartProps> = ({
  historicoAluno,
  isCampo,
  nomeAluno,
}) => {
  // 0: Nota Geral & Média Técnica, 1: Evolução por Fundamentos (1-5), 2: Comparativo Radar (1ª vs Última), 3: Testes Físicos
  const [activeTab, setActiveTab] = useState<number>(0);
  // Chart style for fundamentals tab: 'line' | 'bar'
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  // Selected individual fundamental filter ('todos' or specific key)
  const [selectedFundamento, setSelectedFundamento] = useState<string>('todos');

  const fundamentosConfig = isCampo ? FUNDAMENTOS_CAMPO : FUNDAMENTOS_FUTSAL;

  // Reset selected fundamental if modality changes and key doesn't exist
  React.useEffect(() => {
    setSelectedFundamento('todos');
  }, [isCampo]);

  // Helper to extract normalized 1-5 score for a given evaluation and fundamental key
  const extractFundamentoScore = (av: AvaliacaoTecnica, key: string): number => {
    if (isCampo) {
      const fc = (av.fundamentosCampo || {}) as Record<string, number | undefined>;
      if (fc[key] !== undefined) return Number(fc[key]);
      if (key === 'passe' && fc.passeCurtoELongo !== undefined) return Number((fc.passeCurtoELongo / 2).toFixed(1));
      if (key === 'drible' && fc.drible1v1 !== undefined) return Number((fc.drible1v1 / 2).toFixed(1));
      if (key === 'chute' && fc.finalizacaoEChute !== undefined) return Number((fc.finalizacaoEChute / 2).toFixed(1));
      if (key === 'cabeceio' && fc.cabecio !== undefined) return Number((fc.cabecio / 2).toFixed(1));
      if (key === 'posicionamento' && fc.visaoDeJogoETatica !== undefined) return Number((fc.visaoDeJogoETatica / 2).toFixed(1));
      if (key === 'dominioBola' && fc.dominioEPrimeiroToque !== undefined) return Number((fc.dominioEPrimeiroToque / 2).toFixed(1));
      return 3.5;
    } else {
      const ff = (av.fundamentosFutsal || {}) as Record<string, number | undefined>;
      if (ff[key] !== undefined) return Number(ff[key]);
      if (key === 'controleEspacoReduzido' && ff.pisadaNoDominio !== undefined) return Number((ff.pisadaNoDominio / 2).toFixed(1));
      if (key === 'passeCurto' && ff.passeRapidoEmEspacoCurto !== undefined) return Number((ff.passeRapidoEmEspacoCurto / 2).toFixed(1));
      if (key === 'finalizacao' && ff.finalizacaoDeBicoEChapa !== undefined) return Number((ff.finalizacaoDeBicoEChapa / 2).toFixed(1));
      if (key === 'dominioBola' && ff.pisadaNoDominio !== undefined) return Number((ff.pisadaNoDominio / 2).toFixed(1));
      if (key === 'visaoJogo' && ff.visaoEspacialQuadra !== undefined) return Number((ff.visaoEspacialQuadra / 2).toFixed(1));
      return 3.5;
    }
  };

  // Unified chronological dataset for Recharts
  const chartData = useMemo(() => {
    return historicoAluno.map((av, index) => {
      const rawDate = av.data || av.dataAvaliacao || '';
      const shortDate = rawDate
        ? new Date(rawDate + 'T00:00:00').toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          })
        : av.periodo || `Aval. ${index + 1}`;

      const fullDate = rawDate
        ? new Date(rawDate + 'T00:00:00').toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : av.periodo || `Avaliação ${index + 1}`;

      const fundValues: Record<string, number> = {};
      let sumFund = 0;
      fundamentosConfig.forEach((f) => {
        const val = extractFundamentoScore(av, f.key);
        fundValues[f.key] = val;
        sumFund += val;
      });

      const mediaFundamentos5 =
        fundamentosConfig.length > 0
          ? Number((sumFund / fundamentosConfig.length).toFixed(2))
          : 0;
      // Convert 1-5 scale average to 0-10 scale to compare alongside Nota Geral
      const mediaTecnica10 = Number((mediaFundamentos5 * 2).toFixed(1));

      const prevNota = index > 0 ? historicoAluno[index - 1].notaGeral : av.notaGeral;
      const variacaoNota = Number((av.notaGeral - prevNota).toFixed(1));

      const tf = (av.testesFisicos || {}) as Record<string, number | undefined>;
      const velocidade =
        tf.velocidade ?? tf.velocidade30m ?? tf.velocidadeSprint30m ?? 5.0;
      const resistencia = tf.resistencia ?? tf.resistenciaCooper ?? 2000;
      const agilidade = tf.agilidade ?? tf.agilidadeShuttleRun ?? 10.0;
      const forca = tf.forca ?? tf.forcaSaltoVertical ?? 35;

      return {
        id: av.id,
        data: shortDate,
        dataCompleta: fullDate,
        periodo: av.periodo || `Avaliação ${index + 1}`,
        notaGeral: av.notaGeral,
        mediaFundamentos5,
        mediaTecnica10,
        variacaoNota,
        observacoes: av.observacoesTecnico || av.observacoesTreinador || '',
        velocidade,
        resistenciaKm: Number((resistencia / 1000).toFixed(2)),
        resistenciaMetros: resistencia,
        agilidade,
        forca,
        ...fundValues,
      };
    });
  }, [historicoAluno, isCampo, fundamentosConfig]);

  // Radar comparison data (First vs Latest evaluation)
  const radarComparisonData = useMemo(() => {
    if (historicoAluno.length === 0) return [];
    const primeira = historicoAluno[0];
    const ultima = historicoAluno[historicoAluno.length - 1];

    return fundamentosConfig.map((f) => ({
      fundamento: f.label,
      inicial: extractFundamentoScore(primeira, f.key),
      atual: extractFundamentoScore(ultima, f.key),
      fullMark: 5,
    }));
  }, [historicoAluno, fundamentosConfig, isCampo]);

  // Summary metrics across history
  const resumoProgresso = useMemo(() => {
    if (chartData.length === 0) return null;
    const inicial = chartData[0];
    const atual = chartData[chartData.length - 1];
    const ganhoTotal = Number((atual.notaGeral - inicial.notaGeral).toFixed(1));
    const maiorNota = Math.max(...chartData.map((d) => d.notaGeral));
    const mediaHistorica = Number(
      (chartData.reduce((acc, cur) => acc + cur.notaGeral, 0) / chartData.length).toFixed(1)
    );

    return {
      notaInicial: inicial.notaGeral,
      notaAtual: atual.notaGeral,
      ganhoTotal,
      maiorNota,
      mediaHistorica,
      totalAvaliacoes: chartData.length,
    };
  }, [chartData]);

  const activeFundamentosList = useMemo(() => {
    if (selectedFundamento === 'todos') return fundamentosConfig;
    return fundamentosConfig.filter((f) => f.key === selectedFundamento);
  }, [selectedFundamento, fundamentosConfig]);

  if (historicoAluno.length === 0) {
    return (
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', height: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>
          <AssessmentIcon sx={{ fontSize: 48, opacity: 0.35, mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Sem histórico de avaliações técnicas
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Registre avaliações técnicas para visualizar os gráficos de evolução ao longo do tempo.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header & Primary View Tabs */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            pb: 2,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <TrendingUpIcon sx={{ color: '#16a34a' }} />
              Progresso Histórico de Avaliações Técnicas
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem', mt: 0.25 }}>
              {nomeAluno ? `${nomeAluno} · ` : ''}
              {isCampo ? 'Futebol de Campo' : 'Futsal'} · {historicoAluno.length}{' '}
              {historicoAluno.length === 1 ? 'avaliação registrada' : 'avaliações registradas'}
            </Typography>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 38,
              bgcolor: '#f8fafc',
              p: 0.5,
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                minHeight: 30,
                py: 0.5,
                px: 1.5,
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                color: '#475569',
                '&.Mui-selected': {
                  bgcolor: '#ffffff',
                  color: '#0f172a',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                },
              },
            }}
          >
            <Tab label="Nota Geral & Tendência" />
            <Tab label="Fundamentos (1–5)" />
            <Tab label="Comparativo Radar" />
            <Tab label="Testes Físicos" />
          </Tabs>
        </Box>

        {/* Summary Strip with Tabular Numerals */}
        {resumoProgresso && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 2,
              py: 2,
              px: 2.5,
              my: 2,
              bgcolor: '#f8fafc',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                1ª Avaliação
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                {resumoProgresso.notaInicial.toFixed(1)} / 10
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Nota Atual
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#16a34a', fontFamily: 'monospace' }}>
                {resumoProgresso.notaAtual.toFixed(1)} / 10
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Evolução Acumulada
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: resumoProgresso.ganhoTotal >= 0 ? '#16a34a' : '#dc2626',
                  fontFamily: 'monospace',
                }}
              >
                {resumoProgresso.ganhoTotal >= 0
                  ? `+${resumoProgresso.ganhoTotal.toFixed(1)} pts`
                  : `${resumoProgresso.ganhoTotal.toFixed(1)} pts`}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Média Histórica
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0284c7', fontFamily: 'monospace' }}>
                {resumoProgresso.mediaHistorica.toFixed(1)} / 10
              </Typography>
            </Box>
          </Box>
        )}

        {/* Sub-toolbar for Tab 1 (Fundamentos Filter & Line/Bar Switcher) */}
        {activeTab === 1 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              <Button
                size="small"
                variant={selectedFundamento === 'todos' ? 'contained' : 'outlined'}
                onClick={() => setSelectedFundamento('todos')}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.4,
                  px: 1.25,
                  borderRadius: 1.5,
                  boxShadow: 'none',
                }}
              >
                Todos os Fundamentos
              </Button>
              {fundamentosConfig.map((f) => (
                <Button
                  key={f.key}
                  size="small"
                  variant={selectedFundamento === f.key ? 'contained' : 'outlined'}
                  onClick={() => setSelectedFundamento(f.key)}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    py: 0.4,
                    px: 1.25,
                    borderRadius: 1.5,
                    boxShadow: 'none',
                    borderColor: selectedFundamento === f.key ? f.color : '#cbd5e1',
                    bgcolor: selectedFundamento === f.key ? f.color : 'transparent',
                    color: selectedFundamento === f.key ? '#ffffff' : '#475569',
                    '&:hover': {
                      bgcolor: selectedFundamento === f.key ? f.color : '#f1f5f9',
                    },
                  }}
                >
                  {f.label}
                </Button>
              ))}
            </Box>

            <ButtonGroup size="small" sx={{ flexShrink: 0 }}>
              <Button
                variant={chartType === 'line' ? 'contained' : 'outlined'}
                onClick={() => setChartType('line')}
                startIcon={<ShowChartIcon fontSize="small" />}
                sx={{ textTransform: 'none', fontSize: '0.75rem', boxShadow: 'none' }}
              >
                Linhas
              </Button>
              <Button
                variant={chartType === 'bar' ? 'contained' : 'outlined'}
                onClick={() => setChartType('bar')}
                startIcon={<BarChartIcon fontSize="small" />}
                sx={{ textTransform: 'none', fontSize: '0.75rem', boxShadow: 'none' }}
              >
                Barras
              </Button>
            </ButtonGroup>
          </Box>
        )}

        {/* Recharts Canvas */}
        <Box sx={{ width: '100%', height: 340, mt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 0 ? (
              <ComposedChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="notaGeralGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="data"
                  stroke="#64748b"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  domain={[0, 10]}
                  stroke="#64748b"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    return (
                      <Box
                        sx={{
                          bgcolor: '#ffffff',
                          p: 1.75,
                          borderRadius: 2,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.1)',
                          maxWidth: 280,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {item.periodo} ({item.dataCompleta})
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 700 }}>
                            Nota Geral: {item.notaGeral.toFixed(1)} / 10{' '}
                            {item.variacaoNota !== 0 && (
                              <span style={{ fontSize: '0.75rem', marginLeft: 4 }}>
                                ({item.variacaoNota > 0 ? `+${item.variacaoNota}` : item.variacaoNota})
                              </span>
                            )}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#0284c7', fontWeight: 600 }}>
                            Média Fundamentos (0–10): {item.mediaTecnica10.toFixed(1)} / 10
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Média Escala Técnica (1–5): {item.mediaFundamentos5.toFixed(2)} / 5.0
                          </Typography>
                        </Box>
                        {item.observacoes && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 1,
                              pt: 1,
                              borderTop: '1px solid #f1f5f9',
                              color: '#475569',
                              fontStyle: 'italic',
                            }}
                          >
                            "{item.observacoes.length > 110 ? item.observacoes.slice(0, 110) + '...' : item.observacoes}"
                          </Typography>
                        )}
                      </Box>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <ReferenceLine
                  y={8.0}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Meta Categoria (8.0)',
                    position: 'insideTopRight',
                    fill: '#64748b',
                    fontSize: 11,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="notaGeral"
                  name="Nota Geral (0–10)"
                  stroke="#16a34a"
                  strokeWidth={3}
                  fill="url(#notaGeralGrad)"
                  dot={{ r: 5, fill: '#16a34a', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="mediaTecnica10"
                  name="Média Técnica Equivalente (0–10)"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#0284c7', strokeWidth: 1.5, stroke: '#ffffff' }}
                />
              </ComposedChart>
            ) : activeTab === 1 && chartType === 'line' ? (
              <AreaChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="data" stroke="#64748b" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#64748b" tick={{ fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: 12,
                  }}
                  formatter={(value: any, name: any) => [`${Number(value).toFixed(1)} / 5.0`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <ReferenceLine
                  y={3.5}
                  stroke="#d97706"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Limiar de Atenção (3.5)',
                    position: 'insideBottomRight',
                    fill: '#b45309',
                    fontSize: 11,
                  }}
                />
                {activeFundamentosList.map((f) => (
                  <Area
                    key={f.key}
                    type="monotone"
                    dataKey={f.key}
                    name={f.label}
                    stroke={f.color}
                    fill={f.color}
                    fillOpacity={selectedFundamento === 'todos' ? 0.04 : 0.18}
                    strokeWidth={selectedFundamento === 'todos' ? 2.5 : 3.5}
                    dot={{ r: 4.5, fill: f.color, strokeWidth: 1.5, stroke: '#ffffff' }}
                    activeDot={{ r: 6.5 }}
                  />
                ))}
              </AreaChart>
            ) : activeTab === 1 && chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="data" stroke="#64748b" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#64748b" tick={{ fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                  formatter={(value: any, name: any) => [`${Number(value).toFixed(1)} / 5.0`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                {activeFundamentosList.map((f) => (
                  <Bar
                    key={f.key}
                    dataKey={f.key}
                    name={f.label}
                    fill={f.color}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={42}
                  />
                ))}
              </BarChart>
            ) : activeTab === 2 ? (
              <RadarChart cx="50%" cy="50%" outerRadius="74%" data={radarComparisonData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="fundamento" tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                  formatter={(value: any, name: any) => [`${Number(value).toFixed(1)} / 5.0`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {historicoAluno.length > 1 && (
                  <Radar
                    name={`1ª Avaliação (${chartData[0]?.data})`}
                    dataKey="inicial"
                    stroke="#64748b"
                    fill="#94a3b8"
                    fillOpacity={0.25}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                )}
                <Radar
                  name={`Última Avaliação (${chartData[chartData.length - 1]?.data})`}
                  dataKey="atual"
                  stroke="#16a34a"
                  fill="#16a34a"
                  fillOpacity={0.35}
                  strokeWidth={2.5}
                />
              </RadarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="data" stroke="#64748b" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Line
                  type="monotone"
                  dataKey="velocidade"
                  name="Sprint 30m (s)"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="agilidade"
                  name="Shuttle Run (s)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 4.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="forca"
                  name="Salto Vertical (cm)"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  dot={{ r: 4.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="resistenciaKm"
                  name="Cooper (km)"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  dot={{ r: 4.5 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>

        {/* Historical Technical Score Matrix (Tabular Numerals) */}
        <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid #f1f5f9' }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <TrackChangesIcon fontSize="small" sx={{ color: '#0284c7' }} />
            Matriz Histórica de Notas por Avaliação
          </Typography>

          <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <Table size="small" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.76rem' }}>
                    Período / Data
                  </TableCell>
                  {fundamentosConfig.map((f) => (
                    <TableCell
                      key={f.key}
                      align="right"
                      sx={{ fontWeight: 700, color: '#475569', fontSize: '0.76rem' }}
                    >
                      {f.label}
                    </TableCell>
                  ))}
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.76rem', bgcolor: '#f1f5f9' }}
                  >
                    Nota Geral
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row: any, idx: number) => (
                  <TableRow
                    key={row.id || idx}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      bgcolor: idx === chartData.length - 1 ? 'rgba(22, 163, 74, 0.04)' : 'inherit',
                    }}
                  >
                    <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                      {row.periodo}
                      <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontFamily: 'monospace' }}>
                        {row.dataCompleta}
                      </Typography>
                    </TableCell>
                    {fundamentosConfig.map((f) => {
                      const val = Number(row[f.key] || 0);
                      const prevVal = idx > 0 ? Number((chartData[idx - 1] as any)[f.key] || 0) : null;
                      const delta = prevVal !== null ? Number((val - prevVal).toFixed(1)) : null;

                      return (
                        <TableCell key={f.key} align="right" sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                          <Box component="span" sx={{ fontWeight: 700, color: val <= 3.5 ? '#b45309' : '#0f172a' }}>
                            {val.toFixed(1)}
                          </Box>
                          {delta !== null && delta !== 0 && (
                            <Box
                              component="span"
                              sx={{
                                ml: 0.5,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: delta > 0 ? '#16a34a' : '#dc2626',
                              }}
                            >
                              {delta > 0 ? `+${delta}` : delta}
                            </Box>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell
                      align="right"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '0.86rem',
                        color: '#16a34a',
                        bgcolor: 'rgba(22, 163, 74, 0.06)',
                      }}
                    >
                      {row.notaGeral.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  );
};
