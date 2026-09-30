import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './config';
import { 
  Tenant, Filial, Usuario, Categoria, Turma, Responsavel, 
  Aluno, Matricula, Treino, Presenca, AvaliacaoTecnica, Cobranca, Contrato, Comunicado, DicaTreino 
} from '../types';

export const DEFAULT_TENANT_ID = 'craques-do-futuro';

export const initialTenant: Tenant = {
  id: DEFAULT_TENANT_ID,
  nome: 'Minha Base - Gestão Esportiva',
  cnpj: '12.345.678/0001-90',
  logoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=80',
  corPrimaria: '#1b5e20',
  plano: 'pro',
  statusAssinatura: 'ativa',
  modalidadesAtivas: ['campo', 'futsal'],
  email: 'contato@minhabase.com.br',
  telefone: '(11) 98765-4321',
  endereco: 'Av. Paulista, 1000 - Bela Vista',
  cidade: 'São Paulo',
  estado: 'SP',
  chavePixPadrao: 'financeiro@minhabase.com.br'
};

export const secondTenant: Tenant = {
  id: 'estrela-real',
  nome: 'Escola de Futsal & Campo Estrela Real',
  cnpj: '98.765.432/0001-10',
  logoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=80',
  corPrimaria: '#0284c7',
  plano: 'basic',
  statusAssinatura: 'ativa',
  modalidadesAtivas: ['campo', 'futsal'],
  email: 'contato@estrelareal.com.br',
  telefone: '(19) 99111-2233',
  endereco: 'Av. Brasil, 450 - Guanabara',
  cidade: 'Campinas',
  estado: 'SP',
  chavePixPadrao: 'financeiro@estrelareal.com.br'
};

export const initialTenantsList: Tenant[] = [initialTenant, secondTenant];

export const initialFiliais: Filial[] = [
  {
    id: 'filial-centro',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Unidade Centro - Arena Society & Quadra',
    endereco: 'Rua Augusta, 500 - Consolação, São Paulo - SP',
    telefone: '(11) 97777-1111',
    responsavelLocal: 'Prof. Carlos Silva'
  },
  {
    id: 'filial-sul',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Unidade Zona Sul - Complexo Esportivo Campo 11',
    endereco: 'Av. Santo Amaro, 2300 - Moema, São Paulo - SP',
    telefone: '(11) 98888-2222',
    responsavelLocal: 'Prof. Lucas Rocha'
  }
];

export const initialUsuarios: Usuario[] = [
  {
    id: 'user-master-pcfontoura',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Paulo César Fontoura (Master)',
    username: 'pccfontoura@gmail.com',
    email: 'pccfontoura@gmail.com',
    senha: 'senha123',
    papel: 'master',
    isMaster: true,
    ativo: true,
    precisaTrocarSenha: true,
    telefone: '(11) 99999-9999',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-admin',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Rodrigo Medeiros (Diretor)',
    username: 'admin',
    email: 'admin@craques.com',
    senha: 'admin123',
    papel: 'admin',
    ativo: true,
    precisaTrocarSenha: false,
    telefone: '(11) 99999-0001',
    fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-coach-carlos',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Prof. Carlos Silva',
    username: 'carlos.silva',
    email: 'carlos.silva@craques.com',
    senha: 'treinador123',
    papel: 'tecnico',
    ativo: true,
    precisaTrocarSenha: false,
    filialId: 'filial-centro',
    telefone: '(11) 99999-0002',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-coach-lucas',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Prof. Lucas Rocha',
    username: 'lucas.rocha',
    email: 'lucas.rocha@craques.com',
    senha: 'treinador123',
    papel: 'tecnico',
    ativo: true,
    precisaTrocarSenha: false,
    filialId: 'filial-sul',
    telefone: '(11) 99999-0003',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-parent-marcos',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Marcos Fontes (Pai do Gabriel e Davi)',
    username: 'marcos.fontes',
    email: 'marcos.fontes@gmail.com',
    senha: 'pais123',
    papel: 'responsavel',
    ativo: true,
    precisaTrocarSenha: false,
    telefone: '(11) 99999-0004',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-parent-ana',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Ana Carolina Lima (Mãe do Enzo)',
    username: 'ana.lima',
    email: 'ana.lima@gmail.com',
    senha: 'pais123',
    papel: 'responsavel',
    ativo: true,
    precisaTrocarSenha: false,
    telefone: '(11) 99999-0005',
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-admin-estrela',
    tenantId: 'estrela-real',
    nome: 'Fernanda Oliveira (Admin Estrela Real)',
    username: 'admin.estrela',
    email: 'diretoria@estrelareal.com.br',
    senha: 'admin123',
    papel: 'admin',
    ativo: true,
    precisaTrocarSenha: false,
    telefone: '(19) 98877-6655',
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
  }
];

export const initialCategorias: Categoria[] = [
  {
    id: 'cat-sub9',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Sub-9 (Iniciação & Coordenação)',
    faixaEtariaMin: 7,
    faixaEtariaMax: 9,
    modalidade: 'ambas',
    descricao: 'Desenvolvimento motor fundamental, domínio da bola, jogos lúdicos e socialização.'
  },
  {
    id: 'cat-sub11',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Sub-11 (Fundamentos & Cognição)',
    faixaEtariaMin: 10,
    faixaEtariaMax: 11,
    modalidade: 'ambas',
    descricao: 'Passe orientado, controle de espaço, noções táticas de 1v1 e 2v1, posicionamento.'
  },
  {
    id: 'cat-sub13',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Sub-13 (Especialização Tática)',
    faixaEtariaMin: 12,
    faixaEtariaMax: 13,
    modalidade: 'campo',
    descricao: 'Transições ofensivas e defensivas, bola parada, resistência aeróbia e visão de jogo.'
  },
  {
    id: 'cat-sub15',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Sub-15 (Alto Rendimento)',
    faixaEtariaMin: 14,
    faixaEtariaMax: 15,
    modalidade: 'campo',
    descricao: 'Força, velocidade, leitura de jogo avançada e preparação para campeonatos estaduais.'
  }
];

