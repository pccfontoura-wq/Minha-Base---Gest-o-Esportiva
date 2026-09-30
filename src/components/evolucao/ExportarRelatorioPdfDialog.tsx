import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip,
  Divider,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { jsPDF } from 'jspdf';
import {
  Aluno,
  Turma,
  Categoria,
  Responsavel,
  AvaliacaoTecnica,
  DicaTreino,
  Tenant,
  Usuario,
} from '../../types';

interface FundamentoScoreItem {
  chave: string;
  nome: string;
  notaInicial: number;
  notaAtual: number;
  evolucao: number;
}

interface ExportarRelatorioPdfDialogProps {
  open: boolean;
  onClose: () => void;
  tenant: Tenant;
  user: Usuario;
  aluno?: Aluno;
  turma?: Turma;
  categoria?: Categoria;
  responsavel?: Responsavel;
  isCampo: boolean;
  historicoAluno: AvaliacaoTecnica[];
  dicasRecomendadas: DicaTreino[];
}

const FUNDAMENTOS_CAMPO_META = [
  { key: 'passe', label: 'Passe (Curto e Longo)' },
  { key: 'drible', label: 'Drible / 1v1' },
  { key: 'chute', label: 'Chute / Finalização' },
  { key: 'cabeceio', label: 'Cabeceio' },
  { key: 'posicionamento', label: 'Posicionamento Tático' },
  { key: 'dominioBola', label: 'Domínio de Bola' },
];

const FUNDAMENTOS_FUTSAL_META = [
  { key: 'controleEspacoReduzido', label: 'Controle em Espaço Reduzido' },
  { key: 'passeCurto', label: 'Passe Curto & Tabela' },
  { key: 'finalizacao', label: 'Finalização Rápida' },
  { key: 'dominioBola', label: 'Domínio de Bola (Pisada)' },
  { key: 'visaoJogo', label: 'Visão de Jogo em Quadra' },
];

function extractFundamentoNota(av: AvaliacaoTecnica | null, key: string, isCampo: boolean): number {
  if (!av) return 0;
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
}

