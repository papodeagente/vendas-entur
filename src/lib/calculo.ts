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

export interface ResultadoDinheiro {
  // Valores mensais por alavanca
  recuperacao: number;
  recorrencia: number;
  indicacao: number;
  totalMes: number;
  totalAno: number;

  // Cenário "hoje"
  recuperacaoHoje: number;
  recorrenciaHoje: number;
  indicacaoHoje: number;

  // Granularidade extra (Antigravity)
  desperdicioLeadsMes: number; // CPL × atendimentos perdidos
  custoRepoClienteInativo: number; // CAC para repor 1 inativo perdido
  payback: { meses: number; vendasNecessarias: number }; // R$ X/mês de CRM, paga em N meses
  roiMensal: number; // total mes / preço CRM (default 397)
  perDay: number; // total mes / 30
}

// Princípios Antigravity:
// - Ser CONSERVADOR (10% recuperação quando real é 18%)
// - Mostrar o cenário SEM CRM como o que ele já vive (não zero absoluto)
// - Taxa atual de indicação = 5% (acidental); com programa = 22%
// - Recompra atual = 1%/mês; com automação = 8%/mês

const TAXAS_COM_CRM = {
  taxaRecuperacao: 0.10, // 10% conservador (real 18%)
  taxaRecompra: 0.08, // 8% mensal sobre base ativa
  taxaReativacaoInativos: 0.15, // 15% dos inativos reativados
  taxaIndicacaoCompPrograma: 0.22, // 22% das vendas viram indicações
  conversaoIndicacao: 0.45, // indicação converte 45%
};

const TAXAS_SEM_CRM = {
  taxaRecuperacao: 0, // sem CRM, 0 recuperação
  taxaRecompra: 0.01, // 1% mensal — apenas o cliente que volta sozinho
  taxaReativacaoInativos: 0, // 0 reativação ativa
  taxaIndicacaoNatural: 0.05, // 5% indicação acidental
  conversaoIndicacao: 0.25, // pior conversão sem rastreio
};

const PRECO_CRM_DEFAULT = 397; // R$/mês — usado pra ROI quando não passado

export interface OpcoesCalculo {
  precoCrmMes?: number;
}

/**
 * Calcula o "Dinheiro na Mesa" usando taxas CONSERVADORAS.
 * O número é o GANHO ADICIONAL ao instalar o Entur OS, não o faturamento total.
 */
