export type Alavanca = "recuperacao" | "recorrencia" | "indicacao";

export interface Pergunta {
  id: number;
  texto: string;
  porqueImporta: string;
  alavancas: Alavanca[];
  moduloEnturOS: string;
  fatorPerda: string; // descrição do impacto quando responde "Não"
}

export const PERGUNTAS: Pergunta[] = [
  {
    id: 1,
    texto: "Você investe em anúncios pagos (Google, Meta, etc.)?",
    porqueImporta:
      "Sem anúncios, o volume de leads depende exclusivamente de orgânico — o fluxo é imprevisível e impossível de escalar.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Gestão de Tráfego Pago",
    fatorPerda: "Sem tráfego pago, 100% dos leads potenciais de mídia são perdidos.",
  },
  {
    id: 2,
    texto: "Você faz prospecção orgânica ativa (redes sociais, parcerias, eventos)?",
    porqueImporta:
      "Prospecção orgânica complementa o pago e cria autoridade. Sem ela, o custo por lead fica mais alto.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Módulo de Prospecção Orgânica",
    fatorPerda: "Sem prospecção orgânica, perde-se o canal de menor custo por lead.",
  },
  {
    id: 3,
    texto: "Você tem landing pages com UTM para rastrear origem dos leads?",
    porqueImporta:
      "Sem UTM, é impossível saber qual canal gera resultado. Você investe sem saber onde está o retorno.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Landing Pages com Rastreamento UTM",
    fatorPerda: "Sem rastreamento, impossível otimizar investimento em marketing.",
  },
  {
    id: 4,
    texto: "Você já usa algum CRM para gerenciar seus leads e clientes?",
    porqueImporta:
      "O CRM é o coração da operação comercial. Sem ele, leads se perdem, follow-up não acontece e o dinheiro escoa.",
    alavancas: ["recuperacao", "recorrencia", "indicacao"],
    moduloEnturOS: "CRM Kanban + Carteira de Clientes",
    fatorPerda:
      "Sem CRM, 100% dos atendimentos perdidos viram perda permanente. Com CRM, recupera-se até 40%.",
  },
  {
    id: 5,
    texto: "Você tem processo definido para atender leads desconhecidos (novos)?",
    porqueImporta:
      "Lead novo sem processo = lead perdido. O tempo de resposta e a cadência de follow-up definem a conversão.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Automação de Follow-up + Cadência",
    fatorPerda: "Sem processo para desconhecidos, a maioria dos leads novos não é trabalhada.",
  },
  {
    id: 6,
    texto: "Seus vendedores usam scripts ou roteiros de venda padronizados?",
    porqueImporta:
      "Script padroniza a qualidade do atendimento. Sem ele, cada vendedor atende de um jeito e a conversão varia muito.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Scripts de Venda + Playbook Comercial",
    fatorPerda: "Sem scripts, a taxa de conversão fica abaixo do benchmark do mercado.",
  },
  {
    id: 7,
    texto: "Você tem um processo de pré-venda estruturado (qualificação antes da proposta)?",
    porqueImporta:
      "Pré-venda filtra os leads quentes. Sem ela, o vendedor gasta tempo com quem não vai comprar.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Etapa de Pré-Vendas no CRM",
    fatorPerda: "Sem pré-venda, vendedores perdem tempo com leads não qualificados.",
  },
  {
    id: 8,
    texto: "Você acompanha indicadores comerciais (taxa de conversão, ciclo de venda, ticket médio)?",
    porqueImporta:
      "Sem indicadores, não há como saber se a operação está melhorando ou piorando. Decisões viram achismo.",
    alavancas: ["recorrencia"],
    moduloEnturOS: "Dashboard de Indicadores Comerciais",
    fatorPerda: "Sem indicadores, impossível identificar gargalos e oportunidades.",
  },
  {
    id: 9,
    texto: "Você tem processos ativos para clientes da base (recompra, pós-venda)?",
    porqueImporta:
      "Cliente ativo é 5x mais barato que cliente novo. Sem processo de recompra, ele compra do concorrente.",
    alavancas: ["recorrencia"],
    moduloEnturOS: "Automação de Pós-Venda + Recompra",
    fatorPerda: "Sem processo ativo, a taxa de recompra cai de 8% para 1% ao mês.",
  },
  {
    id: 10,
    texto: "Você tem programa de indicação ativa (pede indicação de forma estruturada)?",
    porqueImporta:
      "Indicação é o canal com maior taxa de conversão (45%). Sem processo, acontece por acaso.",
    alavancas: ["indicacao"],
    moduloEnturOS: "Programa de Indicação no CRM",
    fatorPerda: "Sem programa de indicação, apenas 20% do potencial de indicações é capturado.",
  },
];

// Mapeamento: quais perguntas afetam cada alavanca
export const PERGUNTAS_POR_ALAVANCA: Record<Alavanca, number[]> = {
  recuperacao: [1, 2, 3, 4, 5, 6, 7],
  recorrencia: [4, 8, 9],
  indicacao: [4, 10],
};
