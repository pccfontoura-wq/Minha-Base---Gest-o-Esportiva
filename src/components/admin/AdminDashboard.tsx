import React from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Avatar, LinearProgress, Stack 
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PaidIcon from '@mui/icons-material/Paid';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardProps {
  onNavigate?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { 
    tenant, alunos, turmas, cobrancas, 
    avaliacoes, filiais 
  } = useAuth();

  const alunosAtivos = alunos.filter(a => a.status === 'ativo');
  const turmasCampo = turmas.filter(t => t.modalidade === 'campo');
  const turmasFutsal = turmas.filter(t => t.modalidade === 'futsal');

  const totalArrecadado = cobrancas
    .filter(c => c.status === 'pago')
    .reduce((acc, c) => acc + c.valor, 0);

  const totalPendente = cobrancas
    .filter(c => c.status === 'pendente')
    .reduce((acc, c) => acc + c.valor, 0);

  const nav = onNavigate || (() => {});

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Welcome Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Painel Geral do Gestor • {tenant.nome}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Controle de matrículas, turmas de campo e futsal, presença e recebimentos PIX em tempo real.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CampaignIcon />}
            onClick={() => nav('admin-comunicados')}
            size="small"
          >
            Novo Comunicado
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleIcon />}
            onClick={() => nav('admin-alunos-responsaveis')}
            size="small"
          >
            Matricular Aluno
          </Button>
        </Box>
      </Box>

      {/* Metric Cards Grid */}
      <Grid container spacing={2.5}>
        {/* Card 1: Total Alunos */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #1b5e20' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Alunos Matriculados
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(27, 94, 32, 0.1)', color: '#1b5e20', width: 38, height: 38 }}>
                  <GroupsIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {alunosAtivos.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', mt: 0.5 }}>
                ● 100% ativos nas turmas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Turmas Campo & Futsal */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #0284c7' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Turmas Ativas
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', width: 38, height: 38 }}>
                  <SportsSoccerIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {turmas.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <span>🌱 {turmasCampo.length} Campo</span> • <span>⚡ {turmasFutsal.length} Futsal</span>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Arrecadação PIX */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #16a34a' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Mensalidades Pagas
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', width: 38, height: 38 }}>
                  <PaidIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a' }}>
                R$ {totalArrecadado.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
                Pendente: R$ {totalPendente.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 4: Filiais & Avaliações */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #f59e0b' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Boletins & Avaliações
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: 38, height: 38 }}>
                  <AssessmentIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {avaliacoes.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
                Em {filiais.length} filiais ativas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Sections: Quick Actions & Live Financial PIX Feed */}
      <Grid container spacing={3}>
        {/* Left Column: Turmas & Capacidade */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Turmas e Ocupação de Vagas
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Distribuição de atletas por modalidade e horário
                  </Typography>
                </Box>
                <Button size="small" onClick={() => nav('admin-categorias-turmas')}>
                  Gerenciar Turmas
                </Button>
              </Box>

              <Stack spacing={2.5}>
                {turmas.map((t) => {
                  const alunosDaTurma = alunos.filter(a => a.turmaId === t.id);
                  const ocupacao = Math.round((alunosDaTurma.length / (t.vagasMaximas || 20)) * 100);

                  return (
                    <Box key={t.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #f1f5f9' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={t.modalidade === 'campo' ? '🌱 Campo' : '⚡ Futsal'}
                            size="small"
                            sx={{
                              bgcolor: t.modalidade === 'campo' ? '#dcfce7' : '#e0f2fe',
                              color: t.modalidade === 'campo' ? '#15803d' : '#0369a1',
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {t.nome}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                          {alunosDaTurma.length} / {t.vagasMaximas} atletas ({ocupacao}%)
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={ocupacao}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#e2e8f0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: ocupacao > 85 ? '#ea580c' : '#1b5e20',
                            borderRadius: 4,
                          },
                        }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          📅 {t.diasHorarios.map(d => `${d.diaSemana} (${d.horaInicio}-${d.horaFim})`).join(', ')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          📍 {filiais.find(f => f.id === t.filialId)?.nome.split('-')[0] || 'Unidade Principal'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Recent Cobranças PIX */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Controle de Mensalidades PIX
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Status em tempo real por atleta
                  </Typography>
                </Box>
                <Button size="small" onClick={() => nav('admin-cobrancas')}>
                  Ver Financeiro
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Atleta</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Valor</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cobrancas.slice(0, 5).map((cob) => {
                      const aluno = alunos.find(a => a.id === cob.alunoId);
                      return (
                        <TableRow key={cob.id} hover>
                          <TableCell sx={{ py: 1.2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar src={aluno?.fotoUrl} sx={{ width: 28, height: 28 }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                  {aluno?.nome || 'Atleta'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                  {cob.mesReferencia}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            R$ {cob.valor.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {cob.status === 'pago' && (
                              <Chip
                                icon={<CheckCircleIcon fontSize="small" />}
                                label="Pago"
                                size="small"
                                color="success"
                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                              />
                            )}
                            {cob.status === 'pendente' && (
                              <Chip
                                icon={<AccessTimeIcon fontSize="small" />}
                                label="Pendente"
                                size="small"
                                color="warning"
                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                              />
                            )}
                            {cob.status === 'atrasado' && (
                              <Chip
                                icon={<ErrorIcon fontSize="small" />}
                                label="Atrasado"
                                size="small"
                                color="error"
                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
