import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, Chip, 
  Avatar, Stack, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Divider, 
  Tabs, Tab 
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, LineChart, Line, 
  XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { TTSPlayer } from '../common/TTSPlayer';
import { Cobranca } from '../../types';
import confetti from 'canvas-confetti';

export const ResponsavelDashboard: React.FC = () => {
  const { 
    user, alunos, responsaveis, turmas, avaliacoes, cobrancas, comunicados, 
    treinos, presencasMap, tenant, marcarCobrancaComoPaga 
  } = useAuth();

  // Find all children linked to this parent (or all if master/admin testing)
  const currentResp = responsaveis.find(r => r.id === user.id || r.email === user.email || r.id === user.username);
  const meusFilhos = user.papel === 'responsavel'
    ? alunos.filter(a => 
        a.responsavelId === user.id || 
        a.responsavelId === user.username || 
        (currentResp && (a.responsavelId === currentResp.id || currentResp.alunosIds?.includes(a.id))) ||
        (user.username === 'marcos.fontes' && (a.id === 'aluno-gabriel' || a.id === 'aluno-davi')) ||
        (user.username === 'ana.lima' && a.id === 'aluno-enzo')
      )
    : alunos;
  const [selectedChildId, setSelectedChildId] = useState<string>(meusFilhos[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'geral' | 'desempenho' | 'financeiro' | 'presenca'>('geral');

  // PIX Modal
  const [selectedPix, setSelectedPix] = useState<Cobranca | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedChild = alunos.find(a => a.id === selectedChildId) || meusFilhos[0];
  const turmaFilho = turmas.find(t => t.id === selectedChild?.turmaId);
  const avaliacoesFilho = avaliacoes.filter(a => a.alunoId === selectedChild?.id);
  const cobrancasFilho = cobrancas.filter(c => c.alunoId === selectedChild?.id);

  // Latest evaluation
  const latestAvaliacao = avaliacoesFilho[avaliacoesFilho.length - 1];

  // Calculate child's attendance rate
  let totalSessoes = 0;
  let totalPresente = 0;
  Object.values(presencasMap).forEach(sessionMap => {
    if (selectedChild && sessionMap[selectedChild.id]) {
      totalSessoes++;
      if (sessionMap[selectedChild.id].status === 'presente') totalPresente++;
    }
  });
  const presencaPercent = totalSessoes > 0 ? Math.round((totalPresente / totalSessoes) * 100) : 95;

  // Evolution chart data
  const evolucaoData = avaliacoesFilho.map((av) => ({
    data: new Date(av.data + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    nota: av.notaGeral,
    velocidade: av.testesFisicos?.velocidade30m || 4.8,
  }));

  // If only 1 evaluation exists, add a simulated baseline
  if (evolucaoData.length === 1) {
    evolucaoData.unshift({
      data: 'Mar/26',
      nota: Math.max(5, (latestAvaliacao?.notaGeral || 7) - 1.2),
      velocidade: 5.1,
    });
  }

  // Radar data for latest evaluation
  const radarData = latestAvaliacao?.fundamentosCampo ? [
    { subject: 'Passe', nota: latestAvaliacao.fundamentosCampo.passe },
    { subject: 'Drible', nota: latestAvaliacao.fundamentosCampo.drible },
    { subject: 'Chute', nota: latestAvaliacao.fundamentosCampo.chute },
    { subject: 'Cabeceio', nota: latestAvaliacao.fundamentosCampo.cabeceio },
    { subject: 'Posicionamento', nota: latestAvaliacao.fundamentosCampo.posicionamento },
    { subject: 'Domínio', nota: latestAvaliacao.fundamentosCampo.dominioBola },
    { subject: 'Visão', nota: latestAvaliacao.fundamentosCampo.visaoJogo || 4.5 },
  ] : (latestAvaliacao?.fundamentosFutsal ? [
    { subject: 'Controle', nota: latestAvaliacao.fundamentosFutsal.controleEspacoReduzido },
    { subject: 'Passe Curto', nota: latestAvaliacao.fundamentosFutsal.passeCurto },
    { subject: 'Finalização', nota: latestAvaliacao.fundamentosFutsal.finalizacao },
    { subject: 'Pisão (Sola)', nota: latestAvaliacao.fundamentosFutsal.dominioPisao },
    { subject: 'Visão', nota: latestAvaliacao.fundamentosFutsal.visaoJogo },
    { subject: 'Pressão', nota: latestAvaliacao.fundamentosFutsal.marcacaoPressao },
  ] : [
    { subject: 'Passe', nota: 4.5 },
    { subject: 'Drible', nota: 4.0 },
    { subject: 'Chute', nota: 4.2 },
    { subject: 'Cabeceio', nota: 3.8 },
    { subject: 'Posição', nota: 4.6 },
    { subject: 'Domínio', nota: 4.8 },
  ]);

  const handleCopyPix = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePay = async (id: string) => {
    await marcarCobrancaComoPaga(id);
    confetti({ particleCount: 70 });
    setSelectedPix(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Header with Child Switcher */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Área dos Pais & Responsáveis
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Acompanhe o desenvolvimento esportivo, frequência nos treinos e mensalidades do seu atleta.
          </Typography>
        </Box>

        {/* Children selector chips */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {meusFilhos.map((f) => (
            <Chip
              key={f.id}
              avatar={<Avatar src={f.fotoUrl} />}
              label={`${f.nome} (#${f.numeroCamisa || 10})`}
              onClick={() => setSelectedChildId(f.id)}
              color={selectedChild?.id === f.id ? 'primary' : 'default'}
              variant={selectedChild?.id === f.id ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700, p: 0.5, height: 36 }}
            />
          ))}
        </Box>
      </Box>

      {/* Selected Athlete Hero Profile Card */}
      {selectedChild && (
        <Card sx={{ bgcolor: 'linear-gradient(135deg, #1b5e20 0%, #0f3813 100%)', borderRadius: 4, overflow: 'hidden', border: '1px solid #16a34a' }}>
          <Box sx={{ p: 3, bgcolor: '#1b5e20', color: '#ffffff', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar
                src={selectedChild.fotoUrl}
                sx={{ width: 80, height: 80, border: '3px solid #4ade80', boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {selectedChild.nome}
                  </Typography>
                  <Chip
                    label={`#${selectedChild.numeroCamisa || 10}`}
                    size="small"
                    sx={{ bgcolor: '#4ade80', color: '#052e16', fontWeight: 900 }}
                  />
                </Box>

                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  {turmaFilho?.nome || 'Turma Sub-11'} • {selectedChild.posicaoPreferida || 'Meia'} ({selectedChild.peDominante})
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={selectedChild.modalidade === 'campo' ? '🌱 Futebol de Campo' : '⚡ Futsal'}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#ffffff', fontWeight: 600, height: 22 }}
                  />
                  <Chip
                    label={`Frequência: ${presencaPercent}%`}
                    size="small"
                    sx={{ bgcolor: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', fontWeight: 700, height: 22 }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ bgcolor: 'rgba(0,0,0,0.25)', p: 2, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)', textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" sx={{ color: '#86efac', fontWeight: 700, textTransform: 'uppercase' }}>
                Nota Geral Atual
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffffff' }}>
                {latestAvaliacao?.notaGeral || 8.8} <span style={{ fontSize: '1rem', color: '#86efac' }}>/ 10</span>
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Última avaliação: {latestAvaliacao ? new Date(latestAvaliacao.data + 'T12:00:00').toLocaleDateString('pt-BR') : 'Recente'}
              </Typography>
            </Box>
          </Box>
        </Card>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab value="geral" label="Visão Geral & Boletim" sx={{ fontWeight: 700 }} />
          <Tab value="desempenho" label="Evolução Técnica & Gráficos" sx={{ fontWeight: 700 }} />
          <Tab value="financeiro" label={`Mensalidades & PIX (${cobrancasFilho.filter(c => c.status !== 'pago').length} pendentes)`} sx={{ fontWeight: 700 }} />
          <Tab value="presenca" label="Histórico de Treinos & Presenças" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {/* Tab: Geral & Boletim */}
      {activeTab === 'geral' && (
        <Grid container spacing={3}>
          {/* Latest AI / Coach Pedagogical Feedback */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ borderRadius: 3.5, height: '100%' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    📝 Parecer Pedagógico do Treinador
                  </Typography>
                  {latestAvaliacao?.aiFeedback && (
                    <TTSPlayer text={latestAvaliacao.aiFeedback} title="Ouvir Boletim" variant="chip" />
                  )}
                </Box>

                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                    {latestAvaliacao?.aiFeedback || latestAvaliacao?.observacoesTreinador || 'Atleta com excelente assiduidade e dedicação nos treinos técnicos.'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* Highlights */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1b5e20' }}>
                  ⭐ Destaques dos Testes Motores:
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                        Velocidade 30m
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
                        {latestAvaliacao?.testesFisicos?.velocidade30m || 4.7}s
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                        Resistência
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
                        {latestAvaliacao?.testesFisicos?.resistenciaCooper || 2100}m
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                        Shuttle Run
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
                        {latestAvaliacao?.testesFisicos?.agilidadeShuttleRun || 9.9}s
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2.5, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                        Salto Vertical
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
                        {latestAvaliacao?.testesFisicos?.forcaSaltoVertical || 35}cm
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Radar Chart summary */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ borderRadius: 3.5, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>
                  🕸️ Geometria dos Fundamentos
                </Typography>
                <Box sx={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Radar
                        name="Nota"
                        dataKey="nota"
                        stroke="#16a34a"
                        fill="#16a34a"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* School Communications for the parent */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 3.5 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CampaignIcon color="primary" />
                  Mural de Avisos da Escolinha
                </Typography>

                <Stack spacing={2}>
                  {comunicados.slice(0, 3).map(com => (
                    <Box key={com.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, borderLeft: '4px solid #1b5e20' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {com.titulo}
                        </Typography>
                        <TTSPlayer text={com.mensagem} title={com.titulo} variant="chip" />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#475569' }}>
                        {com.mensagem}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1 }}>
                        Publicado em {new Date(com.dataEnvio).toLocaleDateString('pt-BR')} • {com.autor}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab: Evolução Técnica & Gráficos */}
      {activeTab === 'desempenho' && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 3.5 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  Histórico de Evolução das Avaliações Técnicas
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                  Progressão da média geral de fundamentos e testes de velocidade ao longo dos bimestres.
                </Typography>

                <Box sx={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolucaoData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="data" stroke="#64748b" />
                      <YAxis domain={[0, 10]} stroke="#64748b" />
                      <ChartTooltip contentStyle={{ borderRadius: 12, border: '1px solid #cbd5e1' }} />
                      <Line
                        type="monotone"
                        dataKey="nota"
                        name="Nota Geral (0 a 10)"
                        stroke="#16a34a"
                        strokeWidth={3}
                        dot={{ r: 6, fill: '#16a34a' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab: Mensalidades & PIX */}
      {activeTab === 'financeiro' && (
        <Stack spacing={2.5}>
          {cobrancasFilho.map((cob) => (
            <Card key={cob.id} sx={{ borderRadius: 3.5, borderLeft: cob.status === 'pago' ? '5px solid #16a34a' : cob.status === 'atrasado' ? '5px solid #dc2626' : '5px solid #f59e0b' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      Mensalidade: {cob.mesReferencia}
                    </Typography>
                    {cob.status === 'pago' && <Chip label="Pago" color="success" size="small" sx={{ fontWeight: 700 }} />}
                    {cob.status === 'pendente' && <Chip label="Pendente" color="warning" size="small" sx={{ fontWeight: 700 }} />}
                    {cob.status === 'atrasado' && <Chip label="Em Atraso" color="error" size="small" sx={{ fontWeight: 700 }} />}
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#15803d', mt: 1 }}>
                    R$ {cob.valor.toFixed(2)}
                  </Typography>

                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                    Vencimento: {new Date(cob.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')} • Beneficiário: {tenant.nome}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<QrCode2Icon />}
                    onClick={() => setSelectedPix(cob)}
                    sx={{ fontWeight: 700, borderRadius: 2.5 }}
                  >
                    Pagar com PIX
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Tab: Presença & Treinos */}
      {activeTab === 'presenca' && (
        <Card sx={{ borderRadius: 3.5 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonthIcon color="primary" />
              Diário de Frequência e Notificações de Treinos
            </Typography>

            <Stack spacing={2}>
              {treinos.filter(t => t.turmaId === selectedChild?.turmaId).map((t) => {
                const sessionRecord = presencasMap[t.id]?.[selectedChild?.id || ''];
                const status = sessionRecord?.status || 'presente';

                return (
                  <Box key={t.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        📅 Treino em {new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR')} - {t.tema}
                      </Typography>
                      {sessionRecord?.observacao && (
                        <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600, display: 'block', mt: 0.3 }}>
                          💬 Nota do Professor: "{sessionRecord.observacao}"
                        </Typography>
                      )}
                    </Box>

                    <Chip
                      label={status === 'presente' ? '✓ Presente' : status === 'falta' ? '✗ Falta' : '⏳ Falta Justificada'}
                      color={status === 'presente' ? 'success' : status === 'falta' ? 'error' : 'warning'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* PIX Payment Modal for Parents */}
      <Dialog
        open={Boolean(selectedPix)}
        onClose={() => setSelectedPix(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        {selectedPix && (
          <>
            <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>
              📱 Pagamento PIX - {selectedPix.mesReferencia}
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 1 }}>
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: '#ffffff',
                  borderRadius: 4,
                  border: '2px dashed #16a34a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                }}
              >
                <Box
                  sx={{
                    width: 180,
                    height: 180,
                    bgcolor: '#0f172a',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <QrCode2Icon sx={{ fontSize: 90, color: '#4ade80' }} />
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    PIX QR CODE
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 900, color: '#15803d' }}>
                R$ {selectedPix.valor.toFixed(2)}
              </Typography>

              <Typography variant="caption" sx={{ color: '#64748b', textAlign: 'center' }}>
                Escolinha: <strong>{tenant.nome}</strong> • Chave: <strong>{tenant.chavePixPadrao}</strong>
              </Typography>

              <Box sx={{ width: '100%' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                  Código PIX Copia e Cola:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={selectedPix.linkPix || '00020126580014br.gov.bcb.pix0136financeiro@escolinha.com.br520400005303986540220.005802BR5920ESCOLA6009SAOPAULO62070503***6304'}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <Button
                          size="small"
                          variant="contained"
                          color={copied ? 'success' : 'primary'}
                          startIcon={<ContentCopyIcon />}
                          onClick={() => handleCopyPix(selectedPix.linkPix || '')}
                          sx={{ ml: 1, whiteSpace: 'nowrap' }}
                        >
                          {copied ? 'Copiado!' : 'Copiar'}
                        </Button>
                      ),
                    },
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
              <Button onClick={() => setSelectedPix(null)} color="inherit">
                Fechar
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handlePay(selectedPix.id)}
              >
                Informar Pagamento Realizado
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
