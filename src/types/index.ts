export type UserRole = 'master' | 'admin' | 'tecnico' | 'treinador' | 'responsavel';

export type Modality = 'campo' | 'futsal' | 'ambas';

export interface Tenant {
  id: string;
  nome: string;
  cnpj?: string;
  logoUrl?: string;
  corPrimaria?: string;
  plano: 'free' | 'basic' | 'pro';
  statusAssinatura: 'ativa' | 'pendente' | 'cancelada';
  modalidadesAtivas: ('campo' | 'futsal')[];
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  chavePixPadrao?: string;
}

export interface Filial {
  id: string;
  tenantId: string;
  nome: string;
  endereco: string;
  telefone: string;
  responsavelLocal?: string;
}

export interface Usuario {
  id: string;
  tenantId: string;
  nome: string;
  email: string;
  papel: UserRole;
  ativo?: boolean;
  username?: string;
  senha?: string;
  precisaTrocarSenha?: boolean;
  isMaster?: boolean;
  filialId?: string;
  telefone?: string;
  fotoUrl?: string;
  ultimoLogin?: string;
}

export interface Categoria {
  id: string;
  tenantId: string;
  nome: string; // Ex: Sub-9, Sub-11, Sub-13, Sub-15, Sub-17, Livre
  faixaEtariaMin: number;
  faixaEtariaMax: number;
  modalidade: Modality;
  descricao?: string;
}

export interface DiaHorario {
  diaSemana: string;
  horaInicio: string; // "14:00"
  horaFim: string; // "15:30"
  campoQuadra?: string;
}

export interface Turma {
  id: string;
  tenantId: string;
  nome: string;
  categoriaId: string;
  filialId: string;
  modalidade: 'campo' | 'futsal';
  treinadorId: string;
  tecnicoId?: string;
  diasHorarios: DiaHorario[];
  vagasMaximas: number;
  ativo: boolean;
}

export interface Responsavel {
  id: string;
  tenantId: string;
  nome: string;
  telefone: string;
  email: string;
  cpf?: string;
  parentesco?: 'Pai' | 'Mãe' | 'Avô/Avó' | 'Tutor Legal' | 'Outro';
  endereco?: string;
  alunosIds: string[];
}

export interface Aluno {
  id: string;
  tenantId: string;
  nome: string;
  dataNascimento: string; // YYYY-MM-DD
  fotoUrl?: string;
  documentoIdentidade?: string;
  endereco?: string;
  telefoneContato?: string;
  responsavelId: string;
  filialId: string;
  turmaId: string;
  categoriaId: string;
  modalidade: 'campo' | 'futsal' | 'ambas';
  posicaoPreferida?: string;
  peDominante?: 'Destro' | 'Canhoto' | 'Ambidestro';
  numeroCamisa?: number;
  infoMedica?: string;
  contatoEmergencia?: string;
  status: 'ativo' | 'inativo' | 'trancado';
  createdAt?: string;
}

export interface Matricula {
  id: string;
  tenantId: string;
  alunoId: string;
  turmaId: string;
  dataInicio: string;
  planoContratado: string;
  valorMensalidade: number;
  diaVencimento: number;
  status: 'ativa' | 'trancada' | 'cancelada';
}

export interface Presenca {
  id?: string;
  alunoId: string;
  status: 'presente' | 'falta' | 'falta_justificada' | 'pendente';
  observacao?: string;
  horaRegistro?: string;
  notificadoResponsavel?: boolean;
  dataHoraMarcacao?: string;
}

export type RegistroPresenca = Presenca;

export interface Treino {
  id: string;
  tenantId: string;
  turmaId: string;
  data: string; // YYYY-MM-DD
  horarioInicio?: string;
  horarioFim?: string;
  conteudoPedagogico?: string;
  conteudoProgramatico?: string;
  tema?: string;
  treinadorId: string;
  tecnicoId?: string;
  duracaoMinutos?: number;
  presencas?: Presenca[];
  finalizado?: boolean;
}

