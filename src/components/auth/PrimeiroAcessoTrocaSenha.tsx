import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  InputAdornment, IconButton, Alert, LinearProgress, List,
  ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export const PrimeiroAcessoTrocaSenha: React.FC = () => {
  const { user, trocarSenha, logout, tenant } = useAuth();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [showNova, setShowNova] = useState(false);
  const [showConfirma, setShowConfirma] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Criteria calculations
  const hasMinLength = novaSenha.length >= 6;
  const isNotDefault = novaSenha.toLowerCase() !== 'senha123';
  const passwordsMatch = novaSenha === confirmaSenha && novaSenha.length > 0;
  const hasNumbers = /\d/.test(novaSenha);
  const hasLetters = /[a-zA-Z]/.test(novaSenha);

  // Password score (0 to 100)
  const calculateStrength = () => {
    if (!novaSenha) return 0;
    let score = 0;
    if (hasMinLength) score += 30;
    if (isNotDefault) score += 20;
    if (hasNumbers) score += 25;
    if (hasLetters) score += 25;
    return score;
  };

  const strength = calculateStrength();

  const getStrengthColor = () => {
    if (strength < 50) return '#ef4444';
    if (strength < 80) return '#f59e0b';
    return '#22c55e';
  };

  const getStrengthLabel = () => {
    if (strength === 0) return 'Digite sua nova senha';
    if (strength < 50) return 'Fraca (adicione mais caracteres)';
    if (strength < 80) return 'Boa';
    return 'Excelente e Segura!';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!hasMinLength) {
      setErrorMessage('A nova senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    if (!isNotDefault) {
      setErrorMessage('A nova senha não pode ser a senha padrão provisória "senha123". Escolha uma senha pessoal.');
      return;
    }

    if (novaSenha !== confirmaSenha) {
      setErrorMessage('A confirmação não coincide com a nova senha digitada.');
      return;
    }

    setLoading(true);
    try {
      const res = await trocarSenha(novaSenha);
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMessage(res.error || 'Erro ao alterar a senha. Tente novamente.');
      }
    } catch (err: any) {
      setErrorMessage('Ocorreu um erro ao salvar a nova senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #091e11 0%, #0f2e1b 50%, #081a0f 100%)',
        p: { xs: 2, sm: 3 },
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 560 }}
      >
        <Card
          id="card-troca-senha-obrigatoria"
          elevation={12}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
              p: 3,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <SecurityIcon sx={{ fontSize: 30, color: '#93c5fd' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.3 }}>
                Primeiro Acesso ao Sistema
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                Troca obrigatória de senha de segurança
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Alert
              severity="info"
              icon={<LockResetIcon />}
              sx={{
                mb: 3,
                borderRadius: 2.5,
                bgcolor: '#eff6ff',
                color: '#1e3a8a',
                border: '1px solid #bfdbfe',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Olá, {user.nome}!
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                Você realizou o primeiro acesso com a senha provisória inicial (<b>{user.email}</b>). 
                Por segurança, defina agora a sua <b>nova senha pessoal</b> para liberar o acesso irrestrito ao sistema.
              </Typography>
            </Alert>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {success ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 60, color: '#16a34a', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                  Senha atualizada com sucesso!
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                  Seu acesso foi liberado com privilégios de Administrador Master.
                </Typography>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <TextField
                      id="input-nova-senha"
                      label="Nova Senha Pessoal"
                      type={showNova ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      fullWidth
                      required
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                id="btn-toggle-nova-senha"
                                onClick={() => setShowNova(!showNova)}
                                edge="end"
                                size="small"
                              >
                                {showNova ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }
                      }}
                    />

                    {/* Password strength bar */}
                    {novaSenha && (
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Força da senha:
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: getStrengthColor() }}>
                            {getStrengthLabel()}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={strength}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getStrengthColor(),
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  <TextField
                    id="input-confirma-nova-senha"
                    label="Confirmar Nova Senha"
                    type={showConfirma ? 'text' : 'password'}
                    placeholder="Repita a nova senha"
                    fullWidth
                    required
                    value={confirmaSenha}
                    onChange={(e) => setConfirmaSenha(e.target.value)}
                    error={confirmaSenha.length > 0 && novaSenha !== confirmaSenha}
                    helperText={
                      confirmaSenha.length > 0 && novaSenha !== confirmaSenha
                        ? 'As senhas digitadas não coincidem'
                        : ''
                    }
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              id="btn-toggle-confirma-senha"
                              onClick={() => setShowConfirma(!showConfirma)}
                              edge="end"
                              size="small"
                            >
                              {showConfirma ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    }}
                  />

                  {/* Requirements checklist */}
                  <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1 }}>
                      Critérios de Segurança:
                    </Typography>
                    <List dense disablePadding>
                      <ListItem disableGutters sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 26 }}>
                          {hasMinLength ? (
                            <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                          ) : (
                            <CancelIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="caption"
                              sx={{
                                color: hasMinLength ? '#16a34a' : '#64748b',
                                fontWeight: hasMinLength ? 600 : 400,
                              }}
                            >
                              No mínimo 6 caracteres
                            </Typography>
                          }
                        />
                      </ListItem>

                      <ListItem disableGutters sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 26 }}>
                          {isNotDefault && novaSenha.length > 0 ? (
                            <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                          ) : (
                            <CancelIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="caption"
                              sx={{
                                color: isNotDefault && novaSenha.length > 0 ? '#16a34a' : '#64748b',
                                fontWeight: isNotDefault && novaSenha.length > 0 ? 600 : 400,
                              }}
                            >
                              Diferente da senha provisória padrão (senha123)
                            </Typography>
                          }
                        />
                      </ListItem>

                      <ListItem disableGutters sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 26 }}>
                          {passwordsMatch ? (
                            <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                          ) : (
                            <CancelIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="caption"
                              sx={{
                                color: passwordsMatch ? '#16a34a' : '#64748b',
                                fontWeight: passwordsMatch ? 600 : 400,
                              }}
                            >
                              Confirmação de senha idêntica
                            </Typography>
                          }
                        />
                      </ListItem>
                    </List>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Button
                      id="btn-cancelar-primeiro-acesso"
                      variant="outlined"
                      color="inherit"
                      onClick={logout}
                      startIcon={<LogoutIcon />}
                      sx={{
                        flex: 1,
                        py: 1.25,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        color: '#64748b',
                      }}
                    >
                      Sair / Cancelar
                    </Button>

                    <Button
                      id="btn-salvar-nova-senha"
                      type="submit"
                      variant="contained"
                      disabled={loading || !hasMinLength || !isNotDefault || !passwordsMatch}
                      sx={{
                        flex: 2,
                        py: 1.25,
                        borderRadius: 2.5,
                        bgcolor: '#1e3a8a',
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        '&:hover': { bgcolor: '#172554' },
                      }}
                    >
                      {loading ? 'Salvando...' : 'Salvar Nova Senha e Acessar'}
                    </Button>
                  </Box>
                </Box>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};
