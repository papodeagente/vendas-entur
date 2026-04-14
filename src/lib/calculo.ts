import { PERGUNTAS_POR_ALAVANCA } from "./perguntas";

export interface DadosAgenciaInput {
  vendasMes: number;
  ticketMedio: number;
  comissaoPct: number;
  atendPerdidos: number;
  clientesAtivos: number;
  clientesInativos: number;
  indicacoesMes: number;
  taxaConversao: number;
  tempoRecompra: number;
  cpl: number;
  ticket2aCompra: number;
  historicoMeses: number;
}

export interface BenchmarksAjustados {
  taxaRecuperacao: number;
  taxaRecompra: number;
  taxaReativacao: number;
  indicacoesPorAtivoAno: number;
  conversaoIndicacao: number;
}

export interface ResultadoDinheiro {
  recuperacao: number;
  recorrencia: number;
  indicacao: number;
  totalMes: number;
  totalAno: number;
  recuperacaoHoje: number;
  recorrenciaHoje: number;
  indicacaoHoje: number;
}

// Benchmarks base (com Entur OS)
const BENCH_COM = {
  taxaRecuperacao: 0.30,
  taxaRecompra: 0.08,
  taxaReativacao: 0.05,
  indicacoesPorAtivoAno: 1.0,
  conversaoIndicacao: 0.45,
};

// Benchmarks sem Entur OS
const BENCH_SEM = {
  taxaRecuperacao: 0,
  taxaRecompra: 0.01,
  taxaReativacao: 0,
  indicacoesPorAtivoAno: 0.2,
  conversaoIndicacao: 0.25,
};

/**
 * Ajusta benchmarks com base nas respostas do diagnóstico.
 * Quanto mais "Não" nas perguntas de uma alavanca, mais perto do benchmark "sem Entur OS" fica.
 */
export function ajustarBenchmarks(
  respostas: Record<number, boolean>
): BenchmarksAjustados {
  function fatorAlavanca(perguntaIds: number[]): number {
    const total = perguntaIds.length;
    if (total === 0) return 0;
    const sim = perguntaIds.filter((id) => respostas[id] === true).length;
    return sim / total; // 0 = tudo Não, 1 = tudo Sim
  }

  const fRecup = fatorAlavanca(PERGUNTAS_POR_ALAVANCA.recuperacao);
  const fRecor = fatorAlavanca(PERGUNTAS_POR_ALAVANCA.recorrencia);
  const fIndic = fatorAlavanca(PERGUNTAS_POR_ALAVANCA.indicacao);

  // Interpola entre benchmark "com" e "sem" baseado no fator
  const lerp = (sem: number, com: number, f: number) => sem + (com - sem) * f;

  return {
    taxaRecuperacao: lerp(BENCH_SEM.taxaRecuperacao, BENCH_COM.taxaRecuperacao, fRecup),
    taxaRecompra: lerp(BENCH_SEM.taxaRecompra, BENCH_COM.taxaRecompra, fRecor),
    taxaReativacao: lerp(BENCH_SEM.taxaReativacao, BENCH_COM.taxaReativacao, fRecor),
    indicacoesPorAtivoAno: lerp(BENCH_SEM.indicacoesPorAtivoAno, BENCH_COM.indicacoesPorAtivoAno, fIndic),
    conversaoIndicacao: lerp(BENCH_SEM.conversaoIndicacao, BENCH_COM.conversaoIndicacao, fIndic),
  };
}

/**
 * Função pura: calcula o Dinheiro na Mesa.
 * Recebe respostas do diagnóstico + dados da agência, retorna breakdown por alavanca.
 */
export function dinheiroNaMesa(
  respostas: Record<number, boolean>,
  d: DadosAgenciaInput
): ResultadoDinheiro {
  const comissao = d.comissaoPct / 100;

  // === CENÁRIO "COM ENTUR OS" (benchmark máximo) ===
  const recuperacao =
    d.atendPerdidos * BENCH_COM.taxaRecuperacao * d.ticketMedio * comissao;

  const recorrenciaRecompra =
    d.clientesAtivos * BENCH_COM.taxaRecompra * (d.ticket2aCompra || d.ticketMedio) * comissao;

  const recorrenciaReativacao =
    (d.clientesInativos * BENCH_COM.taxaReativacao * d.ticketMedio * comissao) / 12;

  const recorrencia = recorrenciaRecompra + recorrenciaReativacao;

  const indicacaoBruta =
    ((d.clientesAtivos * BENCH_COM.indicacoesPorAtivoAno) / 12) *
    BENCH_COM.conversaoIndicacao *
    d.ticketMedio *
    comissao;

  const indicacaoAtual = d.indicacoesMes * d.ticketMedio * comissao;
  const indicacao = Math.max(0, indicacaoBruta - indicacaoAtual);

  // === CENÁRIO "HOJE" (o que o cliente já faz) ===
  const recuperacaoHoje = 0; // hoje não recupera nada
  const recorrenciaHoje =
    d.clientesAtivos * BENCH_SEM.taxaRecompra * (d.ticket2aCompra || d.ticketMedio) * comissao;
  const indicacaoHoje = indicacaoAtual;

  const totalMes = recuperacao + recorrencia + indicacao;

  return {
    recuperacao,
    recorrencia,
    indicacao,
    totalMes,
    totalAno: totalMes * 12,
    recuperacaoHoje,
    recorrenciaHoje,
    indicacaoHoje,
  };
}