export const initialTurmas: Turma[] = [
  {
    id: 'turma-sub11-campo-tarde',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Sub-11 Campo - Tarde',
    categoriaId: 'cat-sub11',
    filialId: 'filial-centro',
    modalidade: 'campo',
    treinadorId: 'user-coach-carlos',
    tecnicoId: 'user-coach-carlos',
    diasHorarios: [
      { diaSemana: 'Terça', horaInicio: '15:30', horaFim: '17:00', campoQuadra: 'Campo Sintético A' },
      { diaSemana: 'Quinta', horaInicio: '15:30', horaFim: '17:00', campoQuadra: 'Campo Sintético A' }
    ],
    vagasMaximas: 22,
    ativo: true
  },
  {
    id: 'turma-sub9-futsal-manha',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Sub-9 Futsal - Manhã',
    categoriaId: 'cat-sub9',
    filialId: 'filial-centro',
    modalidade: 'futsal',
    treinadorId: 'user-coach-carlos',
    tecnicoId: 'user-coach-carlos',
    diasHorarios: [
      { diaSemana: 'Segunda', horaInicio: '09:00', horaFim: '10:15', campoQuadra: 'Ginásio Principal' },
      { diaSemana: 'Quarta', horaInicio: '09:00', horaFim: '10:15', campoQuadra: 'Ginásio Principal' }
    ],
    vagasMaximas: 16,
    ativo: true
  },
  {
    id: 'turma-sub13-campo-sul',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Sub-13 Campo - Zona Sul',
    categoriaId: 'cat-sub13',
    filialId: 'filial-sul',
    modalidade: 'campo',
    treinadorId: 'user-coach-lucas',
    tecnicoId: 'user-coach-lucas',
    diasHorarios: [
      { diaSemana: 'Quarta', horaInicio: '16:30', horaFim: '18:00', campoQuadra: 'Campo 11 Grama Natural' },
      { diaSemana: 'Sexta', horaInicio: '16:30', horaFim: '18:00', campoQuadra: 'Campo 11 Grama Natural' }
    ],
    vagasMaximas: 24,
    ativo: true
  }
];

export const initialResponsaveis: Responsavel[] = [
  {
    id: 'resp-marcos',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Marcos Fontes',
    telefone: '(11) 99123-4567',
    email: 'marcos.fontes@gmail.com',
    cpf: '123.456.789-00',
    parentesco: 'Pai',
    endereco: 'Rua Bela Cintra, 890 - Consolação, SP',
    alunosIds: ['aluno-gabriel', 'aluno-davi']
  },
  {
    id: 'resp-ana',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Ana Carolina Lima',
    telefone: '(11) 98234-5678',
    email: 'ana.lima@gmail.com',
    cpf: '234.567.890-11',
    parentesco: 'Mãe',
    endereco: 'Alameda Santos, 1400 - Jardins, SP',
    alunosIds: ['aluno-enzo']
  },
  {
    id: 'resp-ricardo',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Ricardo Silveira',
    telefone: '(11) 97345-6789',
    email: 'ricardo.silveira@outlook.com',
    cpf: '345.678.901-22',
    parentesco: 'Pai',
    endereco: 'Rua Vergueiro, 2500 - Vila Mariana, SP',
    alunosIds: ['aluno-matheus']
  }
];

export const initialAlunos: Aluno[] = [
  {
    id: 'aluno-gabriel',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Gabriel Fontes',
    dataNascimento: '2015-04-12',
    fotoUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
    documentoIdentidade: '58.412.390-1',
    endereco: 'Rua Frei Caneca, 820, Apto 42 - Consolação, São Paulo - SP',
    telefoneContato: '(11) 99123-4567',
    responsavelId: 'resp-marcos',
    filialId: 'filial-centro',
    turmaId: 'turma-sub11-campo-tarde',
    categoriaId: 'cat-sub11',
    modalidade: 'campo',
    posicaoPreferida: 'Meia-Armador (Camisa 10)',
    peDominante: 'Destro',
    numeroCamisa: 10,
    infoMedica: 'Sem restrições ou alergias conhecidas. Atestado médico válido até dez/2026.',
    contatoEmergencia: 'Pai (11) 99123-4567',
    status: 'ativo'
  },
  {
    id: 'aluno-davi',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Davi Fontes',
    dataNascimento: '2017-09-20',
    fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    documentoIdentidade: '61.845.102-8',
    endereco: 'Rua Frei Caneca, 820, Apto 42 - Consolação, São Paulo - SP',
    telefoneContato: '(11) 99123-4567',
    responsavelId: 'resp-marcos',
    filialId: 'filial-centro',
    turmaId: 'turma-sub9-futsal-manha',
    categoriaId: 'cat-sub9',
    modalidade: 'futsal',
    posicaoPreferida: 'Ala Direito / Fixo',
    peDominante: 'Canhoto',
    numeroCamisa: 7,
    infoMedica: 'Usa bombinha de asma profilática antes de atividades intensas em clima muito seco.',
    contatoEmergencia: 'Pai (11) 99123-4567',
    status: 'ativo'
  },
  {
    id: 'aluno-enzo',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Enzo Lima',
    dataNascimento: '2015-02-18',
    fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    documentoIdentidade: '57.903.441-5',
    endereco: 'Alameda Santos, 1400 - Jardins, São Paulo - SP',
    telefoneContato: '(11) 98234-5678',
    responsavelId: 'resp-ana',
    filialId: 'filial-centro',
    turmaId: 'turma-sub11-campo-tarde',
    categoriaId: 'cat-sub11',
    modalidade: 'campo',
    posicaoPreferida: 'Atacante / Centroavante',
    peDominante: 'Destro',
    numeroCamisa: 9,
    infoMedica: 'Alergia a picada de abelha.',
    contatoEmergencia: 'Mãe (11) 98234-5678',
    status: 'ativo'
  },
  {
    id: 'aluno-matheus',
    tenantId: DEFAULT_TENANT_ID,
    nome: 'Matheus Silveira',
    dataNascimento: '2013-08-05',
    fotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    documentoIdentidade: '52.119.874-3',
    endereco: 'Rua Vergueiro, 2500 - Vila Mariana, São Paulo - SP',
    telefoneContato: '(11) 97345-6789',
    responsavelId: 'resp-ricardo',
    filialId: 'filial-sul',
    turmaId: 'turma-sub13-campo-sul',
    categoriaId: 'cat-sub13',
    modalidade: 'campo',
    posicaoPreferida: 'Zagueiro Central',
    peDominante: 'Destro',
    numeroCamisa: 4,
    infoMedica: 'Nenhuma restrição médica.',
    contatoEmergencia: 'Pai (11) 97345-6789',
    status: 'ativo'
  }
];

