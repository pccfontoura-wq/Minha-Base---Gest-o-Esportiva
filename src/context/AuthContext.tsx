import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  seedFirestoreDatabase, DEFAULT_TENANT_ID, 
  initialTenant, initialTenantsList, initialFiliais, initialUsuarios, initialCategorias, 
  initialTurmas, initialResponsaveis, initialAlunos, initialMatriculas, 
  initialTreinos, initialPresencasMap, initialAvaliacoes, initialDicasTreino, 
  initialCobrancas, initialContratos, initialComunicados 
} from '../firebase/seed';
import { 
  Tenant, Filial, Usuario, Categoria, Turma, Responsavel, 
  Aluno, Matricula, Treino, Presenca, AvaliacaoTecnica, DicaTreino, 
  Cobranca, Contrato, Comunicado, UserRole 
} from '../types';

interface AuthContextType {
  tenant: Tenant;
  user: Usuario;
  isAuthenticated: boolean;
  allTenants: Tenant[];
  filiais: Filial[];
  usuarios: Usuario[];
  categorias: Categoria[];
  turmas: Turma[];
  responsaveis: Responsavel[];
  alunos: Aluno[];
  matriculas: Matricula[];
  treinos: Treino[];
  presencasMap: Record<string, Record<string, Presenca>>; // treinoId -> { alunoId -> Presenca }
  avaliacoes: AvaliacaoTecnica[];
  dicasTreino: DicaTreino[];
  cobrancas: Cobranca[];
  contratos: Contrato[];
  comunicados: Comunicado[];
  loading: boolean;
  
  // Authentication & Passwords
  login: (identificador: string, senhaDigitada: string) => Promise<{ success: boolean; error?: string; user?: Usuario }>;
  recuperarAcessoPorEmail: (email: string) => Promise<{
    success: boolean;
    error?: string;
    recoveryInfo?: {
      nome: string;
      username: string;
      email: string;
      instituicaoNome: string;
      senhaTemporaria: string;
    };
  }>;
  logout: () => void;
  trocarSenha: (novaSenha: string) => Promise<{ success: boolean; error?: string }>;
  trocarSenhaUsuario: (usuarioId: string, novaSenha: string) => Promise<void>;
  cadastrarUsuario: (novoUsuario: Omit<Usuario, 'id' | 'tenantId'> & { tenantId?: string }) => Promise<void>;
  updateUsuario: (usuarioId: string, dados: Partial<Usuario>) => Promise<void>;
  deleteUsuario: (usuarioId: string) => Promise<void>;
  toggleAtivoUsuario: (usuarioId: string) => Promise<void>;

  // Multi-tenant actions
  switchTenant: (tenantId: string) => void;
  createTenant: (tenantData: Partial<Tenant>) => Promise<Tenant>;
  updateTenant: (tenantData: Partial<Tenant>) => Promise<void>;
  
  // Profile / Role switcher
  switchUser: (usuarioId: string) => void;
  switchRole: (role: UserRole) => void;
  
  // CRUD actions for Tenant
  addFilial: (filial: Omit<Filial, 'id' | 'tenantId'>) => Promise<void>;
  updateFilial: (id: string, filial: Partial<Filial>) => Promise<void>;
  deleteFilial: (id: string) => Promise<void>;
  
  addCategoria: (cat: Omit<Categoria, 'id' | 'tenantId'>) => Promise<void>;
  updateCategoria: (id: string, cat: Partial<Categoria>) => Promise<void>;
  deleteCategoria: (id: string) => Promise<void>;
  
  addTurma: (turma: Omit<Turma, 'id' | 'tenantId'>) => Promise<void>;
  updateTurma: (id: string, turma: Partial<Turma>) => Promise<void>;
  deleteTurma: (id: string) => Promise<void>;
  
  addResponsavel: (resp: Omit<Responsavel, 'id' | 'tenantId'>) => Promise<string>;
  updateResponsavel: (id: string, resp: Partial<Responsavel>) => Promise<void>;
  deleteResponsavel: (id: string) => Promise<void>;
  
  addAluno: (aluno: Omit<Aluno, 'id' | 'tenantId'>, matriculaInfo?: { plano: string; valor: number; diaVencimento: number }) => Promise<string>;
  updateAluno: (id: string, aluno: Partial<Aluno>) => Promise<void>;
  deleteAluno: (id: string) => Promise<void>;
  
  addTreino: (treino: Omit<Treino, 'id' | 'tenantId'>) => Promise<string>;
  updateTreino: (id: string, treino: Partial<Treino>) => Promise<void>;
  savePresencas: (treinoId: string, presencas: Record<string, Presenca>) => Promise<void>;
  salvarPresencasTreino: (treinoId: string, presencas: Presenca[]) => Promise<void>;
  enviarNotificacaoPresenca: (alunoId: string, treinoId: string, status: string) => Promise<void>;
  
  addAvaliacao: (avaliacao: Omit<AvaliacaoTecnica, 'id' | 'tenantId'>) => Promise<string>;
  updateAvaliacao: (id: string, avaliacao: Partial<AvaliacaoTecnica>) => Promise<void>;
  
