import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Avatar, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, FormControl, InputLabel, Select, 
  MenuItem, Tooltip, Alert, CircularProgress 
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext';
import { Cobranca } from '../../types';
import confetti from 'canvas-confetti';

export const CobrancasManager: React.FC = () => {
  const { 
    cobrancas, alunos, tenant, marcarCobrancaComoPaga, 
    addCobranca 
  } = useAuth();

  const [statusFilter, setStatusFilter] = useState<'todos' | 'pago' | 'pendente' | 'atrasado'>('todos');
  
  // PIX Modal
  const [selectedPixCob, setSelectedPixCob] = useState<Cobranca | null>(null);
  const [copied, setCopied] = useState(false);

  // New Cobranca Modal
  const [openNewCobModal, setOpenNewCobModal] = useState(false);
  const [newAlunoId, setNewAlunoId] = useState('');
  const [newMes, setNewMes] = useState('Setembro/2026');
  const [newValor, setNewValor] = useState(220);
  const [newVencimento, setNewVencimento] = useState('2026-09-10');

  // AI Receipt Audit Modal
  const [openAiAuditModal, setOpenAiAuditModal] = useState(false);
  const [auditCob, setAuditCob] = useState<Cobranca | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [aiAuditing, setAiAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<string | null>(null);

  const totalRecebido = cobrancas.filter(c => c.status === 'pago').reduce((a, b) => a + b.valor, 0);
  const totalPendente = cobrancas.filter(c => c.status === 'pendente').reduce((a, b) => a + b.valor, 0);
  const totalAtrasado = cobrancas.filter(c => c.status === 'atrasado').reduce((a, b) => a + b.valor, 0);

  const filteredCobrancas = cobrancas.filter(c => {
    if (statusFilter === 'todos') return true;
    return c.status === statusFilter;
  });

  const handleCopyPix = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = async (cobId: string) => {
    await marcarCobrancaComoPaga(cobId);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    if (selectedPixCob?.id === cobId) setSelectedPixCob(null);
  };

  const handleCreateCobranca = async () => {
    if (!newAlunoId) return;

    const chavePix = tenant.chavePixPadrao || 'financeiro@escolinha.com.br';
    const pixPayload = `00020126580014br.gov.bcb.pix0136${chavePix}520400005303986540${Number(newValor).toFixed(2)}5802BR5925${tenant.nome.substring(0, 25)}6009SAO PAULO62070503***6304`;

    await addCobranca({
      alunoId: newAlunoId,
      mesReferencia: newMes,
      valor: Number(newValor),
      vencimento: newVencimento,
      status: 'pendente',
      metodoPagamento: 'pix',
      chavePix,
      linkPix: pixPayload
    });

    setOpenNewCobModal(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAiAudit = async () => {
    if (!receiptImage || !auditCob) return;

    setAiAuditing(true);
    setAiAuditResult(null);

    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: receiptImage,
          type: 'receipt',
          extraContext: `Mensalidade esperada: R$ ${auditCob.valor.toFixed(2)} para o aluno ID ${auditCob.alunoId}`
        })
      });

      const data = await res.json();
      if (data.analysis) {
        setAiAuditResult(data.analysis);
      }
    } catch (err: any) {
      setAiAuditResult('Erro ao conectar com a IA: ' + err.message);
    } finally {
      setAiAuditing(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Cobrança de Mensalidades & PIX
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Controle de pagamentos, geração de link PIX Copia e Cola, QR Code e auditoria com IA.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setNewAlunoId(alunos[0]?.id || '');
            setOpenNewCobModal(true);
          }}
        >
          Gerar Cobrança Individual
        </Button>
      </Box>

      {/* Financial Overview Cards */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 3.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ color: '#166534', fontWeight: 700 }}>
                Total Recebido no Mês
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
                R$ {totalRecebido.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                ✓ {cobrancas.filter(c => c.status === 'pago').length} mensalidades quitadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 3.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ color: '#92400e', fontWeight: 700 }}>
                A Receber (Pendentes)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#d97706', mt: 0.5 }}>
                R$ {totalPendente.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600 }}>
                ⏳ {cobrancas.filter(c => c.status === 'pendente').length} aguardando vencimento
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 3.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ color: '#991b1b', fontWeight: 700 }}>
                Em Atraso / Inadimplente
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>
                R$ {totalAtrasado.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 600 }}>
                ⚠️ {cobrancas.filter(c => c.status === 'atrasado').length} faturas vencidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip
          label="Todas as Cobranças"
          onClick={() => setStatusFilter('todos')}
          color={statusFilter === 'todos' ? 'primary' : 'default'}
          variant={statusFilter === 'todos' ? 'filled' : 'outlined'}
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label="Pagas"
          onClick={() => setStatusFilter('pago')}
          color={statusFilter === 'pago' ? 'success' : 'default'}
          variant={statusFilter === 'pago' ? 'filled' : 'outlined'}
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label="Pendentes"
          onClick={() => setStatusFilter('pendente')}
          color={statusFilter === 'pendente' ? 'warning' : 'default'}
          variant={statusFilter === 'pendente' ? 'filled' : 'outlined'}
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label="Em Atraso"
          onClick={() => setStatusFilter('atrasado')}
          color={statusFilter === 'atrasado' ? 'error' : 'default'}
          variant={statusFilter === 'atrasado' ? 'filled' : 'outlined'}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Cobranças Table */}
      <TableContainer component={Card} sx={{ borderRadius: 3.5 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Atleta & Referência</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Valor</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Vencimento</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Comprovante / IA</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCobrancas.map((cob) => {
              const aluno = alunos.find(a => a.id === cob.alunoId);

              return (
                <TableRow key={cob.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={aluno?.fotoUrl} sx={{ width: 36, height: 36 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {aluno?.nome || 'Atleta'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Mês: {cob.mesReferencia}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>
                    R$ {cob.valor.toFixed(2)}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                      {new Date(cob.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {cob.status === 'pago' && (
                      <Chip
                        label={`Pago em ${cob.dataPagamento ? new Date(cob.dataPagamento + 'T12:00:00').toLocaleDateString('pt-BR') : 'OK'}`}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 700, height: 24, fontSize: '0.75rem' }}
                      />
                    )}
                    {cob.status === 'pendente' && (
                      <Chip
                        label="Pendente"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 700, height: 24, fontSize: '0.75rem' }}
                      />
                    )}
                    {cob.status === 'atrasado' && (
                      <Chip
                        label="Em Atraso"
                        color="error"
                        size="small"
                        sx={{ fontWeight: 700, height: 24, fontSize: '0.75rem' }}
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    {cob.aiReceiptCheck ? (
                      <Tooltip title={cob.aiReceiptCheck}>
                        <Chip
                          icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important' }} />}
                          label="Comprovante Auditado IA"
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </Tooltip>
                    ) : (
                      <Button
                        size="small"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={() => {
                          setAuditCob(cob);
                          setReceiptImage(null);
                          setAiAuditResult(null);
                          setOpenAiAuditModal(true);
                        }}
                        sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                      >
                        Auditar com IA
                      </Button>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<QrCode2Icon />}
                        onClick={() => setSelectedPixCob(cob)}
                        sx={{ borderRadius: 2 }}
                      >
                        Ver PIX
                      </Button>

                      {cob.status !== 'pago' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleConfirmPayment(cob.id)}
                          sx={{ borderRadius: 2 }}
                        >
                          Baixar
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PIX Modal Dialog */}
      <Dialog
        open={Boolean(selectedPixCob)}
        onClose={() => setSelectedPixCob(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        {selectedPixCob && (
          <>
            <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pb: 1 }}>
              📱 Cobrança PIX Instantânea
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 1 }}>
              <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center' }}>
                Escolinha: <strong>{tenant.nome}</strong> • Favorecido: <strong>{selectedPixCob.chavePix || tenant.chavePixPadrao}</strong>
              </Typography>

              <Box
                sx={{
                  p: 2.5,
                  bgcolor: '#ffffff',
                  borderRadius: 4,
                  border: '2px dashed #16a34a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                }}
              >
                <Box
                  sx={{
                    width: 190,
                    height: 190,
                    bgcolor: '#0f172a',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    p: 2,
                    textAlign: 'center',
                  }}
                >
                  <QrCode2Icon sx={{ fontSize: 90, color: '#4ade80' }} />
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                    PIX QR CODE DINÂMICO
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                    R$ {selectedPixCob.valor.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 800, color: '#15803d' }}>
                R$ {selectedPixCob.valor.toFixed(2)}
              </Typography>

              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Referência: {selectedPixCob.mesReferencia} • Vencimento: {new Date(selectedPixCob.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
              </Typography>

              {/* PIX Copy and Paste Code */}
              <Box sx={{ width: '100%' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                  Chave PIX Copia e Cola:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={selectedPixCob.linkPix || '00020126580014br.gov.bcb.pix0136financeiro@escolinha.com.br520400005303986540220.005802BR5925ESCOLA6009SAOPAULO62070503***6304'}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <Button
                          size="small"
                          variant="contained"
                          color={copied ? 'success' : 'primary'}
                          startIcon={<ContentCopyIcon />}
                          onClick={() => handleCopyPix(selectedPixCob.linkPix || '')}
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
              <Button onClick={() => setSelectedPixCob(null)} color="inherit">
                Fechar
              </Button>
              {selectedPixCob.status !== 'pago' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleConfirmPayment(selectedPixCob.id)}
                >
                  Confirmar Pagamento Recebido
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* New Cobrança Dialog */}
      <Dialog
        open={openNewCobModal}
        onClose={() => setOpenNewCobModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          ➕ Emitir Cobrança de Mensalidade
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <FormControl fullWidth required>
            <InputLabel>Atleta / Aluno</InputLabel>
            <Select
              value={newAlunoId}
              label="Atleta / Aluno"
              onChange={(e) => setNewAlunoId(e.target.value)}
            >
              {alunos.map(a => (
                <MenuItem key={a.id} value={a.id}>
                  {a.nome} (#{a.numeroCamisa || 10})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Mês de Referência"
            value={newMes}
            onChange={(e) => setNewMes(e.target.value)}
            fullWidth
            placeholder="Ex: Outubro/2026"
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Valor (R$)"
                type="number"
                value={newValor}
                onChange={(e) => setNewValor(Number(e.target.value))}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Data de Vencimento"
                type="date"
                value={newVencimento}
                onChange={(e) => setNewVencimento(e.target.value)}
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenNewCobModal(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={handleCreateCobranca}>
            Gerar Cobrança PIX
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Receipt Audit Dialog */}
      <Dialog
        open={openAiAuditModal}
        onClose={() => setOpenAiAuditModal(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon color="primary" />
          Auditoria Visual de Comprovante PIX com Gemini AI
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Faça upload do print ou foto do comprovante bancário enviado pelo responsável para validação automática de dados, valor e autenticidade.
          </Typography>

          <Box
            sx={{
              p: 3,
              border: '2px dashed #cbd5e1',
              borderRadius: 3.5,
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
              onChange={handleImageUpload}
            />
            <CloudUploadIcon sx={{ fontSize: 44, color: '#1b5e20', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Clique para selecionar a imagem do comprovante
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              PNG, JPG ou WebP de comprovantes bancários (Nubank, Itaú, Bradesco, etc.)
            </Typography>
          </Box>

          {receiptImage && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={receiptImage}
                alt="Comprovante"
                style={{ maxHeight: 220, borderRadius: 12, border: '1px solid #e2e8f0' }}
              />
            </Box>
          )}

          {receiptImage && (
            <Button
              variant="contained"
              color="primary"
              startIcon={aiAuditing ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
              onClick={handleRunAiAudit}
              disabled={aiAuditing}
              sx={{ alignSelf: 'center' }}
            >
              {aiAuditing ? 'Analisando Comprovante com IA...' : 'Executar Análise de Comprovante'}
            </Button>
          )}

          {aiAuditResult && (
            <Alert severity="info" sx={{ borderRadius: 3, whiteSpace: 'pre-line' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Resultado da Análise por Visão Computacional:
              </Typography>
              {aiAuditResult}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenAiAuditModal(false)} color="inherit">
            Fechar
          </Button>
          {aiAuditResult && auditCob && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={async () => {
                await marcarCobrancaComoPaga(auditCob.id, receiptImage || undefined, aiAuditResult);
                setOpenAiAuditModal(false);
                confetti({ particleCount: 50 });
              }}
            >
              Aprovar Pagamento e Salvar Auditoria
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
