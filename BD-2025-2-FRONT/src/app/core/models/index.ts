/**
 * ============================================
 * SIGEA Frontend - Models/Interfaces
 * ============================================
 * Alinhado com SIGEA.sql - Modelo Relacional
 * ============================================
 */

// ===== Response Types =====
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  pagination?: PaginationMeta; // Backend usa 'pagination'
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  order?: 'asc' | 'desc';
}

// ===== Auth =====
export type Role = 'ADMIN' | 'COORDENADOR' | 'PROFESSOR' | 'ALUNO';

export interface User {
  id: number;
  nome: string;
  email: string;
  role: Role;
  idProfessor?: number | null;
  idCoordenador?: number | null;
  idAluno?: number | null;
  professor?: Professor | null;
  coordenador?: Coordenador | null;
  aluno?: Aluno | null;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  role?: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ===== Escola =====
// Campos: id_escola, nome, cnpj, telefone, email, regiao_administrativa
export interface Escola {
  id: number;
  nome: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  regiaoAdministrativa?: string | null;
  _count?: {
    turmas?: number;
    professores?: number;
    coordenadores?: number;
  };
}

export interface EscolaInput {
  nome: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  regiaoAdministrativa?: string | null;
}

// ===== Coordenador =====
// Campos: id_coordenador, id_escola, nome, email, telefone
export interface Coordenador {
  id: number;
  idEscola: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  escola?: Escola;
}

export interface CoordenadorInput {
  idEscola: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
}

// ===== Professor =====
// Campos: id_professor, id_escola, nome, email, telefone
export interface Professor {
  id: number;
  idEscola: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  escola?: Escola;
  _count?: {
    turmasProfessores?: number;
  };
}

export interface ProfessorInput {
  idEscola: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
}

// ===== Turma =====
// Campos: id_turma, id_escola, nome, ano_letivo, serie, turno
export interface Turma {
  id: number;
  idEscola: number;
  nome: string;
  anoLetivo: number;
  serie?: string | null;
  turno?: string | null;
  escola?: Escola;
  _count?: {
    alunos?: number;
    turmasProfessores?: number;
  };
}

export interface TurmaInput {
  idEscola: number;
  nome: string;
  anoLetivo: number;
  serie?: string | null;
  turno?: string | null;
}

// ===== Aluno =====
// Campos: id_aluno, id_turma, nome, matricula, data_nascimento, email, telefone_responsavel
export interface Aluno {
  id: number;
  idTurma: number;
  nome: string;
  matricula: string;
  dataNascimento?: string | null;
  email?: string | null;
  telefoneResponsavel?: string | null;
  turma?: Turma;
}

export interface AlunoInput {
  idTurma: number;
  nome: string;
  matricula: string;
  dataNascimento?: string | null;
  email?: string | null;
  telefoneResponsavel?: string | null;
}

// ===== Disciplina =====
// Campos: id_disciplina, nome, carga_horaria, area_conhecimento
export interface Disciplina {
  id: number;
  nome: string;
  cargaHoraria?: number | null;
  areaConhecimento?: string | null;
}

export interface DisciplinaInput {
  nome: string;
  cargaHoraria?: number | null;
  areaConhecimento?: string | null;
}

// ===== Período Letivo =====
// Campos: id_periodo_letivo, ano, etapa, data_inicio, data_fim
export interface PeriodoLetivo {
  id: number;
  ano: number;
  etapa: string;
  dataInicio?: string | null;
  dataFim?: string | null;
}

export interface PeriodoLetivoInput {
  ano: number;
  etapa: string;
  dataInicio?: string | null;
  dataFim?: string | null;
}

// ===== Vínculo (Turma-Professor-Disciplina) =====
// Campos: id_turma_professor, id_turma, id_professor, id_disciplina
export interface TurmaProfessor {
  id: number;
  idTurma: number;
  idProfessor: number;
  idDisciplina: number;
  turma?: Turma;
  professor?: Professor;
  disciplina?: Disciplina;
  _count?: {
    avaliacoes?: number;
  };
}

export interface TurmaProfessorInput {
  idTurma: number;
  idProfessor: number;
  idDisciplina: number;
}

// ===== Avaliação =====
// Campos: id_avaliacao, id_turma_professor, id_periodo_letivo, titulo, tipo, data_aplicacao, peso
export interface Avaliacao {
  id: number;
  idTurmaProfessor: number;
  idPeriodoLetivo: number;
  titulo: string;
  tipo?: string | null;
  dataAplicacao: string;
  peso: number;
  nomeArquivo?: string | null;
  tipoArquivo?: string | null;
  temArquivo?: boolean; // Indica se tem PDF anexado
  turmaProfessor?: TurmaProfessor;
  periodoLetivo?: PeriodoLetivo;
  _count?: {
    notas?: number;
  };
}

export interface AvaliacaoInput {
  idTurmaProfessor: number;
  idPeriodoLetivo: number;
  titulo: string;
  tipo?: string | null;
  dataAplicacao: string;
  peso?: number;
}

// ===== Nota =====
// Campos: id_nota, id_avaliacao, id_aluno, nota_obtida, data_lancamento
export interface Nota {
  id: number;
  idAvaliacao: number;
  idAluno: number;
  notaObtida: number;
  dataLancamento?: string;
  avaliacao?: Avaliacao;
  aluno?: Aluno;
}

export interface NotaInput {
  idAvaliacao: number;
  idAluno: number;
  notaObtida: number;
}

export interface NotasBatchInput {
  idAvaliacao: number;
  notas: Array<{
    idAluno: number;
    notaObtida: number;
  }>;
}

// ===== Regra de Aprovação =====
// Campos: id_regra, id_escola, id_coordenador, ano_letivo, media_minima
export interface RegraAprovacao {
  id: number;
  idEscola: number;
  idCoordenador: number;
  anoLetivo: number;
  mediaMinima: number;
  escola?: Escola;
  coordenador?: Coordenador;
}

export interface RegraAprovacaoInput {
  idEscola: number;
  idCoordenador: number;
  anoLetivo: number;
  mediaMinima: number;
}

// ===== Relatórios =====
export interface BoletimAluno {
  aluno: {
    id: number;
    nome: string;
    matricula: string;
    dataNascimento: string | null;
  };
  turma: {
    id: number;
    nome: string;
    serie: string | null;
    anoLetivo: number;
    turno: string | null;
  };
  escola: {
    id: number;
    nome: string;
  };
  notas: {
    disciplina: string;
    professor: string;
    periodo: string;
    avaliacao: string;
    nota: number;
    peso: number;
    dataAplicacao: string;
  }[];
  mediaGeral: number;
  totalAvaliacoes: number;
}

export interface RelatorioTurma {
  turma: {
    id: number;
    nome: string;
    serie: string | null;
    anoLetivo: number;
    turno: string | null;
  };
  escola: {
    id: number;
    nome: string;
  };
  totalAlunos: number;
  totalAvaliacoes: number;
  mediaGeralTurma: number;
  disciplinas: {
    nome: string;
    professor: string;
    mediaDisciplina: number;
    totalAvaliacoes: number;
  }[];
  alunos: {
    aluno: {
      id: number;
      nome: string;
      matricula: string;
    };
    mediaGeral: number;
    totalNotas: number;
    situacao: 'Aprovado' | 'Reprovado' | 'Em andamento';
  }[];
}

export interface EstatisticasEscola {
  escola: {
    id: number;
    nome: string;
  };
  totalTurmas: number;
  totalAlunos: number;
  totalProfessores: number;
  totalCoordenadores: number;
  totalDisciplinas: number;
  totalAvaliacoes: number;
  mediaGeralEscola: number;
  turmasPorSerie: {
    serie: string;
    quantidade: number;
  }[];
  desempenhoPorTurma: {
    turma: string;
    serie: string | null;
    mediaGeral: number;
    totalAlunos: number;
  }[];
}