export const initialMatriculas: Matricula[] = [
  {
    id: 'mat-gabriel',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-gabriel',
    turmaId: 'turma-sub11-campo-tarde',
    dataInicio: '2026-01-15',
    planoContratado: 'Plano Anual 2x por semana',
    valorMensalidade: 220.00,
    diaVencimento: 10,
    status: 'ativa'
  },
  {
    id: 'mat-davi',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-davi',
    turmaId: 'turma-sub9-futsal-manha',
    dataInicio: '2026-02-01',
    planoContratado: 'Plano Semestral Futsal Iniciação',
    valorMensalidade: 190.00,
    diaVencimento: 10,
    status: 'ativa'
  },
  {
    id: 'mat-enzo',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-enzo',
    turmaId: 'turma-sub11-campo-tarde',
    dataInicio: '2026-01-20',
    planoContratado: 'Plano Anual 2x por semana',
    valorMensalidade: 220.00,
    diaVencimento: 15,
    status: 'ativa'
  },
  {
    id: 'mat-matheus',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-matheus',
    turmaId: 'turma-sub13-campo-sul',
    dataInicio: '2026-01-10',
    planoContratado: 'Plano Rendimento Campo 11',
    valorMensalidade: 250.00,
    diaVencimento: 5,
    status: 'ativa'
  }
];

export const initialTreinos: Treino[] = [
  {
    id: 'treino-2026-08-20',
    tenantId: DEFAULT_TENANT_ID,
    turmaId: 'turma-sub11-campo-tarde',
    data: '2026-08-20',
    tema: 'Passe entre linhas e tomada de decisão rápida sob pressão',
    conteudoPedagogico: '1. Rondo 4v2 com transição rápida.\n2. Jogo posicional 6v6 com 3 zonas e apoio do camisa 10.\n3. Finalização após tabela rápida na entrada da área.',
    treinadorId: 'user-coach-carlos',
    tecnicoId: 'user-coach-carlos',
    duracaoMinutos: 90,
    finalizado: true
  },
  {
    id: 'treino-2026-08-22',
    tenantId: DEFAULT_TENANT_ID,
    turmaId: 'turma-sub11-campo-tarde',
    data: '2026-08-22',
    tema: 'Cruzamentos, cabeceio e posicionamento defensivo da zaga',
    conteudoPedagogico: '1. Aquecimento dinâmico com impulsão de cabeceio.\n2. Circuito técnico de cruzamentos laterais e finalização de primeira.\n3. Mini-jogo 7x7 em campo reduzido.',
    treinadorId: 'user-coach-carlos',
    tecnicoId: 'user-coach-carlos',
    duracaoMinutos: 90,
    finalizado: true
  },
  {
    id: 'treino-2026-08-23',
    tenantId: DEFAULT_TENANT_ID,
    turmaId: 'turma-sub9-futsal-manha',
    data: '2026-08-23',
    tema: 'Controle de sola (pisão) e condução rápida em zigue-zague',
    conteudoPedagogico: '1. Atividade lúdica: pega-pega com bola nos pés.\n2. Condução entre cones com sola e peito do pé alternados.\n3. Jogo com regras adaptadas (gol só vale após 3 passes com a sola).',
    treinadorId: 'user-coach-carlos',
    tecnicoId: 'user-coach-carlos',
    duracaoMinutos: 75,
    finalizado: true
  }
];

export const initialPresencasMap: Record<string, Record<string, Presenca>> = {
  'treino-2026-08-20': {
    'aluno-gabriel': { alunoId: 'aluno-gabriel', status: 'presente', observacao: 'Excelente movimentação no rondo', horaRegistro: '15:32' },
    'aluno-enzo': { alunoId: 'aluno-enzo', status: 'presente', observacao: 'Marcou 3 gols no mini-jogo', horaRegistro: '15:35' }
  },
  'treino-2026-08-22': {
    'aluno-gabriel': { alunoId: 'aluno-gabriel', status: 'presente', observacao: 'Destaque no passe de primeira', horaRegistro: '15:31' },
    'aluno-enzo': { alunoId: 'aluno-enzo', status: 'falta_justificada', observacao: 'Consulta médica comunicada pela mãe', horaRegistro: '15:40' }
  },
  'treino-2026-08-23': {
    'aluno-davi': { alunoId: 'aluno-davi', status: 'presente', observacao: 'Muito participativo e focado no controle de sola', horaRegistro: '09:05' }
  }
};

