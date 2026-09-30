import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, TextField, 
  FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress, 
  Alert, Stack, Avatar 
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useAuth } from '../../context/AuthContext';
import { TTSPlayer } from '../common/TTSPlayer';

export const AnaliseFotoAtleta: React.FC = () => {
  const { alunos } = useAuth();
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>(alunos[0]?.id || '');
  const [imagemBase64, setImagemBase64] = useState<string | null>(null);
  const [tipoAnalise, setTipoAnalise] = useState('Biomecânica de chute e postura');
  const [contextoExtra, setContextoExtra] = useState('Analisar postura do pé de apoio e tronco no momento do chute/passe.');
  
  const [loading, setLoading] = useState(false);
  const [analiseResultado, setAnaliseResultado] = useState<string | null>(null);

  const selectedAluno = alunos.find(a => a.id === selectedAlunoId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async () => {
    if (!imagemBase64) return;
    setLoading(true);
    setAnaliseResultado(null);

    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagemBase64,
          type: 'posture',
          extraContext: `Atleta: ${selectedAluno?.nome || 'Atleta'}, Posição: ${selectedAluno?.posicaoPreferida || 'Meia'}. Foco: ${tipoAnalise}. ${contextoExtra}`
        })
      });

      const data = await res.json();
      if (data.analysis) {
        setAnaliseResultado(data.analysis);
      }
    } catch (err: any) {
      setAnaliseResultado('Erro ao analisar imagem: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon color="secondary" />
          Análise Biomecânica e Postural por Visão Computacional
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Utilize fotos de treinos e jogos para avaliar postura corporal, pé de apoio, alinhamento do tronco e biomecânica do gesto técnico.
        </Typography>
      </Box>

      {/* Form and Image Upload */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3.5, height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                1. Configuração da Análise
              </Typography>

              <FormControl fullWidth size="small">
                <InputLabel>Atleta</InputLabel>
                <Select
                  value={selectedAlunoId}
                  label="Atleta"
                  onChange={(e) => setSelectedAlunoId(e.target.value)}
                >
                  {alunos.map(a => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.nome} (#{a.numeroCamisa || 10})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Foco da Análise"
                size="small"
                fullWidth
                value={tipoAnalise}
                onChange={(e) => setTipoAnalise(e.target.value)}
                placeholder="Ex: Posição do pé de apoio no chute, postura na arrancada..."
              />

              <TextField
                label="Observações Adicionais para a IA"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={contextoExtra}
                onChange={(e) => setContextoExtra(e.target.value)}
              />

              {/* Upload Dropzone */}
              <Box
                sx={{
                  p: 3,
                  border: '2px dashed #cbd5e1',
                  borderRadius: 3,
                  textAlign: 'center',
                  bgcolor: '#f8fafc',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <AddPhotoAlternateIcon sx={{ fontSize: 40, color: '#1b5e20', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Clique para carregar a foto do atleta
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  PNG ou JPG de momentos do treino, chute, drible ou salto
                </Typography>
              </Box>

              {/* Quick sample button */}
              <Button
                size="small"
                variant="text"
                onClick={() => setImagemBase64(selectedAluno?.fotoUrl || 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=400&auto=format&fit=crop&q=80')}
                sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
              >
                Usar foto de perfil do atleta ({selectedAluno?.nome})
              </Button>

              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handleRunAnalysis}
                disabled={!imagemBase64 || loading}
                sx={{ fontWeight: 700, mt: 1 }}
              >
                {loading ? 'Analisando Postura com Gemini...' : 'Executar Análise com IA'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Image Preview & Output */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3.5, height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                2. Imagem do Gesto Técnico & Feedback
              </Typography>

              {imagemBase64 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#0f172a', borderRadius: 3, p: 1, overflow: 'hidden' }}>
                  <img
                    src={imagemBase64}
                    alt="Atleta em ação"
                    style={{ maxHeight: 220, borderRadius: 8, objectFit: 'contain' }}
                  />
                </Box>
              ) : (
                <Box sx={{ height: 200, bgcolor: '#f8fafc', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Nenhuma foto carregada ainda
                  </Typography>
                </Box>
              )}

              {analiseResultado && (
                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #cbd5e1', mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1b5e20' }}>
                      🔬 Diagnóstico Técnico & Correções:
                    </Typography>
                    <TTSPlayer text={analiseResultado} title="Ouvir análise" variant="chip" />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                    {analiseResultado}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
