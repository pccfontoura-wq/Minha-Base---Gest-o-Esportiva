import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, CircularProgress, Chip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

interface TTSPlayerProps {
  text: string;
  title?: string;
  targetAudience?: string;
  variant?: 'icon' | 'chip' | 'button';
}

export const TTSPlayer: React.FC<TTSPlayerProps> = ({ 
  text, 
  title = 'Ouvir comunicado', 
  targetAudience, 
  variant = 'icon' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta síntese de voz (TTS).');
      return;
    }

    try {
      setLoading(true);

      // Enhance text with server-side AI if available
      let speechText = text;
      try {
        const res = await fetch('/api/ai/generate-speech-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetAudience }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.script) speechText = data.script;
        }
      } catch (err) {
        console.warn('Using direct text for TTS:', err);
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Select Portuguese voice if available
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(v => v.lang.includes('pt') || v.lang.includes('PT'));
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onstart = () => {
        setLoading(false);
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setLoading(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setLoading(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('TTS error:', error);
      setLoading(false);
      setIsPlaying(false);
    }
  };

  if (variant === 'chip') {
    return (
      <Chip
        icon={loading ? <CircularProgress size={16} /> : isPlaying ? <StopIcon /> : <VolumeUpIcon />}
        label={isPlaying ? 'Parar Áudio' : title}
        color={isPlaying ? 'secondary' : 'default'}
        variant={isPlaying ? 'filled' : 'outlined'}
        size="small"
        onClick={handleSpeak}
        sx={{ cursor: 'pointer', fontWeight: 600 }}
      />
    );
  }

  return (
    <Tooltip title={isPlaying ? 'Parar leitura em áudio' : `Ouvir com voz narradora: ${title}`}>
      <IconButton
        size="small"
        color={isPlaying ? 'secondary' : 'primary'}
        onClick={handleSpeak}
        sx={{
          bgcolor: isPlaying ? 'rgba(245, 158, 11, 0.15)' : 'rgba(27, 94, 32, 0.08)',
          '&:hover': {
            bgcolor: isPlaying ? 'rgba(245, 158, 11, 0.25)' : 'rgba(27, 94, 32, 0.15)',
          },
        }}
      >
        {loading ? (
          <CircularProgress size={18} color="inherit" />
        ) : isPlaying ? (
          <StopIcon fontSize="small" />
        ) : (
          <VolumeUpIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
};