export const initialAvaliacoes: AvaliacaoTecnica[] = [
  // Gabriel - Evolução (3 avaliações)
  {
    id: 'aval-gabriel-jun2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-gabriel',
    categoriaId: 'cat-sub11',
    turmaId: 'turma-sub11-campo-tarde',
    modalidade: 'campo',
    avaliadorId: 'user-coach-carlos',
    treinadorId: 'user-coach-carlos',
    data: '2026-06-10',
    dataAvaliacao: '2026-06-10',
    periodo: '1º Bimestre / 2026',
    testesFisicos: {
      velocidade: 4.9,
      resistencia: 1950,
      agilidade: 10.2,
      forca: 32,
      velocidade30m: 4.9,
      resistenciaCooper: 1950,
      agilidadeShuttleRun: 10.2,
      forcaSaltoVertical: 32
    },
    fundamentosCampo: {
      passe: 4.2,
      drible: 3.8,
      chute: 3.5,
      cabeceio: 3.0,
      posicionamento: 4.2,
      dominioBola: 4.5,
      visaoJogo: 4.4,
      marcacao: 3.5
    },
    observacoesTecnico: 'Início de ciclo muito promissor. Boa visão de jogo, mas precisa ganhar mais potência no chute e ritmo de aceleração.',
    observacoesTreinador: 'Início de ciclo muito promissor. Boa visão de jogo, mas precisa ganhar mais potência no chute e ritmo de aceleração.',
    notaGeral: 7.8,
    aiFeedback: 'Bom controle e passe inicial. Foco em exercícios de cabeceio e finalização.'
  },
  {
    id: 'aval-gabriel-jul2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-gabriel',
    categoriaId: 'cat-sub11',
    turmaId: 'turma-sub11-campo-tarde',
    modalidade: 'campo',
    avaliadorId: 'user-coach-carlos',
    treinadorId: 'user-coach-carlos',
    data: '2026-07-15',
    dataAvaliacao: '2026-07-15',
    periodo: 'Intermediário / Julho',
    testesFisicos: {
      velocidade: 4.7,
      resistencia: 2050,
      agilidade: 9.9,
      forca: 34,
      velocidade30m: 4.7,
      resistenciaCooper: 2050,
      agilidadeShuttleRun: 9.9,
      forcaSaltoVertical: 34
    },
    fundamentosCampo: {
      passe: 4.5,
      drible: 4.0,
      chute: 3.8,
      cabeceio: 3.2,
      posicionamento: 4.5,
      dominioBola: 4.7,
      visaoJogo: 4.6,
      marcacao: 3.6
    },
    observacoesTecnico: 'Evolução nítida na distribuição de passes e resistência cardiovascular durante os 90 minutos de treino.',
    observacoesTreinador: 'Evolução nítida na distribuição de passes e resistência cardiovascular durante os 90 minutos de treino.',
    notaGeral: 8.3,
    aiFeedback: 'Melhoria na intensidade física. Continuar aprimorando cabeceio e força de finalização.'
  },
  {
    id: 'aval-gabriel-1',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-gabriel',
    categoriaId: 'cat-sub11',
    turmaId: 'turma-sub11-campo-tarde',
    modalidade: 'campo',
    avaliadorId: 'user-coach-carlos',
    treinadorId: 'user-coach-carlos',
    data: '2026-08-15',
    dataAvaliacao: '2026-08-15',
    periodo: '2º Bimestre / 2026',
    testesFisicos: {
      velocidade: 4.6,
      resistencia: 2150,
      agilidade: 9.8,
      forca: 36,
      velocidade30m: 4.6,
      resistenciaCooper: 2150,
      agilidadeShuttleRun: 9.8,
      forcaSaltoVertical: 36,
      flexibilidade: 28
    },
    fundamentosCampo: {
      passe: 4.8,
      drible: 4.2,
      chute: 4.0,
      cabeceio: 3.5,
      posicionamento: 4.7,
      dominioBola: 4.9,
      visaoJogo: 4.8,
      marcacao: 3.8
    },
    observacoesTecnico: 'Gabriel tem uma leitura de jogo acima da média para a categoria Sub-11. Distribui muito bem a bola como camisa 10 e possui excelente primeiro toque orientado. Próximo passo: aprimorar o cabeceio ofensivo e o desarme na fase defensiva.',
    observacoesTreinador: 'Gabriel tem uma leitura de jogo acima da média para a categoria Sub-11. Distribui muito bem a bola como camisa 10 e possui excelente primeiro toque orientado. Próximo passo: aprimorar o cabeceio ofensivo e o desarme na fase defensiva.',
    notaGeral: 8.9,
    aiFeedback: 'Atleta com perfil de armador criativo clássico. Recomendado focar em treinos de finalização de média distância e potência muscular para manter alta intensidade nos minutos finais de jogo.'
  },

  // Davi - Futsal (3 avaliações)
  {
    id: 'aval-davi-mai2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-davi',
    categoriaId: 'cat-sub9',
    turmaId: 'turma-sub9-futsal-manha',
    modalidade: 'futsal',
    avaliadorId: 'user-coach-carlos',
    treinadorId: 'user-coach-carlos',
    data: '2026-05-15',
    dataAvaliacao: '2026-05-15',
    periodo: 'Avaliação Inicial / Maio',
    testesFisicos: {
      velocidade: 5.5,
      resistencia: 1520,
      agilidade: 11.0,
      forca: 26,
      velocidade30m: 5.5,
      resistenciaCooper: 1520,
      agilidadeShuttleRun: 11.0,
      forcaSaltoVertical: 26
    },
    fundamentosFutsal: {
      controleEspacoReduzido: 3.9,
      passeCurto: 3.6,
      finalizacao: 3.1,
      dominioBola: 4.0,
      visaoJogo: 3.5,
      dominioPisao: 4.0,
      marcacaoPressao: 3.6,
      transicaoOfensiva: 3.5
    },
    observacoesTecnico: 'Boa adaptação inicial à quadra e facilidade natural com a perna esquerda.',
    observacoesTreinador: 'Boa adaptação inicial à quadra e facilidade natural com a perna esquerda.',
    notaGeral: 7.5,
    aiFeedback: 'Iniciar trabalho de coordenação de passe curto e finalização.'
  },
  {
    id: 'aval-davi-jul2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-davi',
    categoriaId: 'cat-sub9',
    turmaId: 'turma-sub9-futsal-manha',
    modalidade: 'futsal',
    avaliadorId: 'user-coach-carlos',
    treinadorId: 'user-coach-carlos',
    data: '2026-07-10',
    dataAvaliacao: '2026-07-10',
    periodo: '1º Bimestre / 2026',
    testesFisicos: {
      velocidade: 5.3,
      resistencia: 1650,
      agilidade: 10.7,
      forca: 28,
      velocidade30m: 5.3,
      resistenciaCooper: 1650,
      agilidadeShuttleRun: 10.7,
      forcaSaltoVertical: 28
    },
    fundamentosFutsal: {
      controleEspacoReduzido: 4.2,
      passeCurto: 3.9,
      finalizacao: 3.4,
      dominioBola: 4.4,
      visaoJogo: 3.8,
      dominioPisao: 4.4,
      marcacaoPressao: 4.0,
      transicaoOfensiva: 3.8
    },
    observacoesTecnico: 'Muita agilidade com a canhota e facilidade no drible curto. Precisa trabalhar a finalização de bico/chapa.',
    observacoesTreinador: 'Muita agilidade com a canhota e facilidade no drible curto. Precisa trabalhar a finalização de bico/chapa.',
    notaGeral: 8.0,
    aiFeedback: 'Destaca-se no controle com sola. Exercícios de chute rápido são o foco principal.'
  },
  {
    id: 'aval-davi-1',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-davi',
    categoriaId: 'cat-sub9',
    turmaId: 'turma-sub9-futsal-manha',
    modalidade: 'futsal',
    avaliadorId: 'user-coach-carlos',
    treinadorId: 'user-coach-carlos',
    data: '2026-08-18',
    dataAvaliacao: '2026-08-18',
    periodo: '2º Bimestre / 2026',
    testesFisicos: {
      velocidade: 5.1,
      resistencia: 1800,
      agilidade: 10.4,
      forca: 30,
      velocidade30m: 5.1,
      resistenciaCooper: 1800,
      agilidadeShuttleRun: 10.4,
      forcaSaltoVertical: 30,
      flexibilidade: 32
    },
    fundamentosFutsal: {
      controleEspacoReduzido: 4.5,
      passeCurto: 4.2,
      finalizacao: 3.8,
      dominioBola: 4.7,
      visaoJogo: 4.0,
      dominioPisao: 4.7,
      marcacaoPressao: 4.4,
      transicaoOfensiva: 4.1
    },
    observacoesTecnico: 'Davi tem uma facilidade fantástica com a perna esquerda e domina com a sola com total naturalidade. Muita velocidade na transição e garra defensiva.',
    observacoesTreinador: 'Davi tem uma facilidade fantástica com a perna esquerda e domina com a sola com total naturalidade. Muita velocidade na transição e garra defensiva.',
    notaGeral: 8.6,
    aiFeedback: 'Davi demonstra excelente coordenação motora e intimidade com o piso do futsal. Sugere-se continuar incentivando o chute com a perna direita para torná-lo ambidestro.'
  },

  // Enzo - Campo (3 avaliações)
  {
    id: 'aval-enzo-mai2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-enzo',
    categoriaId: 'cat-sub11',
    turmaId: 'turma-sub11-campo-tarde',
    modalidade: 'campo',
    avaliadorId: 'user-coach-carlos',
    treinadorId: 'user-coach-carlos',
    data: '2026-05-12',
    dataAvaliacao: '2026-05-12',
    periodo: 'Avaliação Inicial / Maio',
    testesFisicos: {
      velocidade: 4.8,
      resistencia: 1880,
      agilidade: 10.1,
      forca: 33,
      velocidade30m: 4.8,
      resistenciaCooper: 1880,
      agilidadeShuttleRun: 10.1,
      forcaSaltoVertical: 33
    },
    fundamentosCampo: {
      passe: 3.2,
      drible: 3.9,
      chute: 4.2,
      cabeceio: 3.7,
      posicionamento: 3.8,
      dominioBola: 3.6,
      visaoJogo: 3.3,
      marcacao: 2.7
    },
    observacoesTecnico: 'Atleta de muita força física e chute potente logo na chegada.',
    observacoesTreinador: 'Atleta de muita força física e chute potente logo na chegada.',
    notaGeral: 7.6,
    aiFeedback: 'Trabalhar fundamentos de passe e domínio orientado.'
  },
  {
    id: 'aval-enzo-jun2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-enzo',
    categoriaId: 'cat-sub11',
    turmaId: 'turma-sub11-campo-tarde',
    modalidade: 'campo',
    avaliadorId: 'user-coach-carlos',
    treinadorId: 'user-coach-carlos',
    data: '2026-06-20',
    dataAvaliacao: '2026-06-20',
    periodo: '1º Bimestre / 2026',
    testesFisicos: {
      velocidade: 4.6,
      resistencia: 2000,
      agilidade: 9.9,
      forca: 35,
      velocidade30m: 4.6,
      resistenciaCooper: 2000,
      agilidadeShuttleRun: 9.9,
      forcaSaltoVertical: 35
    },
    fundamentosCampo: {
      passe: 3.5,
      drible: 4.2,
      chute: 4.5,
      cabeceio: 4.0,
      posicionamento: 4.0,
      dominioBola: 3.9,
      visaoJogo: 3.5,
      marcacao: 2.9
    },
    observacoesTecnico: 'Atacante muito veloz e com forte instinto artilheiro. Deve se dedicar mais aos passes curtos de pivô.',
    observacoesTreinador: 'Atacante muito veloz e com forte instinto artilheiro. Deve se dedicar mais aos passes curtos de pivô.',
    notaGeral: 8.1,
    aiFeedback: 'Excelente poder de finalização. Recomenda-se treinar passes em progressão.'
  },
  {
    id: 'aval-enzo-1',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-enzo',
    categoriaId: 'cat-sub11',
    turmaId: 'turma-sub11-campo-tarde',
    modalidade: 'campo',
    avaliadorId: 'user-coach-carlos',
    treinadorId: 'user-coach-carlos',
    data: '2026-08-15',
    dataAvaliacao: '2026-08-15',
    periodo: '2º Bimestre / 2026',
    testesFisicos: {
      velocidade: 4.4,
      resistencia: 2200,
      agilidade: 9.6,
      forca: 38,
      velocidade30m: 4.4,
      resistenciaCooper: 2200,
      agilidadeShuttleRun: 9.6,
      forcaSaltoVertical: 38,
      flexibilidade: 26
    },
    fundamentosCampo: {
      passe: 3.9,
      drible: 4.5,
      chute: 4.8,
      cabeceio: 4.3,
      posicionamento: 4.4,
      dominioBola: 4.2,
      visaoJogo: 3.8,
      marcacao: 3.2
    },
    observacoesTecnico: 'Finalizador nato! Enzo tem faro de gol apurado, excelente chute de primeira e ótima impulsão no cabeceio. Precisa trabalhar o passe para os companheiros em jogadas de pivô.',
    observacoesTreinador: 'Finalizador nato! Enzo tem faro de gol apurado, excelente chute de primeira e ótima impulsão no cabeceio. Precisa trabalhar o passe para os companheiros em jogadas de pivô.',
    notaGeral: 8.7,
    aiFeedback: 'Atacante com grande explosão física e ótimo índice de conversão de gols. Próxima meta é refinar o passe de retorno em tabelas 1-2.'
  }
];