export interface TestesFisicos {
  velocidade?: number; // Ex: tempo em segundos (ex: 4.5s) ou escala numérica
  resistencia?: number; // Ex: metros no teste de cooper (ex: 2100m) ou escala numérica
  agilidade?: number; // Ex: teste shuttle run em segundos (ex: 9.8s) ou escala numérica
  forca?: number; // Ex: impulsão em cm (ex: 35cm) ou escala numérica
  // Legacy / extra fields
  velocidade30m?: number;
  velocidadeSprint30m?: number;
  resistenciaCooper?: number;
  resistenciaCardio?: number;
  agilidadeShuttleRun?: number;
  forcaSaltoVertical?: number;
  flexibilidade?: number;
  coordenacaoMotora?: number;
}

export interface FundamentosCampo {
  passe?: number; // 1 a 5
  drible?: number; // 1 a 5
  chute?: number; // 1 a 5
  cabeceio?: number; // 1 a 5
  posicionamento?: number; // 1 a 5
  dominioBola?: number; // 1 a 5
  // Compatibility aliases
  passeCurtoELongo?: number;
  drible1v1?: number;
  finalizacaoEChute?: number;
  cabecio?: number;
  dominioEPrimeiroToque?: number;
  conducaoEmVelocidade?: number;
  visaoJogo?: number;
  visaoDeJogoETatica?: number;
  marcacao?: number;
  marcacoeDesarme?: number;
}

export interface FundamentosFutsal {
  controleEspacoReduzido?: number; // 1 a 5
  passeCurto?: number; // 1 a 5
  finalizacao?: number; // 1 a 5
  dominioBola?: number; // 1 a 5
  visaoJogo?: number; // 1 a 5
  // Compatibility aliases
  pisadaNoDominio?: number;
  dominioPisao?: number;
  passeRapidoEmEspacoCurto?: number;
  dribleCurtoEAgilidade?: number;
  finalizacaoDeBicoEChapa?: number;
  visaoEspacialQuadra?: number;
  marcacaoPressao?: number;
  transicaoOfensiva?: number;
  transicaoRapidaAtaqueDefesa?: number;
  movimentacaoPivotOuAla?: number;
}

export interface AvaliacaoTecnica {
  id: string;
  tenantId: string;
  alunoId: string;
  categoriaId?: string;
  turmaId?: string;
  modalidade: 'campo' | 'futsal';
  avaliadorId?: string;
  treinadorId?: string;
  data?: string; // YYYY-MM-DD
  dataAvaliacao?: string;
  periodo?: string;
  testesFisicos: TestesFisicos;
  fundamentosCampo?: FundamentosCampo;
  fundamentosFutsal?: FundamentosFutsal;
  observacoesTecnico?: string;
  observacoesTreinador?: string;
  pontosFortes?: string;
  pontosDesenvolver?: string;
  notaGeral: number; // 1 a 10 ou calculada
  aiFeedback?: string;
  parecerPedagogicoIA?: string;
}

export interface DicaTreino {
  id: string;
  tenantId: string;
  fundamentoRelacionado: string; // Ex: "chute", "passe", "controleEspacoReduzido", "drible", "cabeceio", "posicionamento", "dominioBola", "passeCurto", "finalizacao", "visaoJogo", "velocidade", "resistencia", "agilidade", "forca"
  titulo: string;
  descricao: string;
  modalidade: 'campo' | 'futsal' | 'ambas';
  videoUrl?: string;
  createdAt?: string;
}

export interface Cobranca {
  id: string;
  tenantId: string;
  alunoId: string;
  mesReferencia: string; // "Março/2026"
  valor: number;
  vencimento: string; // YYYY-MM-DD
  status: 'pago' | 'pendente' | 'atrasado';
  metodoPagamento?: 'pix' | 'boleto' | 'cartao';
  linkPix?: string;
  chavePix?: string;
  comprovanteUrl?: string;
  dataPagamento?: string;
  aiReceiptCheck?: string;
}

export interface Contrato {
  id: string;
  tenantId: string;
  alunoId: string;
  responsavelId?: string;
  urlDocumento?: string;
  titulo: string;
  status: 'pendente' | 'assinado';
  dataAssinatura?: string;
  conteudoTermo?: string;
}

export interface Comunicado {
  id: string;
  tenantId: string;
  titulo: string;
  mensagem: string;
  dataEnvio: string;
  autor: string;
  destinatarios: {
    tipo: 'todos' | 'turma' | 'filial';
    turmaId?: string;
    filialId?: string;
  };
  urgencia: 'normal' | 'alta' | 'urgente';
}
