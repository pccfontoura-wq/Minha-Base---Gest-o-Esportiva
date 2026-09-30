import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, TextField, 
  FormControl, InputLabel, Select, MenuItem, Chip, 
  CircularProgress, Alert, Stack, Divider 
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimerIcon from '@mui/icons-material/Timer';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import { TTSPlayer } from '../common/TTSPlayer';

export const PlanoDeTreinoIA: React.FC = () => {
  const [modalidade, setModalidade] = useState<'campo' | 'futsal'>('campo');
  const [categoria, setCategoria] = useState('Sub-11 (10-11 anos)');
  const [objetivo, setObjetivo] = useState('Transição ofensiva rápida e finalização com 1 ou 2 toques');
  const [tempoTotal, setTempoTotal] = useState(90);
  const [numAtletas, setNumAtletas] = useState(16);

  const [loading, setLoading] = useState(false);
  const [drillPlan, setDrillPlan] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setDrillPlan(null);
    setSources([]);

    try {
      const prompt = `Crie um plano completo e dinâmico de treino de futebol para a categoria ${categoria}, modalidade ${modalidade === 'campo' ? 'Futebol de Campo' : 'Futsal'}.
Tempo disponível: ${tempoTotal} minutos.
Número de atletas: ${numAtletas} jogadores.
Objetivo principal do treino: ${objetivo}.

Estruture a resposta de forma muito clara com:
1. Aquecimento lúdico e ativação neural (15 min)
2. Exercício Parte Principal 1 - Técnico / Fundamentos em circuito (25 min)
3. Exercício Parte Principal 2 - Tático / Situação Real de Jogo Reduzido (35 min)
4. Volta à calma e conversa motivacional (15 min)
Inclua regras de pontuação, variações e incentivo pedagógico.`;

      const res = await fetch('/api/ai/search-drills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt }),
      });

      const data = await res.json();
      if (data.answer) {
        setDrillPlan(data.answer);
        if (data.groundingMetadata?.groundingChunks) {
          setSources(data.groundingMetadata.groundingChunks);
        }
      }
    } catch (err: any) {
      setDrillPlan('Erro ao gerar plano de treino: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />
            Gerador de Plano de Treino IA (Metodologia CBF/UEFA)
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            IA conectada à web para formular treinos modernos de futebol de campo e futsal conforme a idade.
          </Typography>
        </Box>
      </Box>

      {/* Configuration Grid */}
      <Card sx={{ borderRadius: 3.5 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Modalidade</InputLabel>
                <Select
                  value={modalidade}
                  label="Modalidade"
                  onChange={(e) => setModalidade(e.target.value as any)}
                >
                  <MenuItem value="campo">🌱 Futebol de Campo</MenuItem>
                  <MenuItem value="futsal">⚡ Futsal</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoria / Faixa Etária</InputLabel>
                <Select
                  value={categoria}
                  label="Categoria / Faixa Etária"
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <MenuItem value="Sub-7 (Iniciação / 6-7 anos)">Sub-7 (Iniciação)</MenuItem>
                  <MenuItem value="Sub-9 (8-9 anos)">Sub-9 (Fundamentos)</MenuItem>
                  <MenuItem value="Sub-11 (10-11 anos)">Sub-11 (Transição)</MenuItem>
                  <MenuItem value="Sub-13 (12-13 anos)">Sub-13 (Tático Inicial)</MenuItem>
                  <MenuItem value="Sub-15 (14-15 anos)">Sub-15 (Competitivo)</MenuItem>
                  <MenuItem value="Sub-17 (16-17 anos)">Sub-17 (Alto Rendimento)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Duração Total (Minutos)"
                type="number"
                size="small"
                value={tempoTotal}
                onChange={(e) => setTempoTotal(Number(e.target.value))}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Qtd Atletas Previstos"
                type="number"
                size="small"
                value={numAtletas}
                onChange={(e) => setNumAtletas(Number(e.target.value))}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Objetivo Técnico/Tático da Sessão de Treino"
                fullWidth
                size="small"
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="Ex: Passe rápido sob pressão, cobertura defensiva 3x2, finalizações de primeira"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
              onClick={handleGeneratePlan}
              disabled={loading}
              sx={{ px: 4, fontWeight: 700 }}
            >
              {loading ? 'Consultando IA e Metodologias...' : 'Gerar Sessão de Treino com IA'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Generated Drill Plan Result */}
      {drillPlan && (
        <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                📋 Ficha de Treino Estruturada
              </Typography>
              <TTSPlayer text={drillPlan} title="Leitura da Sessão de Treino" />
            </Box>

            <Alert severity="success" icon={<SportsSoccerIcon />} sx={{ mb: 2.5, borderRadius: 2.5 }}>
              Plano gerado com foco em <strong>{modalidade === 'campo' ? 'Futebol de Campo' : 'Futsal'}</strong> para <strong>{categoria}</strong> ({tempoTotal} min / {numAtletas} atletas).
            </Alert>

            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-line',
                lineHeight: 1.8,
                color: '#1e293b',
                p: 2.5,
                bgcolor: '#f8fafc',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                fontFamily: 'inherit'
              }}
            >
              {drillPlan}
            </Typography>

            {sources.length > 0 && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <SearchIcon fontSize="small" />
                  Fontes & Metodologias Consultadas na Web:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {sources.map((src, idx) => (
                    <Chip
                      key={idx}
                      label={src.web?.title || 'Metodologia Esportiva'}
                      size="small"
                      component="a"
                      href={src.web?.uri}
                      target="_blank"
                      clickable
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