export const initialDicasTreino: DicaTreino[] = [
  {
    id: 'dica-cabeceio-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'cabeceio',
    titulo: 'Impulsão e Tempo de Bola no Cabeceio Ofensivo',
    descricao: 'Posicione os olhos sempre abertos acompanhando a trajetória da bola. Salte com um dos pés como apoio e faça a flexão do pescoço direcionando o impacto para a testa, direcionando a bola para baixo no canto do goleiro.',
    modalidade: 'campo',
    createdAt: '2026-08-01'
  },
  {
    id: 'dica-chute-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'chute',
    titulo: 'Ajuste do Pé de Apoio e Finalização de Chapa',
    descricao: 'Coloque o pé de apoio paralelo à bola apontando para o alvo. Mantenha o corpo ligeiramente inclinado para frente para a bola não subir e finalize com o peito ou a chapa do pé travando o tornozelo no momento do impacto.',
    modalidade: 'ambas',
    createdAt: '2026-08-02'
  },
  {
    id: 'dica-passe-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'passe',
    titulo: 'Passe Firme e Rasteiro com a Parte Interna',
    descricao: 'Acerte a bola no centro geométrico com a face interna do pé. Acompanhe o movimento com a perna após o toque para garantir que o passe chegue com peso ideal e sem quicar para o companheiro.',
    modalidade: 'ambas',
    createdAt: '2026-08-03'
  },
  {
    id: 'dica-drible-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'drible',
    titulo: 'Mudança Brusca de Ritmo e Drible 1 contra 1',
    descricao: 'Use a finta de corpo fingindo ir para um lado para desequilibrar o marcador. Ao perceber a transferência de peso do defensor, dê o toque de aceleração no espaço livre e proteja a bola com o braço oposto.',
    modalidade: 'ambas',
    createdAt: '2026-08-04'
  },
  {
    id: 'dica-dominio-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'dominioBola',
    titulo: 'Primeiro Toque Orientado para Fora da Pressão',
    descricao: 'Antes da bola chegar, olhe por cima do ombro (scan). No momento do contato, amorteça a bola já empurrando-a na direção do espaço vazio longe do marcador direto.',
    modalidade: 'ambas',
    createdAt: '2026-08-05'
  },
  {
    id: 'dica-posicionamento-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'posicionamento',
    titulo: 'Ocupação de Espaços Entre as Linhas Adversárias',
    descricao: 'Mantenha-se em constante movimento diagonal nas costas dos volantes adversários. Crie linhas de passe formando triângulos de apoio com os pontas e meio-campistas.',
    modalidade: 'campo',
    createdAt: '2026-08-06'
  },
  {
    id: 'dica-controle-espaco-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'controleEspacoReduzido',
    titulo: 'Domínio de Pisão e Giro em Espaço Reduzido',
    descricao: 'No futsal, amorteça a bola sempre com a sola (pisão), mantendo a bola colada à chuteira. Use o braço de proteção e gire rapidamente o quadril para sair da pressão de quadra.',
    modalidade: 'futsal',
    createdAt: '2026-08-07'
  },
  {
    id: 'dica-passe-curto-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'passeCurto',
    titulo: 'Tabela Rápida 1-2 em Diagonal no Futsal',
    descricao: 'Toque firme na perna certa do companheiro e imediatamente faça o "passa e vai" em sprint diagonal nas costas da defesa para receber a devolução limpa na frente.',
    modalidade: 'futsal',
    createdAt: '2026-08-08'
  },
  {
    id: 'dica-finalizacao-futsal-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'finalizacao',
    titulo: 'Finalização Rápida de Bico com Pouco Espaço',
    descricao: 'Em quadra reduzida, o chute de bico não dá tempo de reação ao goleiro. Acerte a bola rapidamente sem preparar o passo, visando as traves inferiores ou o ângulo oposto.',
    modalidade: 'futsal',
    createdAt: '2026-08-09'
  },
  {
    id: 'dica-visao-jogo-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'visaoJogo',
    titulo: 'Escaneamento Visual Periférico de 360 Graus',
    descricao: 'Habitue-se a girar o pescoço a cada 3 segundos mesmo sem a bola. Identifique previamente onde estão os companheiros desmarcados e onde está o espaço livre para antecipar a jogada.',
    modalidade: 'ambas',
    createdAt: '2026-08-10'
  },
  {
    id: 'dica-velocidade-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'velocidade',
    titulo: 'Explosão e Arranque nos Primeiros 10 Metros',
    descricao: 'Incline o tronco levemente para frente nas primeiras 4 passadas. Mantenha os braços coordenados em 90 graus gerando propulsão máxima para ganhar a frente do marcador.',
    modalidade: 'ambas',
    createdAt: '2026-08-11'
  },
  {
    id: 'dica-resistencia-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'resistencia',
    titulo: 'Treino Intervalado de Alta Intensidade (HIIT com Bola)',
    descricao: 'Realize circuitos de 30 segundos em velocidade máxima conduzindo a bola com 15 segundos de recuperação ativa. Isso simula os picos de esforço reais de uma partida.',
    modalidade: 'ambas',
    createdAt: '2026-08-12'
  },
  {
    id: 'dica-agilidade-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'agilidade',
    titulo: 'Troca Rápida de Direção em Cones e Escada de Coordenação',
    descricao: 'Mantenha o centro de gravidade baixo e apoie a ponta dos pés no chão. Faça movimentos laterais rápidos sem cruzar as pernas para obter agilidade nas fintas.',
    modalidade: 'ambas',
    createdAt: '2026-08-13'
  },
  {
    id: 'dica-forca-1',
    tenantId: DEFAULT_TENANT_ID,
    fundamentoRelacionado: 'forca',
    titulo: 'Pliometria e Potência Muscular dos Membros Inferiores',
    descricao: 'Treinos de saltos sobre barreiras baixas e agachamento com peso corporal desenvolvem a impulsão vertical e a estabilidade das articulações do joelho e tornozelo.',
    modalidade: 'ambas',
    createdAt: '2026-08-14'
  }
];

