import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Alert, InputAdornment,
  IconButton, LinearProgress
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../context/AuthContext';

interface TrocarSenhaDialogProps {
  open: boolean;
  onClose: () => void;
}

export const TrocarSenhaDialog: React.FC<TrocarSenhaDialogProps> = ({ open, onClose }) => {
  const { user, trocarSenha } = useAuth();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [showNova, setShowNova] = useState(false);
  const [showConfirma, setShowConfirma] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setNovaSenha('');
    setConfirmaSenha('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (novaSenha.length < 6) {
      setError('A nova senha deve possuir pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmaSenha) {
      setError('A confirmação de senha não coincide com a nova senha digitada.');
      return;
    }

    setLoading(true);
    try {
      const res = await trocarSenha(novaSenha);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError(res.error || 'Erro ao alterar senha.');
      }
    } catch (err: any) {
      setError('Erro ao salvar nova senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <LockResetIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Alterar Senha de Acesso
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            Usuário: <b>{user.username || user.email}</b> ({user.nome})
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Senha alterada com sucesso!</Alert>}

          <TextField
            id="modal-input-nova-senha"
            label="Nova Senha"
            type={showNova ? 'text' : 'password'}
            fullWidth
            required
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNova(!showNova)} edge="end" size="small">
                      {showNova ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          <TextField
            id="modal-input-confirma-senha"
            label="Confirmar Nova Senha"
            type={showConfirma ? 'text' : 'password'}
            fullWidth
            required
            value={confirmaSenha}
            onChange={(e) => setConfirmaSenha(e.target.value)}
            error={confirmaSenha.length > 0 && novaSenha !== confirmaSenha}
            helperText={confirmaSenha.length > 0 && novaSenha !== confirmaSenha ? 'Senhas não coincidem' : ''}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirma(!showConfirma)} edge="end" size="small">
                      {showConfirma ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancelar
          </Button>
          <Button
            id="modal-btn-confirmar-troca-senha"
            type="submit"
            variant="contained"
            disabled={loading || novaSenha.length < 6 || novaSenha !== confirmaSenha}
            sx={{ fontWeight: 700 }}
          >
            {loading ? 'Salvando...' : 'Salvar Nova Senha'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
