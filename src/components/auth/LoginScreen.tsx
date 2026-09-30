import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  InputAdornment, IconButton, Alert, Chip, Divider,
  CircularProgress, Collapse
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import BusinessIcon from '@mui/icons-material/Business';
import SportsIcon from '@mui/icons-material/Sports';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import EmailIcon from '@mui/icons-material/Email';
import LockResetIcon from '@mui/icons-material/LockReset';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

const MAX_TENTATIVAS = 3;

export const LoginScreen: React.FC = () => {
  const { login, recuperarAcessoPorEmail } = useAuth();

  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 3-Attempt Lockout & Recovery State
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [showRecoveryPanel, setShowRecoveryPanel] = useState<boolean>(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState<string>('');
  const [recoveryLoading, setRecoveryLoading] = useState<boolean>(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryData, setRecoveryData] = useState<{
    nome: string;
    username: string;
    email: string;
    instituicaoNome: string;
    senhaTemporaria: string;
  } | null>(null);

  const isLockedOut = failedAttempts >= MAX_TENTATIVAS;
  const remainingAttempts = Math.max(0, MAX_TENTATIVAS - failedAttempts);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLockedOut) {
      setShowRecoveryPanel(true);
      setErrorMessage(
        'Limite de 3 tentativas excedido! Utilize a opção abaixo para recuperar sua senha ou login pelo e-mail cadastrado.'
      );
      return;
    }

    if (!identificador.trim() || !senha) {
      setErrorMessage('Por favor, informe seu usuário/e-mail e sua senha.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(identificador.trim(), senha);
      if (!res.success) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= MAX_TENTATIVAS) {
          setShowRecoveryPanel(true);
          setErrorMessage(
            `Você errou as 3 tentativas permitidas (${nextAttempts}/${MAX_TENTATIVAS}). Por segurança, o login foi bloqueado. Recupere sua senha ou login pelo e-mail cadastrado abaixo.`
          );
        } else {
          const restam = MAX_TENTATIVAS - nextAttempts;
          setErrorMessage(
            `${res.error || 'Credenciais inválidas.'} (Tentativa ${nextAttempts} de ${MAX_TENTATIVAS} — ${
              restam === 1 ? 'resta apenas 1 tentativa' : `restam ${restam} tentativas`
            }).`
          );
        }
      } else {
        setFailedAttempts(0);
      }
    } catch {
      setErrorMessage('Ocorreu um erro ao conectar ao sistema. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperarPorEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoveryData(null);

    if (!emailRecuperacao.trim()) {
      setRecoveryError('Informe o e-mail cadastrado na sua conta.');
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await recuperarAcessoPorEmail(emailRecuperacao.trim());
      if (!res.success || !res.recoveryInfo) {
        setRecoveryError(res.error || 'E-mail não localizado no cadastro.');
      } else {
        setRecoveryData(res.recoveryInfo);
      }
    } catch {
      setRecoveryError('Erro ao processar recuperação por e-mail.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleApplyRecoveredCredentials = () => {
    if (!recoveryData) return;
    setIdentificador(recoveryData.username);
    setSenha(recoveryData.senhaTemporaria);
    setFailedAttempts(0);
    setErrorMessage(null);
    setShowRecoveryPanel(false);
    setRecoveryData(null);
  };

  const handleFillCredentials = (userLogin: string, pass: string) => {
    setIdentificador(userLogin);
    setSenha(pass);
    setErrorMessage(null);
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Rings */}
      <Box
        sx={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          border: '1px solid rgba(34, 197, 94, 0.08)',
          top: '-15%',
          right: '-10%',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          border: '1px dashed rgba(34, 197, 94, 0.06)',
          bottom: '-10%',
          left: '-5%',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 540, zIndex: 1 }}
      >
        <Card
          id="card-login-escola"
          elevation={12}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.12)',
            bgcolor: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Top Brand Banner */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1b5e20 0%, #0f3915 100%)',
              p: { xs: 3, sm: 3.5 },
              color: '#ffffff',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '16px',
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              }}
            >
              <SportsSoccerIcon sx={{ fontSize: 34, color: '#ffffff' }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 0.5 }}>
              Minha Base - Gestão Esportiva
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.85rem' }}>
              Plataforma de Gestão de Futebol & Futsal de Base
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label="Acesso por Instituição Vinculada"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
              <Chip
                label={`Tentativas: ${failedAttempts}/${MAX_TENTATIVAS}`}
                size="small"
                icon={<LockOutlinedIcon sx={{ fontSize: '14px !important', color: isLockedOut ? '#fca5a5 !important' : '#86efac !important' }} />}
                sx={{
                  bgcolor: isLockedOut ? 'rgba(220, 38, 38, 0.45)' : 'rgba(0,0,0,0.25)',
                  color: isLockedOut ? '#fecaca' : '#86efac',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Entrar na sua Conta
              </Typography>
              {failedAttempts > 0 && !isLockedOut && (
                <Chip
                  size="small"
                  color="warning"
                  label={`Restam ${remainingAttempts} tentativa(s)`}
                  sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
              Digite seu login e senha. O sistema identificará e abrirá automaticamente a sua instituição vinculada.
            </Typography>

            {errorMessage && (
              <Alert
                severity={isLockedOut ? 'warning' : 'error'}
                icon={isLockedOut ? <WarningAmberIcon /> : undefined}
                sx={{
                  mb: 2.5,
                  borderRadius: 2.5,
                  fontSize: '0.85rem',
                  alignItems: 'center',
                  border: isLockedOut ? '1px solid #f59e0b' : undefined,
                }}
              >
                {errorMessage}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                <TextField
                  id="input-usuario-login"
                  label="Usuário ou E-mail"
                  placeholder="Digite seu usuário ou e-mail cadastrado"
                  fullWidth
                  required
                  disabled={isLockedOut}
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  id="input-senha-login"
                  label="Senha de Acesso"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha de acesso"
                  fullWidth
                  required
                  disabled={isLockedOut}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon sx={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            id="btn-toggle-senha"
                            aria-label="alternar visualização de senha"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            disabled={isLockedOut}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: -0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Limite de segurança: <b>{MAX_TENTATIVAS} tentativas</b>
                  </Typography>
                  <Button
                    id="btn-abrir-recuperacao-email"
                    size="small"
                    variant="text"
                    startIcon={<LockResetIcon fontSize="small" />}
                    onClick={() => setShowRecoveryPanel((prev) => !prev)}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: isLockedOut ? '#d97706' : '#1b5e20',
                    }}
                  >
                    Recuperar senha ou login por e-mail
                  </Button>
                </Box>

                <Button
                  id="btn-submeter-login"
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading || isLockedOut}
                  sx={{
                    py: 1.5,
                    bgcolor: '#1b5e20',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    borderRadius: 2.5,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(27, 94, 32, 0.35)',
                    '&:hover': {
                      bgcolor: '#144618',
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Autenticando...</span>
                    </Box>
                  ) : isLockedOut ? (
                    'Acesso Bloqueado (3 Tentativas Excedidas)'
                  ) : (
                    'Entrar no Sistema'
                  )}
                </Button>
              </Box>
            </form>

            {/* Password & Login Recovery by Registered Email Panel (Auto-opens on 3 failed attempts) */}
            <Collapse in={showRecoveryPanel || isLockedOut}>
              <Box
                id="painel-recuperacao-acesso"
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: isLockedOut ? '#fffbeb' : '#f8fafc',
                  border: isLockedOut ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LockResetIcon sx={{ color: isLockedOut ? '#d97706' : '#1b5e20' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {isLockedOut
                      ? 'Bloqueio após 3 tentativas: Recupere sua Senha ou Login'
                      : 'Recuperação de Senha ou Login pelo E-mail Cadastrado'}
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 2 }}>
                  Informe abaixo o seu <b>e-mail cadastrado</b> na instituição para recuperar seu nome de usuário (login), instituição vinculada e senha de acesso.
                </Typography>

                {recoveryError && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8rem' }}>
                    {recoveryError}
                  </Alert>
                )}

                {recoveryData ? (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: '#dcfce7',
                      border: '1px solid #22c55e',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircleIcon sx={{ color: '#15803d', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#14532d' }}>
                        Dados de recuperação enviados para {recoveryData.email}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#166534', display: 'block', mb: 0.5 }}>
                      • <b>Usuário:</b> {recoveryData.nome}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#166534', display: 'block', mb: 0.5 }}>
                      • <b>Instituição Vinculada:</b> {recoveryData.instituicaoNome}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#166534', display: 'block', mb: 0.5 }}>
                      • <b>Login Cadastrado:</b> <code>{recoveryData.username}</code>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#166534', display: 'block', mb: 1.5 }}>
                      • <b>Senha Recuperada:</b> <code>{recoveryData.senhaTemporaria}</code>
                    </Typography>
                    <Button
                      id="btn-usar-dados-recuperados"
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={handleApplyRecoveredCredentials}
                      sx={{
                        bgcolor: '#15803d',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#166534' },
                      }}
                    >
                      Desbloquear e Preencher Credenciais no Login
                    </Button>
                  </Box>
                ) : (
                  <form onSubmit={handleRecuperarPorEmail}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                      <TextField
                        id="input-email-recuperacao"
                        size="small"
                        type="email"
                        label="Seu E-mail Cadastrado"
                        placeholder="Digite seu e-mail cadastrado"
                        fullWidth
                        required
                        value={emailRecuperacao}
                        onChange={(e) => setEmailRecuperacao(e.target.value)}
                        sx={{ bgcolor: '#ffffff' }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon fontSize="small" sx={{ color: '#64748b' }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                      <Button
                        id="btn-enviar-recuperacao-email"
                        type="submit"
                        variant="contained"
                        disabled={recoveryLoading}
                        sx={{
                          bgcolor: isLockedOut ? '#d97706' : '#0284c7',
                          color: '#ffffff',
                          fontWeight: 700,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          px: 2.5,
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: isLockedOut ? '#b45309' : '#0369a1',
                          },
                        }}
                      >
                        {recoveryLoading ? 'Buscando...' : 'Recuperar Acesso'}
                      </Button>
                    </Box>
                  </form>
                )}
              </Box>
            </Collapse>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, px: 1 }}>
                CONTAS DE ACESSO RÁPIDO (DEMO)
              </Typography>
            </Divider>

            {/* Quick Demo Access Badges (Institution Users Only - No Master Credentials Exposed) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Admin, Coach and Parent Quick shortcuts */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.2 }}>
                <Box
                  id="btn-quick-login-admin"
                  onClick={() => handleFillCredentials('admin', 'admin123')}
                  sx={{
                    p: 1.1,
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    bgcolor: '#f8fafc',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f1f5f9' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 18, color: '#1e293b' }} />
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#0f172a' }}>
                      Admin Instituição
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                      admin / admin123
                    </Typography>
                  </Box>
                </Box>

                <Box
                  id="btn-quick-login-coach"
                  onClick={() => handleFillCredentials('carlos.silva', 'treinador123')}
                  sx={{
                    p: 1.1,
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    bgcolor: '#f8fafc',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f1f5f9' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <SportsIcon sx={{ fontSize: 18, color: '#0284c7' }} />
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#0f172a' }}>
                      Prof. Treinador
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                      carlos.silva / treinador123
                    </Typography>
                  </Box>
                </Box>

                <Box
                  id="btn-quick-login-parent"
                  onClick={() => handleFillCredentials('marcos.fontes', 'pais123')}
                  sx={{
                    p: 1.1,
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    bgcolor: '#f8fafc',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f1f5f9' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <FamilyRestroomIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#0f172a' }}>
                      Pai / Responsável
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                      marcos.fontes / pais123
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};