export const initialCobrancas: Cobranca[] = [
  {
    id: 'cob-gabriel-ago2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-gabriel',
    mesReferencia: 'Agosto/2026',
    valor: 220.00,
    vencimento: '2026-08-10',
    status: 'pago',
    metodoPagamento: 'pix',
    chavePix: 'financeiro@minhabase.com.br',
    linkPix: '00020126580014br.gov.bcb.pix0136financeiro@minhabase.com.br5204000053039865406220.005802BR5925MINHA BASE GESTAO ESPORTI6009SAO PAULO62070503***6304E1F2',
    dataPagamento: '2026-08-08',
    aiReceiptCheck: 'Comprovante PIX autenticado pelo banco em 08/08/2026 às 14:22 no valor de R$ 220,00.'
  },
  {
    id: 'cob-gabriel-set2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-gabriel',
    mesReferencia: 'Setembro/2026',
    valor: 220.00,
    vencimento: '2026-09-10',
    status: 'pendente',
    metodoPagamento: 'pix',
    chavePix: 'financeiro@minhabase.com.br',
    linkPix: '00020126580014br.gov.bcb.pix0136financeiro@minhabase.com.br5204000053039865406220.005802BR5925MINHA BASE GESTAO ESPORTI6009SAO PAULO62070503***6304E1F2'
  },
  {
    id: 'cob-davi-ago2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-davi',
    mesReferencia: 'Agosto/2026',
    valor: 190.00,
    vencimento: '2026-08-10',
    status: 'pago',
    metodoPagamento: 'pix',
    chavePix: 'financeiro@minhabase.com.br',
    linkPix: '00020126580014br.gov.bcb.pix0136financeiro@minhabase.com.br5204000053039865406190.005802BR5925MINHA BASE GESTAO ESPORTI6009SAO PAULO62070503***6304A8B1',
    dataPagamento: '2026-08-08'
  },
  {
    id: 'cob-davi-set2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-davi',
    mesReferencia: 'Setembro/2026',
    valor: 190.00,
    vencimento: '2026-09-10',
    status: 'pendente',
    metodoPagamento: 'pix',
    chavePix: 'financeiro@minhabase.com.br',
    linkPix: '00020126580014br.gov.bcb.pix0136financeiro@minhabase.com.br5204000053039865406190.005802BR5925MINHA BASE GESTAO ESPORTI6009SAO PAULO62070503***6304A8B1'
  },
  {
    id: 'cob-enzo-ago2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-enzo',
    mesReferencia: 'Agosto/2026',
    valor: 220.00,
    vencimento: '2026-08-15',
    status: 'atrasado',
    metodoPagamento: 'pix',
    chavePix: 'financeiro@minhabase.com.br',
    linkPix: '00020126580014br.gov.bcb.pix0136financeiro@minhabase.com.br5204000053039865406220.005802BR5925MINHA BASE GESTAO ESPORTI6009SAO PAULO62070503***6304E1F2'
  }
];