  addDicaTreino: (dica: Omit<DicaTreino, 'id' | 'tenantId'>) => Promise<string>;
  updateDicaTreino: (id: string, dica: Partial<DicaTreino>) => Promise<void>;
  deleteDicaTreino: (id: string) => Promise<void>;
  
  addCobranca: (cobranca: Omit<Cobranca, 'id' | 'tenantId'>) => Promise<void>;
  updateCobranca: (id: string, cobranca: Partial<Cobranca>) => Promise<void>;
  marcarCobrancaComoPaga: (id: string, comprovanteUrl?: string, aiCheck?: string) => Promise<void>;
  
  addComunicado: (comunicado: Omit<Comunicado, 'id' | 'tenantId'>) => Promise<void>;
  deleteComunicado: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allTenants, setAllTenants] = useState<Tenant[]>(initialTenantsList);

  // Stored session recovery
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('escolafut_user_session');
      return !!stored;
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<Usuario>(() => {
    try {
      const stored = localStorage.getItem('escolafut_user_session');
      if (stored) {
        return JSON.parse(stored) as Usuario;
      }
    } catch (e) {
      console.warn('Error reading stored user session:', e);
    }
    return initialUsuarios[0]; // Master pcfontoura by default
  });

  const [tenant, setTenant] = useState<Tenant>(() => {
    try {
      const storedTenant = localStorage.getItem('escolafut_tenant_session');
      if (storedTenant) {
        return JSON.parse(storedTenant) as Tenant;
      }
      const storedUser = localStorage.getItem('escolafut_user_session');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as Usuario;
        const foundTenant = initialTenantsList.find(t => t.id === parsedUser.tenantId);
        if (foundTenant) return foundTenant;
      }
    } catch {
      // ignore
    }
    return initialTenant;
  });

  const [filiais, setFiliais] = useState<Filial[]>(initialFiliais);
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [categorias, setCategorias] = useState<Categoria[]>(initialCategorias);
  const [turmas, setTurmas] = useState<Turma[]>(initialTurmas);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>(initialResponsaveis);
  const [alunos, setAlunos] = useState<Aluno[]>(initialAlunos);
  const [matriculas, setMatriculas] = useState<Matricula[]>(initialMatriculas);
  const [treinos, setTreinos] = useState<Treino[]>(initialTreinos);
  const [presencasMap, setPresencasMap] = useState<Record<string, Record<string, Presenca>>>(initialPresencasMap);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoTecnica[]>(initialAvaliacoes);
  const [dicasTreino, setDicasTreino] = useState<DicaTreino[]>(initialDicasTreino);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>(initialCobrancas);
  const [contratos, setContratos] = useState<Contrato[]>(initialContratos);
  const [comunicados, setComunicados] = useState<Comunicado[]>(initialComunicados);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize and try syncing with Firestore on mount
  useEffect(() => {
    async function initDb() {
      try {
        await seedFirestoreDatabase();
        // Load all tenants registered in Firestore
        const tenantsSnap = await getDocs(collection(db, 'tenants'));
        let activeTenants = [...initialTenantsList];
        if (!tenantsSnap.empty) {
          const tMap = new Map<string, Tenant>();
          initialTenantsList.forEach(t => tMap.set(t.id, t));
          tenantsSnap.docs.forEach(d => {
            const data = d.data() as Tenant;
            tMap.set(d.id, { ...data, id: d.id });
          });
          activeTenants = Array.from(tMap.values());
          setAllTenants(activeTenants);
        }

        // Load users across all registered tenants so login & recovery can verify institution bindings
        const userMap = new Map<string, Usuario>();
        initialUsuarios.forEach(u => userMap.set(u.id, u));
        for (const t of activeTenants) {
          try {
            const uSnap = await getDocs(collection(db, `tenants/${t.id}/usuarios`));
            uSnap.docs.forEach(d => {
              userMap.set(d.id, { ...d.data(), id: d.id, tenantId: (d.data() as Usuario).tenantId || t.id } as Usuario);
            });
          } catch {
            // ignore individual tenant user read error
          }
        }
        setUsuarios(Array.from(userMap.values()));

        await loadFirestoreData(tenant.id);
      } catch (err) {
        console.warn('Using local pre-seeded data state:', err);
      }
    }
    initDb();
  }, []);

  // Sync listener when tenant changes
  const loadFirestoreData = async (tenantId: string) => {
    const isDefault = tenantId === DEFAULT_TENANT_ID;
    try {
      // 0. Usuarios (keep global user map updated with this tenant's users)
      const uSnap = await getDocs(collection(db, `tenants/${tenantId}/usuarios`));
      if (!uSnap.empty) {
        const firestoreUsers = uSnap.docs.map(d => ({ ...d.data(), id: d.id, tenantId: (d.data() as Usuario).tenantId || tenantId } as Usuario));
        setUsuarios(prev => {
          const userMap = new Map<string, Usuario>();
          initialUsuarios.forEach(u => userMap.set(u.id, u));
          prev.forEach(u => userMap.set(u.id, u));
          firestoreUsers.forEach(u => userMap.set(u.id, u));
          return Array.from(userMap.values());
        });
      }

      // 1. Filiais
      const fSnap = await getDocs(collection(db, `tenants/${tenantId}/filiais`));
      setFiliais(!fSnap.empty ? fSnap.docs.map(d => ({ ...d.data(), id: d.id } as Filial)) : (isDefault ? initialFiliais : []));

      // 2. Categorias
      const catSnap = await getDocs(collection(db, `tenants/${tenantId}/categorias`));
      setCategorias(!catSnap.empty ? catSnap.docs.map(d => ({ ...d.data(), id: d.id } as Categoria)) : (isDefault ? initialCategorias : []));

      // 3. Turmas
      const tSnap = await getDocs(collection(db, `tenants/${tenantId}/turmas`));
      setTurmas(!tSnap.empty ? tSnap.docs.map(d => ({ ...d.data(), id: d.id } as Turma)) : (isDefault ? initialTurmas : []));

      // 4. Responsaveis
      const rSnap = await getDocs(collection(db, `tenants/${tenantId}/responsaveis`));
      setResponsaveis(!rSnap.empty ? rSnap.docs.map(d => ({ ...d.data(), id: d.id } as Responsavel)) : (isDefault ? initialResponsaveis : []));

      // 5. Alunos
      const aSnap = await getDocs(collection(db, `tenants/${tenantId}/alunos`));
      if (!aSnap.empty) {
        const defaultMap = new Map<string, Aluno>();
        initialAlunos.forEach(a => defaultMap.set(a.id, a));
        setAlunos(aSnap.docs.map(d => {
          const def = defaultMap.get(d.id);
          return { ...(def || {}), ...d.data(), id: d.id } as Aluno;
        }));
      } else {
        setAlunos(isDefault ? initialAlunos : []);
      }

      // 6. Matriculas
      const mSnap = await getDocs(collection(db, `tenants/${tenantId}/matriculas`));
      setMatriculas(!mSnap.empty ? mSnap.docs.map(d => ({ ...d.data(), id: d.id } as Matricula)) : (isDefault ? initialMatriculas : []));

      // 7. Treinos
      const trSnap = await getDocs(collection(db, `tenants/${tenantId}/treinos`));
      setTreinos(!trSnap.empty ? trSnap.docs.map(d => ({ ...d.data(), id: d.id } as Treino)) : (isDefault ? initialTreinos : []));

      // 8. Avaliacoes
      const avSnap = await getDocs(collection(db, `tenants/${tenantId}/avaliacoesTecnicas`));
      if (!avSnap.empty) {
        const firestoreAvals = avSnap.docs.map(d => ({ ...d.data(), id: d.id } as AvaliacaoTecnica));
        if (isDefault) {
          const avMap = new Map<string, AvaliacaoTecnica>();
          initialAvaliacoes.forEach(a => avMap.set(a.id, a));
          firestoreAvals.forEach(a => avMap.set(a.id, a));
          setAvaliacoes(Array.from(avMap.values()));
        } else {
          setAvaliacoes(firestoreAvals);
        }
      } else {
        setAvaliacoes(isDefault ? initialAvaliacoes : []);
      }

      // 8.1 Dicas de Treino
      const dicSnap = await getDocs(collection(db, `tenants/${tenantId}/dicasTreino`));
      setDicasTreino(!dicSnap.empty ? dicSnap.docs.map(d => ({ ...d.data(), id: d.id } as DicaTreino)) : (isDefault ? initialDicasTreino : []));

      // 9. Cobrancas
      const cobSnap = await getDocs(collection(db, `tenants/${tenantId}/cobrancas`));
      setCobrancas(!cobSnap.empty ? cobSnap.docs.map(d => ({ ...d.data(), id: d.id } as Cobranca)) : (isDefault ? initialCobrancas : []));

      // 10. Comunicados
      const comSnap = await getDocs(collection(db, `tenants/${tenantId}/comunicados`));
      setComunicados(!comSnap.empty ? comSnap.docs.map(d => ({ ...d.data(), id: d.id } as Comunicado)) : (isDefault ? initialComunicados : []));
    } catch (e) {
      console.log('Firestore load error (falling back to memory state):', e);
    }
  };

  // Helper to resolve an institution by ID, Name or CNPJ
  const resolveTenantByInput = (input?: string): Tenant | undefined => {
    if (!input || !input.trim()) return undefined;
    const clean = input.trim().toLowerCase();
    return (
      allTenants.find(t => t.id.toLowerCase() === clean) ||
      allTenants.find(t => t.nome.toLowerCase() === clean) ||
      allTenants.find(t => t.cnpj && t.cnpj.replace(/\D/g, '') === clean.replace(/\D/g, '') && clean.replace(/\D/g, '').length >= 8) ||
      allTenants.find(t => t.nome.toLowerCase().includes(clean))
    );
  };

  // Auth Methods
  const login = async (
    identificador: string,
    senhaDigitada: string
  ): Promise<{ success: boolean; error?: string; user?: Usuario }> => {
    const cleanId = identificador.trim().toLowerCase();

    // Combined list of users across all institutions
    const allKnownUsers = [...usuarios];
    initialUsuarios.forEach(iu => {
      if (!allKnownUsers.some(u => u.id === iu.id)) {
        allKnownUsers.push(iu);
      }
    });

    // 1. Check if logging in as Master user (pccfontoura@gmail.com)
    const masterCandidate = allKnownUsers.find(
      u =>
        (u.isMaster || u.papel === 'master') &&
        ((u.email && u.email.toLowerCase() === cleanId) ||
          (u.username && u.username.toLowerCase() === cleanId) ||
          cleanId === 'pccfontoura@gmail.com' ||
          cleanId === 'pcfontoura')
    );

    if (masterCandidate) {
      if (masterCandidate.ativo === false) {
        return { success: false, error: 'Esta conta está desativada no sistema.' };
      }

      const expectedMasterPassword = masterCandidate.senha || 'senha123';
      if (senhaDigitada !== expectedMasterPassword) {
        return { success: false, error: 'Senha incorreta para o usuário informado.' };
      }

      const activeTenantForMaster = tenant || allTenants[0] || initialTenant;

      const updatedMaster: Usuario = {
        ...masterCandidate,
        email: 'pccfontoura@gmail.com',
        papel: 'master',
        isMaster: true,
        precisaTrocarSenha: expectedMasterPassword === 'senha123' ? true : Boolean(masterCandidate.precisaTrocarSenha),
        ultimoLogin: new Date().toISOString()
      };

      setTenant(activeTenantForMaster);
      setUser(updatedMaster);
      setIsAuthenticated(true);
      await loadFirestoreData(activeTenantForMaster.id);

      try {
        localStorage.setItem('escolafut_user_session', JSON.stringify(updatedMaster));
        localStorage.setItem('escolafut_tenant_session', JSON.stringify(activeTenantForMaster));
      } catch (e) {
        console.warn('Storage save warning:', e);
      }

      return { success: true, user: updatedMaster };
    }

    // 2. Find the user by username or email and automatically detect their linked institution
    const found = allKnownUsers.find(
      u =>
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.email && u.email.toLowerCase() === cleanId)
    );

    if (!found) {
      return { success: false, error: 'Usuário ou e-mail não encontrado. Verifique os dados digitados.' };
    }

    // Verify active status
    if (found.ativo === false) {
      return { success: false, error: 'Esta conta de usuário está desativada no sistema. Contate a administração.' };
    }

    // Verify password
    const expectedPassword = found.senha || 'senha123';
    if (senhaDigitada !== expectedPassword) {
      return { success: false, error: 'Senha incorreta para o usuário informado.' };
    }

    // Automatically resolve the user's linked institution (tenantId)
    const linkedTenant = allTenants.find(t => t.id === found.tenantId);
    if (!linkedTenant) {
      return {
        success: false,
        error: 'Este usuário não possui uma instituição vinculada ativa cadastrada no sistema.'
      };
    }

    const updatedUser: Usuario = {
      ...found,
      ultimoLogin: new Date().toISOString()
    };

    // Open ONLY the user's linked institution
    setTenant(linkedTenant);
    setUser(updatedUser);
    setIsAuthenticated(true);
    await loadFirestoreData(linkedTenant.id);

    try {
      localStorage.setItem('escolafut_user_session', JSON.stringify(updatedUser));
      localStorage.setItem('escolafut_tenant_session', JSON.stringify(linkedTenant));
    } catch (e) {
      console.warn('Storage save warning:', e);
    }

    return { success: true, user: updatedUser };
  };

  const recuperarAcessoPorEmail = async (
    emailInformado: string
  ): Promise<{
    success: boolean;
    error?: string;
    recoveryInfo?: {
      nome: string;
      username: string;
      email: string;
      instituicaoNome: string;
      senhaTemporaria: string;
    };
  }> => {
    const cleanEmail = emailInformado.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Por favor, digite um endereço de e-mail válido.' };
    }

    const allKnownUsers = [...usuarios];
    initialUsuarios.forEach(iu => {
      if (!allKnownUsers.some(u => u.id === iu.id)) {
        allKnownUsers.push(iu);
      }
    });

    const found = allKnownUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return {
        success: false,
        error: 'Nenhum usuário encontrado com este e-mail cadastrado. Verifique o e-mail informado ou procure a administração da sua instituição.'
      };
    }

    const linkedTenant = allTenants.find(t => t.id === found.tenantId) || initialTenant;
    const senhaRecuperada = found.senha || 'senha123';

    return {
      success: true,
      recoveryInfo: {
        nome: found.nome,
        username: found.username || found.email.split('@')[0],
        email: found.email,
        instituicaoNome: found.isMaster || found.papel === 'master' ? `${linkedTenant.nome} (Acesso Master Global)` : linkedTenant.nome,
        senhaTemporaria: senhaRecuperada
      }
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('escolafut_user_session');
      localStorage.removeItem('escolafut_tenant_session');
    } catch (e) {
      console.warn(e);
    }
  };

  const trocarSenha = async (novaSenha: string): Promise<{ success: boolean; error?: string }> => {
    if (!novaSenha || novaSenha.trim().length < 6) {
      return { success: false, error: 'A nova senha deve possuir pelo menos 6 caracteres.' };
    }
    if (novaSenha === 'senha123') {
      return { success: false, error: 'A nova senha deve ser diferente da senha inicial provisória (senha123).' };
    }

    const updatedUser: Usuario = {
      ...user,
      senha: novaSenha,
      precisaTrocarSenha: false,
    };

    setUser(updatedUser);
    setUsuarios(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    try {
      localStorage.setItem('escolafut_user_session', JSON.stringify(updatedUser));
      const targetTenantForWrite = updatedUser.isMaster || updatedUser.papel === 'master' ? DEFAULT_TENANT_ID : (updatedUser.tenantId || tenant.id);
      await setDoc(doc(db, `tenants/${targetTenantForWrite}/usuarios`, updatedUser.id), updatedUser, { merge: true });
    } catch (err) {
      console.warn('Firestore password change fallback:', err);
    }

    return { success: true };
  };

  const trocarSenhaUsuario = async (usuarioId: string, novaSenha: string): Promise<void> => {
    setUsuarios(prev => prev.map(u => {
      if (u.id === usuarioId) {
        return { ...u, senha: novaSenha, precisaTrocarSenha: false };
      }
      return u;
    }));
    try {
      await updateDoc(doc(db, `tenants/${tenant.id}/usuarios`, usuarioId), {
        senha: novaSenha,
        precisaTrocarSenha: false
      });
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const cadastrarUsuario = async (novoUsuario: Omit<Usuario, 'id' | 'tenantId'> & { tenantId?: string }): Promise<void> => {
    const id = 'user-' + Math.random().toString(36).substring(2, 9);
    const isMasterUser = user.papel === 'master' || Boolean(user.isMaster);
    const targetTenantId = isMasterUser && novoUsuario.tenantId ? novoUsuario.tenantId : tenant.id;
    const u: Usuario = {
      ...novoUsuario,
      id,
      tenantId: targetTenantId,
      ativo: novoUsuario.ativo !== false,
      senha: novoUsuario.senha || 'senha123',
      precisaTrocarSenha: novoUsuario.precisaTrocarSenha ?? false
    };
    setUsuarios(prev => [...prev, u]);
    try {
      await setDoc(doc(db, `tenants/${targetTenantId}/usuarios`, id), u);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const updateUsuario = async (usuarioId: string, dados: Partial<Usuario>): Promise<void> => {
    const existingUser = usuarios.find(u => u.id === usuarioId);
    const targetTenantId = dados.tenantId || existingUser?.tenantId || tenant.id;
    setUsuarios(prev => prev.map(u => (u.id === usuarioId ? { ...u, ...dados } : u)));
    if (user.id === usuarioId) {
      const updated = { ...user, ...dados };
      setUser(updated);
      try {
        localStorage.setItem('escolafut_user_session', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
    }
    try {
      await updateDoc(doc(db, `tenants/${targetTenantId}/usuarios`, usuarioId), dados);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const deleteUsuario = async (usuarioId: string): Promise<void> => {
    const existingUser = usuarios.find(u => u.id === usuarioId);
    const targetTenantId = existingUser?.tenantId || tenant.id;
    setUsuarios(prev => prev.filter(u => u.id !== usuarioId));
    try {
      await deleteDoc(doc(db, `tenants/${targetTenantId}/usuarios`, usuarioId));
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const toggleAtivoUsuario = async (usuarioId: string): Promise<void> => {
    const target = usuarios.find(u => u.id === usuarioId);
    if (!target) return;
    const novoStatus = !(target.ativo !== false);
    await updateUsuario(usuarioId, { ativo: novoStatus });
  };

  const switchTenant = (tenantId: string) => {
    // Only Master user can switch across institutions when authenticated
    const isMasterUser = user.papel === 'master' || Boolean(user.isMaster);
    if (isAuthenticated && !isMasterUser && tenantId !== user.tenantId) {
      return;
    }
    const found = allTenants.find(t => t.id === tenantId);
    if (found) {
      setTenant(found);
      try {
        localStorage.setItem('escolafut_tenant_session', JSON.stringify(found));
      } catch {
        // ignore
      }
      loadFirestoreData(tenantId);
    }
  };

  const createTenant = async (tenantData: Partial<Tenant>): Promise<Tenant> => {
    const newId = (tenantData.nome || 'nova-escolinha')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const newTenant: Tenant = {
      id: newId,
      nome: tenantData.nome || 'Nova Escola de Futebol',
      cnpj: tenantData.cnpj || '',
      logoUrl: tenantData.logoUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=80',
      corPrimaria: tenantData.corPrimaria || '#1b5e20',
      plano: tenantData.plano || 'basic',
      statusAssinatura: 'ativa',
      modalidadesAtivas: tenantData.modalidadesAtivas || ['campo', 'futsal'],
      email: tenantData.email || '',
      telefone: tenantData.telefone || '',
      endereco: tenantData.endereco || '',
      cidade: tenantData.cidade || 'São Paulo',
      estado: tenantData.estado || 'SP',
      chavePixPadrao: tenantData.chavePixPadrao || ''
    };

    setAllTenants(prev => [...prev, newTenant]);
    setTenant(newTenant);
    try {
      localStorage.setItem('escolafut_tenant_session', JSON.stringify(newTenant));
    } catch {
      // ignore
    }

    try {
      await setDoc(doc(db, 'tenants', newId), newTenant);
    } catch (err) {
      console.warn('Firestore write tenant fallback:', err);
    }

    await loadFirestoreData(newId);
    return newTenant;
  };

  const updateTenant = async (tenantData: Partial<Tenant>) => {
    const updated = { ...tenant, ...tenantData };
    setTenant(updated);
    setAllTenants(prev => prev.map(t => (t.id === tenant.id ? updated : t)));
    try {
      localStorage.setItem('escolafut_tenant_session', JSON.stringify(updated));
      await setDoc(doc(db, 'tenants', tenant.id), updated, { merge: true });
    } catch (err) {
      console.warn('Firestore update tenant fallback:', err);
    }
  };

  const switchUser = (usuarioId: string) => {
    const found = usuarios.find(u => u.id === usuarioId);
    if (found) {
      setUser(found);
    }
  };

  const switchRole = (role: UserRole) => {
    const isMasterUser = user.papel === 'master' || Boolean(user.isMaster);
    // Only Master user can switch to 'master' role
    if (role === 'master' && !isMasterUser) {
      return;
    }
    const match = usuarios.find(
      u =>
        (u.tenantId === tenant.id || (role === 'master' && (u.papel === 'master' || u.isMaster))) &&
        (u.papel === role || (role === 'tecnico' && u.papel === 'treinador') || (role === 'treinador' && u.papel === 'tecnico'))
    );
    if (match) {
      setUser(isMasterUser ? { ...match, isMaster: true } : match);
    } else {
      const defaultUser: Usuario = {
        id: `user-${role}-demo`,
        tenantId: tenant.id,
        nome: role === 'master' ? 'Master Admin' : role === 'admin' ? 'Administrador' : role === 'tecnico' || role === 'treinador' ? 'Técnico / Treinador' : 'Responsável (Pai)',
        email: `${role}@escolinha.com`,
        papel: role,
        isMaster: isMasterUser,
        ativo: true,
      };
      setUser(defaultUser);
    }
  };

  // CRUD Filiais
  const addFilial = async (filial: Omit<Filial, 'id' | 'tenantId'>) => {
    const id = 'filial-' + Math.random().toString(36).substring(2, 9);
    const newFilial: Filial = { ...filial, id, tenantId: tenant.id };
    setFiliais(prev => [...prev, newFilial]);
    try {
      await setDoc(doc(db, `tenants/${tenant.id}/filiais`, id), newFilial);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const updateFilial = async (id: string, patch: Partial<Filial>) => {
    setFiliais(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));
    try {
      await updateDoc(doc(db, `tenants/${tenant.id}/filiais`, id), patch);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const deleteFilial = async (id: string) => {
    setFiliais(prev => prev.filter(f => f.id !== id));
    try {
      await deleteDoc(doc(db, `tenants/${tenant.id}/filiais`, id));
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  // CRUD Categorias
  const addCategoria = async (cat: Omit<Categoria, 'id' | 'tenantId'>) => {
    const id = 'cat-' + Math.random().toString(36).substring(2, 9);
    const newCat: Categoria = { ...cat, id, tenantId: tenant.id };
    setCategorias(prev => [...prev, newCat]);
    try {
      await setDoc(doc(db, `tenants/${tenant.id}/categorias`, id), newCat);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const updateCategoria = async (id: string, patch: Partial<Categoria>) => {
    setCategorias(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
    try {
      await updateDoc(doc(db, `tenants/${tenant.id}/categorias`, id), patch);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const deleteCategoria = async (id: string) => {
    setCategorias(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, `tenants/${tenant.id}/categorias`, id));
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  // CRUD Turmas
  const addTurma = async (turma: Omit<Turma, 'id' | 'tenantId'>) => {
    const id = 'turma-' + Math.random().toString(36).substring(2, 9);
    const newTurma: Turma = { ...turma, id, tenantId: tenant.id };
    setTurmas(prev => [...prev, newTurma]);
    try {
      await setDoc(doc(db, `tenants/${tenant.id}/turmas`, id), newTurma);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const updateTurma = async (id: string, patch: Partial<Turma>) => {
    setTurmas(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
    try {
      await updateDoc(doc(db, `tenants/${tenant.id}/turmas`, id), patch);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const deleteTurma = async (id: string) => {
    setTurmas(prev => prev.filter(t => t.id !== id));
    try {
      await deleteDoc(doc(db, `tenants/${tenant.id}/turmas`, id));
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  // CRUD Responsaveis
  const addResponsavel = async (resp: Omit<Responsavel, 'id' | 'tenantId'>): Promise<string> => {
    const id = 'resp-' + Math.random().toString(36).substring(2, 9);
    const newResp: Responsavel = { ...resp, id, tenantId: tenant.id };
    setResponsaveis(prev => [...prev, newResp]);
    try {
      await setDoc(doc(db, `tenants/${tenant.id}/responsaveis`, id), newResp);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
    return id;
  };

  const updateResponsavel = async (id: string, patch: Partial<Responsavel>) => {
    setResponsaveis(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
    try {
      await updateDoc(doc(db, `tenants/${tenant.id}/responsaveis`, id), patch);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const deleteResponsavel = async (id: string) => {
    setResponsaveis(prev => prev.filter(r => r.id !== id));
    try {
      await deleteDoc(doc(db, `tenants/${tenant.id}/responsaveis`, id));
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  // CRUD Alunos & Matriculas
  const addAluno = async (
    aluno: Omit<Aluno, 'id' | 'tenantId'>, 
    matriculaInfo?: { plano: string; valor: number; diaVencimento: number }
  ): Promise<string> => {
    const alunoId = 'aluno-' + Math.random().toString(36).substring(2, 9);
    const newAluno: Aluno = { ...aluno, id: alunoId, tenantId: tenant.id, createdAt: new Date().toISOString() };
    
    setAlunos(prev => [...prev, newAluno]);
    
    // update responsavel list of alunos
    if (aluno.responsavelId) {
      setResponsaveis(prev => prev.map(r => {
        if (r.id === aluno.responsavelId) {
          const alunosIds = Array.from(new Set([...(r.alunosIds || []), alunoId]));
          return { ...r, alunosIds };
        }
        return r;
      }));
    }

    try {
      await setDoc(doc(db, `tenants/${tenant.id}/alunos`, alunoId), newAluno);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }

    // Auto-create matricula
    if (matriculaInfo) {
      const matId = 'mat-' + Math.random().toString(36).substring(2, 9);
      const newMat: Matricula = {
        id: matId,
        tenantId: tenant.id,
        alunoId,
        turmaId: aluno.turmaId,
        dataInicio: new Date().toISOString().split('T')[0],
        planoContratado: matriculaInfo.plano,
        valorMensalidade: matriculaInfo.valor,
        diaVencimento: matriculaInfo.diaVencimento,
        status: 'ativa'
      };
      setMatriculas(prev => [...prev, newMat]);
      try {
        await setDoc(doc(db, `tenants/${tenant.id}/matriculas`, matId), newMat);
      } catch (e) {
        console.warn('Firestore fallback', e);
      }

      // Generate first cobranca
      const cobId = 'cob-' + Math.random().toString(36).substring(2, 9);
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, matriculaInfo.diaVencimento);
      const newCob: Cobranca = {
        id: cobId,
        tenantId: tenant.id,
        alunoId,
        mesReferencia: `${nextMonth.toLocaleDateString('pt-BR', { month: 'long' })}/${nextMonth.getFullYear()}`,
        valor: matriculaInfo.valor,
        vencimento: nextMonth.toISOString().split('T')[0],
        status: 'pendente',
        metodoPagamento: 'pix',
        chavePix: tenant.chavePixPadrao || 'financeiro@escolinha.com.br',
        linkPix: `00020126580014br.gov.bcb.pix0136${tenant.chavePixPadrao || 'financeiro@escolinha.com.br'}520400005303986540${matriculaInfo.valor.toFixed(2)}5802BR5920ESCOLA FUTEBOL6009SAO PAULO62070503***6304`
      };
      setCobrancas(prev => [...prev, newCob]);
      try {
        await setDoc(doc(db, `tenants/${tenant.id}/cobrancas`, cobId), newCob);
      } catch (e) {
        console.warn('Firestore fallback', e);
      }
    }

    return alunoId;
  };

  const updateAluno = async (id: string, patch: Partial<Aluno>) => {
    setAlunos(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));
    try {
      await updateDoc(doc(db, `tenants/${tenant.id}/alunos`, id), patch);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const deleteAluno = async (id: string) => {
    setAlunos(prev => prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, `tenants/${tenant.id}/alunos`, id));
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  // Treinos & Presenças
  const addTreino = async (treino: Omit<Treino, 'id' | 'tenantId'>): Promise<string> => {
    const id = 'treino-' + Math.random().toString(36).substring(2, 9);
    const newTreino: Treino = { ...treino, id, tenantId: tenant.id };
    setTreinos(prev => [newTreino, ...prev]);
    try {
      await setDoc(doc(db, `tenants/${tenant.id}/treinos`, id), newTreino);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
    return id;
  };

  const updateTreino = async (id: string, patch: Partial<Treino>) => {
    setTreinos(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
    try {
      await updateDoc(doc(db, `tenants/${tenant.id}/treinos`, id), patch);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const savePresencas = async (treinoId: string, presencas: Record<string, Presenca>) => {
    setPresencasMap(prev => ({
      ...prev,
      [treinoId]: presencas
    }));

    // Mark treino as finalized
    setTreinos(prev => prev.map(t => t.id === treinoId ? { ...t, finalizado: true } : t));

    try {
      for (const [alunoId, p] of Object.entries(presencas)) {
        await setDoc(doc(db, `tenants/${tenant.id}/treinos/${treinoId}/presencas`, alunoId), p);
      }
      await updateDoc(doc(db, `tenants/${tenant.id}/treinos`, treinoId), { finalizado: true });
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const salvarPresencasTreino = async (treinoId: string, presencas: Presenca[]) => {
    const map: Record<string, Presenca> = {};
    presencas.forEach(p => {
      map[p.alunoId] = p;
    });
    await savePresencas(treinoId, map);
  };

  const enviarNotificacaoPresenca = async (alunoId: string, treinoId: string, status: string) => {
    console.log(`[Notification] Enviado aviso de presença: Aluno ${alunoId} Treino ${treinoId} Status ${status}`);
  };

  // Avaliações Técnicas
  const addAvaliacao = async (avaliacao: Omit<AvaliacaoTecnica, 'id' | 'tenantId'>): Promise<string> => {
    const id = 'aval-' + Math.random().toString(36).substring(2, 9);
    const newAval: AvaliacaoTecnica = { ...avaliacao, id, tenantId: tenant.id };
    setAvaliacoes(prev => [newAval, ...prev]);
    try {
      await setDoc(doc(db, `tenants/${tenant.id}/avaliacoesTecnicas`, id), newAval);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
    return id;
  };

  const updateAvaliacao = async (id: string, patch: Partial<AvaliacaoTecnica>) => {
    setAvaliacoes(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));
    try {
      await updateDoc(doc(db, `tenants/${tenant.id}/avaliacoesTecnicas`, id), patch);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  // Dicas de Treino
  const addDicaTreino = async (dica: Omit<DicaTreino, 'id' | 'tenantId'>): Promise<string> => {
    const id = 'dica-' + Math.random().toString(36).substring(2, 9);
    const newDica: DicaTreino = { ...dica, id, tenantId: tenant.id, createdAt: new Date().toISOString().split('T')[0] };
    setDicasTreino(prev => [newDica, ...prev]);
    try {
      await setDoc(doc(db, `tenants/${tenant.id}/dicasTreino`, id), newDica);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
    return id;
  };

  const updateDicaTreino = async (id: string, patch: Partial<DicaTreino>) => {
    setDicasTreino(prev => prev.map(d => (d.id === id ? { ...d, ...patch } : d)));
    try {
      await updateDoc(doc(db, `tenants/${tenant.id}/dicasTreino`, id), patch);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const deleteDicaTreino = async (id: string) => {
    setDicasTreino(prev => prev.filter(d => d.id !== id));
    try {
      await deleteDoc(doc(db, `tenants/${tenant.id}/dicasTreino`, id));
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  // Cobranças & PIX
  const addCobranca = async (cobranca: Omit<Cobranca, 'id' | 'tenantId'>) => {
    const id = 'cob-' + Math.random().toString(36).substring(2, 9);
    const newCob: Cobranca = { ...cobranca, id, tenantId: tenant.id };
    setCobrancas(prev => [newCob, ...prev]);
    try {
      await setDoc(doc(db, `tenants/${tenant.id}/cobrancas`, id), newCob);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const updateCobranca = async (id: string, patch: Partial<Cobranca>) => {
    setCobrancas(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
    try {
      await updateDoc(doc(db, `tenants/${tenant.id}/cobrancas`, id), patch);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const marcarCobrancaComoPaga = async (id: string, comprovanteUrl?: string, aiCheck?: string) => {
    const patch: Partial<Cobranca> = {
      status: 'pago',
      dataPagamento: new Date().toISOString().split('T')[0],
      ...(comprovanteUrl ? { comprovanteUrl } : {}),
      ...(aiCheck ? { aiReceiptCheck: aiCheck } : {})
    };
    await updateCobranca(id, patch);
  };

  // Comunicados
  const addComunicado = async (comunicado: Omit<Comunicado, 'id' | 'tenantId'>) => {
    const id = 'com-' + Math.random().toString(36).substring(2, 9);
    const newCom: Comunicado = { ...comunicado, id, tenantId: tenant.id };
    setComunicados(prev => [newCom, ...prev]);
    try {
      await setDoc(doc(db, `tenants/${tenant.id}/comunicados`, id), newCom);
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  const deleteComunicado = async (id: string) => {
    setComunicados(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, `tenants/${tenant.id}/comunicados`, id));
    } catch (e) {
      console.warn('Firestore fallback', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        tenant,
        user,
        isAuthenticated,
        allTenants,
        filiais,
        usuarios,
        categorias,
        turmas,
        responsaveis,
        alunos,
        matriculas,
        treinos,
        presencasMap,
        avaliacoes,
        dicasTreino,
        cobrancas,
        contratos,
        comunicados,
        loading,
        login,
        recuperarAcessoPorEmail,
        logout,
        trocarSenha,
        trocarSenhaUsuario,
        cadastrarUsuario,
        updateUsuario,
        deleteUsuario,
        toggleAtivoUsuario,
        switchTenant,
        createTenant,
        updateTenant,
        switchUser,
        switchRole,
        addFilial,
        updateFilial,
        deleteFilial,
        addCategoria,
        updateCategoria,
        deleteCategoria,
        addTurma,
        updateTurma,
        deleteTurma,
        addResponsavel,
        updateResponsavel,
        deleteResponsavel,
        addAluno,
        updateAluno,
        deleteAluno,
        addTreino,
        updateTreino,
        savePresencas,
        salvarPresencasTreino,
        enviarNotificacaoPresenca,
        addAvaliacao,
        updateAvaliacao,
        addDicaTreino,
        updateDicaTreino,
        deleteDicaTreino,
        addCobranca,
        updateCobranca,
        marcarCobrancaComoPaga,
        addComunicado,
        deleteComunicado
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