export const ExportarRelatorioPdfDialog: React.FC<ExportarRelatorioPdfDialogProps> = ({
  open,
  onClose,
  tenant,
  user,
  aluno,
  turma,
  categoria,
  responsavel,
  isCampo,
  historicoAluno,
  dicasRecomendadas,
}) => {
  const [incluirFisicos, setIncluirFisicos] = useState(true);
  const [incluirHistorico, setIncluirHistorico] = useState(true);
  const [incluirDicas, setIncluirDicas] = useState(true);
  const [mensagemPais, setMensagemPais] = useState('');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [pdfGeradoSucesso, setPdfGeradoSucesso] = useState(false);

  const primeiraAvaliacao = historicoAluno.length > 0 ? historicoAluno[0] : null;
  const ultimaAvaliacao = historicoAluno.length > 0 ? historicoAluno[historicoAluno.length - 1] : null;

  // Pre-fill coach note when modal opens or athlete changes
  useEffect(() => {
    if (!aluno) return;
    const obsUltima =
      ultimaAvaliacao?.observacoesTecnico ||
      ultimaAvaliacao?.observacoesTreinador ||
      '';
    const aiFeed = ultimaAvaliacao?.aiFeedback || '';
    const defaultNote = [
      obsUltima ? `Parecer da última avaliação: "${obsUltima}"` : '',
      aiFeed ? `Recomendação pedagógica: ${aiFeed}` : '',
      !obsUltima && !aiFeed
        ? `O atleta ${aluno.nome} vem demonstrando comprometimento e evolução constante nos treinos da categoria ${categoria?.nome || ''}.`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    setMensagemPais(defaultNote);
    setCopiedWhatsApp(false);
    setPdfGeradoSucesso(false);
  }, [aluno, ultimaAvaliacao, categoria, open]);

  // Consolidated fundamentals comparison (First vs Latest)
  const comparativoFundamentos: FundamentoScoreItem[] = useMemo(() => {
    if (!ultimaAvaliacao) return [];
    const metaList = isCampo ? FUNDAMENTOS_CAMPO_META : FUNDAMENTOS_FUTSAL_META;
    return metaList.map((m) => {
      const inicial = extractFundamentoNota(primeiraAvaliacao, m.key, isCampo);
      const atual = extractFundamentoNota(ultimaAvaliacao, m.key, isCampo);
      return {
        chave: m.key,
        nome: m.label,
        notaInicial: inicial,
        notaAtual: atual,
        evolucao: Number((atual - inicial).toFixed(1)),
      };
    });
  }, [primeiraAvaliacao, ultimaAvaliacao, isCampo]);

  const metricasResumo = useMemo(() => {
    if (historicoAluno.length === 0) {
      return { inicial: 0, atual: 0, ganho: 0, media: 0 };
    }
    const inicial = historicoAluno[0].notaGeral;
    const atual = historicoAluno[historicoAluno.length - 1].notaGeral;
    const ganho = Number((atual - inicial).toFixed(1));
    const soma = historicoAluno.reduce((acc, cur) => acc + cur.notaGeral, 0);
    const media = Number((soma / historicoAluno.length).toFixed(1));
    return { inicial, atual, ganho, media };
  }, [historicoAluno]);

  const formatDatePt = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Generate and download PDF using jsPDF
  const handleGerarPdf = () => {
    if (!aluno) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 18) {
        doc.addPage();
        y = 16;
      }
    };

    // 1. Top Club Banner
    doc.setFillColor(27, 94, 32); // #1b5e20
    doc.rect(0, 0, pageWidth, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(tenant.nome.toUpperCase(), margin, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('RELATÓRIO CONSOLIDADO DE EVOLUÇÃO TÉCNICA E FÍSICA DO ATLETA', margin, 20);

    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(8.5);
    doc.text(
      `Emitido em: ${dataEmissao}  |  Avaliador/Treinador: ${user.nome}`,
      margin,
      26.5
    );

    y = 39;

    // 2. Athlete & Parent Identification Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(
      `${aluno.nome} ${aluno.numeroCamisa ? `(#${aluno.numeroCamisa})` : ''}`,
      margin + 4,
      y + 7
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(
      `Modalidade: ${isCampo ? 'Futebol de Campo' : 'Futsal'}   |   Categoria: ${categoria?.nome || 'Base'}   |   Turma: ${turma?.nome || 'Regular'}`,
      margin + 4,
      y + 13.5
    );
    doc.text(
      `Posição: ${aluno.posicaoPreferida || 'Polivalente'}   |   Pé Dominante: ${aluno.peDominante || 'Destro'}   |   Nascimento: ${formatDatePt(aluno.dataNascimento)}`,
      margin + 4,
      y + 19.5
    );
    doc.text(
      `Responsável Legal: ${responsavel?.nome || 'Família do Atleta'} ${responsavel?.telefone ? `(${responsavel.telefone})` : ''}`,
      margin + 4,
      y + 25
    );

    y += 34;

    // 3. Executive Summary KPI Boxes (4 columns)
    const kpiGap = 3;
    const kpiWidth = (contentWidth - kpiGap * 3) / 4;
    const kpis = [
      {
        label: '1ª AVALIAÇÃO',
        value: `${metricasResumo.inicial.toFixed(1)} / 10`,
        sub: primeiraAvaliacao ? formatDatePt(primeiraAvaliacao.data || primeiraAvaliacao.dataAvaliacao) : '-',
        color: [15, 23, 42] as [number, number, number],
      },
      {
        label: 'NOTA GERAL ATUAL',
        value: `${metricasResumo.atual.toFixed(1)} / 10`,
        sub: ultimaAvaliacao ? formatDatePt(ultimaAvaliacao.data || ultimaAvaliacao.dataAvaliacao) : '-',
        color: [22, 163, 74] as [number, number, number],
      },
      {
        label: 'EVOLUÇÃO ACUMULADA',
        value: `${metricasResumo.ganho >= 0 ? '+' : ''}${metricasResumo.ganho.toFixed(1)} pts`,
        sub: `${historicoAluno.length} avaliações no ciclo`,
        color: metricasResumo.ganho >= 0 ? ([22, 163, 74] as [number, number, number]) : ([220, 38, 38] as [number, number, number]),
      },
      {
        label: 'MÉDIA HISTÓRICA',
        value: `${metricasResumo.media.toFixed(1)} / 10`,
        sub: 'Desempenho global',
        color: [2, 132, 199] as [number, number, number],
      },
    ];

    kpis.forEach((kpi, idx) => {
      const xPos = margin + idx * (kpiWidth + kpiGap);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(xPos, y, kpiWidth, 20, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.label, xPos + 3, y + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
      doc.text(kpi.value, xPos + 3, y + 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.sub, xPos + 3, y + 18);
    });

    y += 27;

    // 4. Evolução dos Fundamentos Técnicos (Escala 1.0 a 5.0)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `1. DESEMPENHO POR FUNDAMENTOS TÉCNICOS (${isCampo ? 'CAMPO' : 'FUTSAL'} - ESCALA 1 A 5)`,
      margin,
      y
    );
    y += 4;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 7, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('Fundamento Técnico', margin + 3, y + 4.8);
    doc.text('1ª Aval.', margin + 68, y + 4.8);
    doc.text('Atual', margin + 88, y + 4.8);
    doc.text('Evolução', margin + 106, y + 4.8);
    doc.text('Nível (1 a 5)', margin + 128, y + 4.8);
    doc.text('Status', margin + 160, y + 4.8);
    y += 7;

    comparativoFundamentos.forEach((f, idx) => {
      checkPageBreak(8);
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 7.5, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 7.5, margin + contentWidth, y + 7.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(f.nome, margin + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(f.notaInicial.toFixed(1), margin + 70, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(f.notaAtual.toFixed(1), margin + 89, y + 5);

      const deltaStr = f.evolucao > 0 ? `+${f.evolucao.toFixed(1)}` : f.evolucao.toFixed(1);
      if (f.evolucao > 0) {
        doc.setTextColor(22, 163, 74);
      } else if (f.evolucao < 0) {
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(100, 116, 139);
      }
      doc.text(deltaStr, margin + 108, y + 5);

      // Visual Progress Bar (26mm wide)
      const barX = margin + 128;
      const barY = y + 2.3;
      const barW = 26;
      const barH = 3;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(barX, barY, barW, barH, 1, 1, 'F');

      const fillRatio = Math.max(0, Math.min(1, f.notaAtual / 5));
      if (f.notaAtual <= 3.5) {
        doc.setFillColor(217, 119, 6);
      } else {
        doc.setFillColor(22, 163, 74);
      }
      doc.roundedRect(barX, barY, barW * fillRatio, barH, 1, 1, 'F');

      // Status text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      if (f.notaAtual >= 4.3) {
        doc.setTextColor(22, 163, 74);
        doc.text('Destaque', margin + 160, y + 5);
      } else if (f.notaAtual <= 3.5) {
        doc.setTextColor(180, 83, 9);
        doc.text('Aprimorar', margin + 160, y + 5);
      } else {
        doc.setTextColor(2, 132, 199);
        doc.text('Adequado', margin + 160, y + 5);
      }

      y += 7.5;
    });

    y += 7;

    // 5. Indicadores Físicos (optional)
    if (incluirFisicos && ultimaAvaliacao) {
      checkPageBreak(28);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('2. INDICADORES DE CONDICIONAMENTO FÍSICO (ÚLTIMA AVALIAÇÃO)', margin, y);
      y += 4;

      const tf = (ultimaAvaliacao.testesFisicos || {}) as Record<string, number | undefined>;
      const vel = tf.velocidade ?? tf.velocidade30m ?? tf.velocidadeSprint30m ?? '--';
      const res = tf.resistencia ?? tf.resistenciaCooper ?? '--';
      const agi = tf.agilidade ?? tf.agilidadeShuttleRun ?? '--';
      const forca = tf.forca ?? tf.forcaSaltoVertical ?? '--';

      const physBoxes = [
        { title: 'Velocidade (Sprint 30m)', val: `${vel} seg`, desc: 'Explosão e arranque' },
        { title: 'Resistência (Cooper)', val: `${res} m`, desc: 'Capacidade aeróbica' },
        { title: 'Agilidade (Shuttle Run)', val: `${agi} seg`, desc: 'Mudança de direção' },
        { title: 'Força (Salto Vertical)', val: `${forca} cm`, desc: 'Impulsão muscular' },
      ];

      physBoxes.forEach((p, idx) => {
        const xPos = margin + idx * (kpiWidth + kpiGap);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(xPos, y, kpiWidth, 16, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(p.title, xPos + 2.5, y + 5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(p.val, xPos + 2.5, y + 10.8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(p.desc, xPos + 2.5, y + 14.5);
      });

      y += 23;
    }

    // 6. Histórico Cronológico de Avaliações (optional)
    if (incluirHistorico && historicoAluno.length > 0) {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('3. HISTÓRICO CRONOLÓGICO DE AVALIAÇÕES TÉCNICAS', margin, y);
      y += 4;

      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y, contentWidth, 7, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text('Data', margin + 3, y + 4.8);
      doc.text('Período / Etapa', margin + 26, y + 4.8);
      doc.text('Nota Geral', margin + 80, y + 4.8);
      doc.text('Observação Registrada pelo Treinador', margin + 104, y + 4.8);
      y += 7;

      historicoAluno.forEach((av, idx) => {
        checkPageBreak(10);
        const obs = (av.observacoesTecnico || av.observacoesTreinador || 'Sem observações adicionais.').replace(/\s+/g, ' ');
        const truncatedObs = obs.length > 52 ? obs.slice(0, 52) + '...' : obs;

        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, contentWidth, 7.5, 'F');
        }
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + 7.5, margin + contentWidth, y + 7.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(formatDatePt(av.data || av.dataAvaliacao), margin + 3, y + 5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(av.periodo || `Avaliação ${idx + 1}`, margin + 26, y + 5);

        doc.setTextColor(22, 163, 74);
        doc.text(`${av.notaGeral.toFixed(1)} / 10`, margin + 80, y + 5);

        doc.setFont('helvetica', 'italic');
        doc.setTextColor(71, 85, 105);
        doc.text(truncatedObs, margin + 104, y + 5);

        y += 7.5;
      });

      y += 7;
    }

    // 7. Parecer Pedagógico & Mensagem aos Pais
    if (mensagemPais.trim()) {
      const splitLines = doc.splitTextToSize(mensagemPais.trim(), contentWidth - 8);
      const boxHeight = Math.max(18, splitLines.length * 4.5 + 10);
      checkPageBreak(boxHeight + 10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('PARECER PEDAGÓGICO DO TREINADOR PARA A FAMÍLIA', margin, y);
      y += 4;

      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(134, 239, 172);
      doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(20, 83, 45);
      doc.text(splitLines, margin + 4, y + 6.5);

      y += boxHeight + 7;
    }

    // 8. Recomendações e Dicas de Treino (optional)
    if (incluirDicas && dicasRecomendadas.length > 0) {
      checkPageBreak(32);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('RECOMENDAÇÕES DE TREINO E DESENVOLVIMENTO INDIVIDUAL', margin, y);
      y += 4;

      dicasRecomendadas.slice(0, 3).forEach((dica) => {
        const descLines = doc.splitTextToSize(dica.descricao, contentWidth - 8);
        const itemH = descLines.length * 4.2 + 10;
        checkPageBreak(itemH + 3);

        doc.setFillColor(254, 252, 232);
        doc.setDrawColor(253, 224, 71);
        doc.roundedRect(margin, y, contentWidth, itemH, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(133, 77, 14);
        doc.text(
          `[${dica.fundamentoRelacionado.toUpperCase()}] ${dica.titulo}`,
          margin + 3.5,
          y + 5.2
        );

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(descLines, margin + 3.5, y + 9.8);

        y += itemH + 2.5;
      });
    }

    // 9. Footer & Signature
    checkPageBreak(22);
    y = Math.max(y + 6, pageHeight - 24);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, margin + 75, y);
    doc.line(pageWidth - margin - 75, y, pageWidth - margin, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(user.nome, margin, y + 4.5);
    doc.text(tenant.nome, pageWidth - margin - 75, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Comissão Técnica / Avaliador Responsável', margin, y + 8.5);
    doc.text(
      `${tenant.telefone || ''} ${tenant.email ? `• ${tenant.email}` : ''}`,
      pageWidth - margin - 75,
      y + 8.5
    );

    const safeName = aluno.nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '_');

    doc.save(`Relatorio_Evolucao_${safeName}.pdf`);
    setPdfGeradoSucesso(true);
  };

  // Copy WhatsApp-friendly text summary for parents
  const handleCopyResumoWhatsApp = async () => {
    if (!aluno) return;
    const linhasFundamentos = comparativoFundamentos
      .map(
        (f) =>
          `• *${f.nome}*: ${f.notaAtual.toFixed(1)}/5.0 (${
            f.evolucao >= 0 ? `+${f.evolucao.toFixed(1)}` : f.evolucao.toFixed(1)
          })`
      )
      .join('\n');

    const texto = [
      `⚽ *${tenant.nome.toUpperCase()}*`,
      `📋 *Boletim de Evolução Técnica do Atleta*`,
      ``,
      `👤 *Atleta:* ${aluno.nome} (${categoria?.nome || 'Base'} - ${isCampo ? 'Campo' : 'Futsal'})`,
      `📈 *Nota Geral Atual:* ${metricasResumo.atual.toFixed(1)}/10 (Evolução: ${
        metricasResumo.ganho >= 0 ? `+${metricasResumo.ganho.toFixed(1)}` : metricasResumo.ganho.toFixed(1)
      } pts)`,
      ``,
      `🎯 *Fundamentos Técnicos (1 a 5):*`,
      linhasFundamentos,
      ``,
      mensagemPais.trim() ? `💬 *Parecer do Treinador:*\n${mensagemPais.trim()}` : '',
      ``,
      `_Gerado por ${user.nome} em ${new Date().toLocaleDateString('pt-BR')}_`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(texto);
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 3000);
    } catch (e) {
      console.warn('Clipboard fallback:', e);
    }
  };

  if (!aluno) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: '#1b5e20',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PictureAsPdfIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Exportar Relatório Consolidado em PDF
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, display: 'block' }}>
              Documento oficial de evolução técnica de {aluno.nome} para envio aos pais
            </Typography>
          </Box>
        </Box>
        <Chip
          label={isCampo ? 'Futebol de Campo' : 'Futsal'}
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#ffffff', fontWeight: 700 }}
        />
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {pdfGeradoSucesso && (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            Relatório PDF de <strong>{aluno.nome}</strong> gerado e baixado com sucesso!
          </Alert>
        )}

        {/* Section Inclusion Checkboxes */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#f8fafc',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Seções incluídas no documento PDF:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={incluirFisicos}
                  onChange={(e) => setIncluirFisicos(e.target.checked)}
                />
              }
              label={<Typography variant="body2">Testes Físicos</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={incluirHistorico}
                  onChange={(e) => setIncluirHistorico(e.target.checked)}
                />
              }
              label={<Typography variant="body2">Histórico de Avaliações</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={incluirDicas}
                  onChange={(e) => setIncluirDicas(e.target.checked)}
                />
              }
              label={<Typography variant="body2">Dicas de Treino</Typography>}
            />
          </Box>
        </Box>

        {/* Live Document Preview Sheet */}
        <Box
          sx={{
            border: '1px solid #cbd5e1',
            borderRadius: 2.5,
            p: 2.5,
            bgcolor: '#ffffff',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {/* Preview Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 1,
              pb: 2,
              borderBottom: '2px solid #1b5e20',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <SportsSoccerIcon sx={{ color: '#1b5e20', fontSize: 28 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  {tenant.nome}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Boletim Consolidado de Evolução Técnica • {categoria?.nome || 'Base'} ({turma?.nome || 'Turma'})
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Atleta: {aluno.nome} {aluno.numeroCamisa ? `(#${aluno.numeroCamisa})` : ''}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Responsável: {responsavel?.nome || 'Família do Atleta'}
              </Typography>
            </Box>
          </Box>

          {/* Preview KPI Strip */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 1.5,
              my: 2,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                1ª Avaliação
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                {metricasResumo.inicial.toFixed(1)} / 10
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
              <Typography variant="caption" sx={{ color: '#166534', display: 'block' }}>
                Nota Geral Atual
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#16a34a' }}>
                {metricasResumo.atual.toFixed(1)} / 10
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Evolução no Período
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  color: metricasResumo.ganho >= 0 ? '#16a34a' : '#dc2626',
                }}
              >
                {metricasResumo.ganho >= 0 ? `+${metricasResumo.ganho.toFixed(1)} pts` : `${metricasResumo.ganho.toFixed(1)} pts`}
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Avaliações no Ciclo
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#0284c7' }}>
                {historicoAluno.length} reg.
              </Typography>
            </Box>
          </Box>

          {/* Preview Fundamentals Table */}
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', mb: 1 }}>
            Resumo de Evolução por Fundamento (1ª Avaliação vs Atual)
          </Typography>
          <Table size="small" sx={{ mb: 2, fontVariantNumeric: 'tabular-nums' }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Fundamento</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>1ª Aval.</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Atual</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Evolução (Δ)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparativoFundamentos.map((f) => (
                <TableRow key={f.chave}>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{f.nome}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>
                    {f.notaInicial.toFixed(1)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700 }}>
                    {f.notaAtual.toFixed(1)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: f.evolucao > 0 ? '#16a34a' : f.evolucao < 0 ? '#dc2626' : '#64748b',
                    }}
                  >
                    {f.evolucao > 0 ? `+${f.evolucao.toFixed(1)}` : f.evolucao.toFixed(1)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={f.notaAtual >= 4.3 ? 'Destaque' : f.notaAtual <= 3.5 ? 'Foco de Treino' : 'Adequado'}
                      size="small"
                      color={f.notaAtual >= 4.3 ? 'success' : f.notaAtual <= 3.5 ? 'warning' : 'info'}
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Divider sx={{ my: 2 }} />

          {/* Coach Custom Note for Parents */}
          <TextField
            label="Parecer Pedagógico / Mensagem do Treinador aos Pais (incluído no PDF)"
            multiline
            rows={3}
            fullWidth
            value={mensagemPais}
            onChange={(e) => setMensagemPais(e.target.value)}
            placeholder="Escreva uma observação personalizada para os pais sobre o progresso técnico, dedicação e próximos passos do atleta..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={copiedWhatsApp ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
          onClick={handleCopyResumoWhatsApp}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {copiedWhatsApp ? 'Resumo Copiado!' : 'Copiar Resumo p/ WhatsApp'}
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none', color: '#64748b' }}>
            Fechar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleGerarPdf}
            disabled={historicoAluno.length === 0}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#1b5e20',
              '&:hover': { bgcolor: '#144618' },
            }}
          >
            Baixar Relatório em PDF
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