export const initialContratos: Contrato[] = [
  {
    id: 'cont-gabriel-2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-gabriel',
    responsavelId: 'resp-marcos',
    titulo: 'Contrato de Prestação de Serviços de Formação Esportiva 2026',
    status: 'assinado',
    dataAssinatura: '2026-01-15',
    conteudoTermo: 'Pelo presente instrumento, a Minha Base - Gestão Esportiva e o Responsável Legal pactuam a prestação de treinos técnicos, físicos e táticos conforme grade horária.'
  },
  {
    id: 'cont-davi-2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-davi',
    responsavelId: 'resp-marcos',
    titulo: 'Termo de Matrícula Futsal Iniciação 2026',
    status: 'assinado',
    dataAssinatura: '2026-02-01',
    conteudoTermo: 'Autorização expressa de participação em jogos recreativos, festivais e atividades pedagógicas de futsal.'
  },
  {
    id: 'cont-enzo-2026',
    tenantId: DEFAULT_TENANT_ID,
    alunoId: 'aluno-enzo',
    responsavelId: 'resp-ana',
    titulo: 'Contrato de Formação Esportiva - Sub-11 Campo',
    status: 'assinado',
    dataAssinatura: '2026-01-20'
  }
];

export const initialComunicados: Comunicado[] = [
  {
    id: 'com-1',
    tenantId: DEFAULT_TENANT_ID,
    titulo: '🏆 Festival Interno de Futebol & Futsal de Base - Sábado 30/08',
    mensagem: 'Convidamos todas as famílias e atletas para o nosso grande Festival Interno! Teremos jogos amistosos para todas as categorias Sub-9 a Sub-15, entrega de medalhas de participação, praça de alimentação e sorteio de camisas oficiais. Cheguem com 30 minutos de antecedência com o uniforme oficial.',
    dataEnvio: '2026-08-21T10:00:00Z',
    autor: 'Coordenação Pedagógica',
    destinatarios: { tipo: 'todos' },
    urgencia: 'alta'
  },
  {
    id: 'com-2',
    tenantId: DEFAULT_TENANT_ID,
    titulo: '👟 Avaliação Técnica Trimestral e Entrega de Boletins',
    mensagem: 'Os boletins individuais com notas de fundamentos técnicos (passe, drible, finalização) e testes físicos já estão sendo atualizados no aplicativo. Os responsáveis podem acessar a aba "Avaliação do Atleta" para acompanhar os gráficos de evolução.',
    dataEnvio: '2026-08-19T14:30:00Z',
    autor: 'Prof. Carlos Silva',
    destinatarios: { tipo: 'turma', turmaId: 'turma-sub11-campo-tarde' },
    urgencia: 'normal'
  },
  {
    id: 'com-3',
    tenantId: DEFAULT_TENANT_ID,
    titulo: '💧 Lembrete de Hidratação e Protetor Solar',
    mensagem: 'Devido à elevação das temperaturas nos treinos vespertinos, solicitamos que cada atleta traga sua garrafa de água individual devidamente identificada e faça uso de protetor solar.',
    dataEnvio: '2026-08-16T08:00:00Z',
    autor: 'Diretoria Médica & Saúde',
    destinatarios: { tipo: 'todos' },
    urgencia: 'normal'
  }
];