export function dinheiroNaMesa(
  respostas: Record<number, boolean>,
  d: DadosAgenciaInput,
  opcoes: OpcoesCalculo = {}
): ResultadoDinheiro {
  const comissao = d.comissaoPct / 100;
  const ticket2a = d.ticket2aCompra || d.ticketMedio;
  const precoCrm = opcoes.precoCrmMes ?? PRECO_CRM_DEFAULT;

  // ─── RECUPERAÇÃO ───
  // Cada mês, X atendimentos perdidos × 10% recuperação × ticket × comissão
  const recuperacao =
    d.atendPerdidos * TAXAS_COM_CRM.taxaRecuperacao * d.ticketMedio * comissao;
  const recuperacaoHoje =
    d.atendPerdidos *
    TAXAS_SEM_CRM.taxaRecuperacao *
    d.ticketMedio *
    comissao;

  // Custo por mês de leads desperdiçados (anti-objeção: "tá pagando pra perder")
  const desperdicioLeadsMes = d.atendPerdidos * d.cpl;

  // ─── RECORRÊNCIA ───
  // Recompra mensal sobre base ativa + reativação anual de inativos diluída em 12 meses
  const recompraComCrm =
    d.clientesAtivos * TAXAS_COM_CRM.taxaRecompra * ticket2a * comissao;
  const reativacaoComCrm =
    (d.clientesInativos *
      TAXAS_COM_CRM.taxaReativacaoInativos *
      d.ticketMedio *
      comissao) /
    12;
  const recorrencia = recompraComCrm + reativacaoComCrm;

  const recompraSemCrm =
    d.clientesAtivos * TAXAS_SEM_CRM.taxaRecompra * ticket2a * comissao;
  const recorrenciaHoje = recompraSemCrm; // sem CRM não há reativação ativa

  // CAC pra repor inativo perdido (quanto custa adquirir um cliente novo)
  const cacPorCliente = d.taxaConversao > 0 ? d.cpl / (d.taxaConversao / 100) : 0;
  const custoRepoClienteInativo =
    d.clientesInativos *
    TAXAS_COM_CRM.taxaReativacaoInativos *
    cacPorCliente;

  // ─── INDICAÇÃO ───
  // Atual: 5% das vendas viram indicações; Com programa: 22% das vendas
  const indicacoesNaturais = d.vendasMes * TAXAS_SEM_CRM.taxaIndicacaoNatural;
  const indicacoesComPrograma =
    d.vendasMes * TAXAS_COM_CRM.taxaIndicacaoCompPrograma;

  const vendasIndicacaoHoje =
    indicacoesNaturais * TAXAS_SEM_CRM.conversaoIndicacao;
  const vendasIndicacaoComCrm =
    indicacoesComPrograma * TAXAS_COM_CRM.conversaoIndicacao;

  const indicacaoHoje = vendasIndicacaoHoje * d.ticketMedio * comissao;
  const indicacaoBruta = vendasIndicacaoComCrm * d.ticketMedio * comissao;
  const indicacao = Math.max(0, indicacaoBruta - indicacaoHoje);

  // ─── CONSOLIDADO ───
  const totalMes = recuperacao + recorrencia + indicacao;
  const totalAno = totalMes * 12;

  // Payback: quantas vendas recuperadas pagam o CRM em quantos meses
  const ganhoMedioPorVenda = d.ticketMedio * comissao;
  const vendasNecessariasPayback =
    ganhoMedioPorVenda > 0 ? Math.ceil(precoCrm / ganhoMedioPorVenda) : 0;
  const mesesPayback =
    totalMes > 0 ? Math.max(1, Math.ceil(precoCrm / totalMes)) : 0;

  return {
    recuperacao,
    recorrencia,
    indicacao,
    totalMes,
    totalAno,
    recuperacaoHoje,
    recorrenciaHoje,
    indicacaoHoje,
    desperdicioLeadsMes,
    custoRepoClienteInativo,
    payback: {
      meses: mesesPayback,
      vendasNecessarias: vendasNecessariasPayback,
    },
    roiMensal: precoCrm > 0 ? totalMes / precoCrm : 0,
    perDay: totalMes / 30,
  };
}

// Exposta pra UI poder mostrar as taxas em tooltips
export const TAXAS_REFERENCIA = {
  comCrm: TAXAS_COM_CRM,
  semCrm: TAXAS_SEM_CRM,
  precoCrmDefault: PRECO_CRM_DEFAULT,
};

// Mantida pra retrocompat (não usada na nova narrativa, mas referenciada em código antigo)
export interface BenchmarksAjustados {
  taxaRecuperacao: number;
  taxaRecompra: number;
  taxaReativacao: number;
  indicacoesPorAtivoAno: number;
  conversaoIndicacao: number;
}

export function ajustarBenchmarks(
  respostas: Record<number, boolean>
): BenchmarksAjustados {
  function fator(perguntaIds: number[]): number {
    if (perguntaIds.length === 0) return 0;
    const sim = perguntaIds.filter((id) => respostas[id] === true).length;
    return sim / perguntaIds.length;
  }
  const fRecup = fator(PERGUNTAS_POR_ALAVANCA.recuperacao);
  const fRecor = fator(PERGUNTAS_POR_ALAVANCA.recorrencia);
  const fIndic = fator(PERGUNTAS_POR_ALAVANCA.indicacao);
  const lerp = (sem: number, com: number, f: number) => sem + (com - sem) * f;

  return {
    taxaRecuperacao: lerp(0, TAXAS_COM_CRM.taxaRecuperacao, fRecup),
    taxaRecompra: lerp(
      TAXAS_SEM_CRM.taxaRecompra,
      TAXAS_COM_CRM.taxaRecompra,
      fRecor
    ),
    taxaReativacao: lerp(0, TAXAS_COM_CRM.taxaReativacaoInativos, fRecor),
    indicacoesPorAtivoAno: lerp(
      TAXAS_SEM_CRM.taxaIndicacaoNatural,
      TAXAS_COM_CRM.taxaIndicacaoCompPrograma,
      fIndic
    ),
    conversaoIndicacao: lerp(
      TAXAS_SEM_CRM.conversaoIndicacao,
      TAXAS_COM_CRM.conversaoIndicacao,
      fIndic
    ),
  };
}