// Helper to seed or sync Firestore
export async function seedFirestoreDatabase(force = false) {
  try {
    const tenantDocRef = doc(db, 'tenants', DEFAULT_TENANT_ID);
    const tenantSnap = await getDoc(tenantDocRef);

    if (tenantSnap.exists() && !force) {
      if (tenantSnap.data()?.nome === 'Academia Craques do Futuro') {
        await setDoc(tenantDocRef, initialTenant, { merge: true });
        await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/contratos`, initialContratos[0].id), initialContratos[0], { merge: true });
      }
      // Guarantee Master user pccfontoura@gmail.com is saved in Firestore
      const masterRef = doc(db, `tenants/${DEFAULT_TENANT_ID}/usuarios`, initialUsuarios[0].id);
      const masterSnap = await getDoc(masterRef);
      if (!masterSnap.exists() || masterSnap.data()?.senha === 'senha123') {
        await setDoc(masterRef, initialUsuarios[0], { merge: true });
      }
      console.log('Database already seeded for tenant:', DEFAULT_TENANT_ID);
      return;
    }

    console.log('Seeding initial multi-tenant soccer academy database...');

    // 1. Tenant Root
    await setDoc(tenantDocRef, initialTenant);
    await setDoc(doc(db, 'tenants', secondTenant.id), secondTenant);

    // 2. Filiais
    for (const item of initialFiliais) {
      await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/filiais`, item.id), item);
    }

    // 3. Usuarios
    for (const item of initialUsuarios) {
      const targetTenant = item.tenantId || DEFAULT_TENANT_ID;
      await setDoc(doc(db, `tenants/${targetTenant}/usuarios`, item.id), item);
    }

    // 4. Categorias
    for (const item of initialCategorias) {
      await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/categorias`, item.id), item);
    }

    // 5. Turmas
    for (const item of initialTurmas) {
      await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/turmas`, item.id), item);
    }

    // 6. Responsaveis
    for (const item of initialResponsaveis) {
      await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/responsaveis`, item.id), item);
    }

    // 7. Alunos
    for (const item of initialAlunos) {
      await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/alunos`, item.id), item);
    }

    // 8. Matriculas
    for (const item of initialMatriculas) {
      await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/matriculas`, item.id), item);
    }

    // 9. Treinos + Presencas subcollection
    for (const treino of initialTreinos) {
      await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/treinos`, treino.id), treino);
      const presencas = initialPresencasMap[treino.id];
      if (presencas) {
        for (const [alunoId, presenca] of Object.entries(presencas)) {
          await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/treinos/${treino.id}/presencas`, alunoId), presenca);
        }
      }
    }

    // 10. Avaliacoes Tecnicas
    for (const item of initialAvaliacoes) {
      await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/avaliacoesTecnicas`, item.id), item);
    }

    // 11. Cobrancas
    for (const item of initialCobrancas) {
      await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/cobrancas`, item.id), item);
    }

    // 12. Contratos
    for (const item of initialContratos) {
      await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/contratos`, item.id), item);
    }

    // 13. Comunicados
    for (const item of initialComunicados) {
      await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/comunicados`, item.id), item);
    }

    // 14. Dicas de Treino
    for (const item of initialDicasTreino) {
      await setDoc(doc(db, `tenants/${DEFAULT_TENANT_ID}/dicasTreino`, item.id), item);
    }

    console.log('Multi-tenant database seeded successfully!');
  } catch (error) {
    console.warn('Firestore seed fallback (using active local state):', error);
  }
}
