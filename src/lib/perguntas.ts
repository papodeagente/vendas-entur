export type Alavanca = "recuperacao" | "recorrencia" | "indicacao";

export interface Pergunta {
  id: number;
  texto: string;
  porqueImporta: string;
  alavancas: Alavanca[];
  moduloEnturOS: string;
  fatorPerda: string;
  // SPIN Selling (modo ao vivo)
  perguntaSpin: string; // pergunta aberta para ler em voz alta
  aprofundamento: string; // follow-up quando o cliente confirma o problema
  implicacao: string; // pergunta para amplificar a consequência (com {valor})
  needPayoff: string; // pergunta para fazer o cliente articular a solução
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
    perguntaSpin:
      "Como vocês trazem leads novos hoje? Investem em Google, Meta ou é tudo indicação e orgânico?",
    aprofundamento:
      "E você consegue prever quantos leads vão chegar mês que vem? O que acontece quando o mês está fraco?",
    implicacao:
      "Se hoje o fluxo de leads é imprevisível, quanto isso custa em meses fracos? Quanto vocês deixam de vender quando o orgânico cai?",
    needPayoff:
      "Se vocês tivessem uma máquina de leads previsível, rodando Google + Meta com CPL controlado, o que isso mudaria no seu planejamento?",
  },
  {
    id: 2,
    texto: "Você faz prospecção orgânica ativa (redes sociais, parcerias, eventos)?",
    porqueImporta:
      "Prospecção orgânica complementa o pago e cria autoridade. Sem ela, o custo por lead fica mais alto.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Módulo de Prospecção Orgânica",
    fatorPerda: "Sem prospecção orgânica, perde-se o canal de menor custo por lead.",
    perguntaSpin:
      "Além de anúncios, vocês têm uma rotina de prospecção ativa — rede social, parceria, evento?",
    aprofundamento:
      "Quem na equipe é responsável por isso hoje? Quanto tempo por semana eles dedicam?",
    implicacao:
      "Sem prospecção orgânica ativa, seu CPL fica refém do leilão do Meta. Se o CPL dobrar, qual o impacto no fechamento?",
    needPayoff:
      "Se a equipe tivesse um playbook de prospecção orgânica (parcerias, indicação, conteúdo), quanto isso reduziria sua dependência de tráfego pago?",
  },
  {
    id: 3,
    texto: "Você tem landing pages com UTM para rastrear origem dos leads?",
    porqueImporta:
      "Sem UTM, é impossível saber qual canal gera resultado. Você investe sem saber onde está o retorno.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Landing Pages com Rastreamento UTM",
    fatorPerda: "Sem rastreamento, impossível otimizar investimento em marketing.",
    perguntaSpin:
      "Quando um lead chega, você sabe exatamente por qual canal ele veio — campanha, criativo, palavra-chave?",
    aprofundamento:
      "E como você decide hoje em qual canal investir mais? Com base em quê?",
    implicacao:
      "Se você não sabe qual canal está vendendo, está investindo no escuro. Quanto você acha que está queimando em mídia que não converte?",
    needPayoff:
      "Se cada venda fechada mostrasse a origem (campanha, criativo, vendedor), como isso mudaria sua decisão de investimento em marketing?",
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
    perguntaSpin:
      "Quando um lead chega e não compra no primeiro atendimento, o que acontece com ele nos próximos 7 dias?",
    aprofundamento:
      "E quando o vendedor sai de férias ou desliga — os leads dele ficam com quem? Como vocês garantem que ninguém cai?",
    implicacao:
      "Se hoje você perde ~R$ {valorRecuperacaoMes} por mês em atendimentos sem follow-up, em 12 meses isso vira mais de R$ {valorRecuperacaoAno}. Como isso afeta seu plano de crescimento?",
    needPayoff:
      "Se você tivesse um processo que recuperasse 30% desses atendimentos perdidos automaticamente, como isso mudaria o seu mês?",
  },
  {
    id: 5,
    texto: "Você tem processo definido para atender leads desconhecidos (novos)?",
    porqueImporta:
      "Lead novo sem processo = lead perdido. O tempo de resposta e a cadência de follow-up definem a conversão.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Automação de Follow-up + Cadência",
    fatorPerda: "Sem processo para desconhecidos, a maioria dos leads novos não é trabalhada.",
    perguntaSpin:
      "Quando um lead novo cai (alguém que vocês nunca conversaram), qual é exatamente o passo-a-passo do atendimento?",
    aprofundamento:
      "E em quanto tempo o primeiro contato acontece? Quantos toques até desistir do lead?",
    implicacao:
      "Se o primeiro contato demora mais de 1h, a conversão despenca. Quantos leads vocês recebem por mês que acabam sem segunda tentativa?",
    needPayoff:
      "Se toda vez que um lead entrasse, uma cadência automática de 3-5 toques disparasse — WhatsApp, e-mail, ligação — quanto isso aumentaria sua conversão?",
  },
  {
    id: 6,
    texto: "Seus vendedores usam scripts ou roteiros de venda padronizados?",
    porqueImporta:
      "Script padroniza a qualidade do atendimento. Sem ele, cada vendedor atende de um jeito e a conversão varia muito.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Scripts de Venda + Playbook Comercial",
    fatorPerda: "Sem scripts, a taxa de conversão fica abaixo do benchmark do mercado.",
    perguntaSpin:
      "Se eu pegar seus 3 melhores e seus 3 piores vendedores, a diferença de conversão entre eles é grande?",
    aprofundamento:
      "E o que o melhor faz de diferente? Esse conhecimento está documentado ou só na cabeça dele?",
    implicacao:
      "Se o vendedor mediano converte metade do melhor, você está deixando 50% de venda na mesa por falta de padronização. Quanto é isso por mês?",
    needPayoff:
      "Se todo vendedor tivesse o mesmo playbook do seu melhor — script por etapa, objeções mapeadas — quanto a conversão da equipe toda subiria?",
  },
  {
    id: 7,
    texto: "Você tem um processo de pré-venda estruturado (qualificação antes da proposta)?",
    porqueImporta:
      "Pré-venda filtra os leads quentes. Sem ela, o vendedor gasta tempo com quem não vai comprar.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Etapa de Pré-Vendas no CRM",
    fatorPerda: "Sem pré-venda, vendedores perdem tempo com leads não qualificados.",
    perguntaSpin:
      "Antes do vendedor chegar no cliente, existe alguém que qualifica o lead — vê se tem fit, orçamento, urgência?",
    aprofundamento:
      "E do total de leads, quantos % realmente têm perfil pra comprar? O vendedor gasta energia em quantos que nunca iam fechar?",
    implicacao:
      "Se 40% do tempo do vendedor é com lead que não compra, você está pagando salário pra desperdiçar hora. Qual o custo disso por mês?",
    needPayoff:
      "Se o vendedor só recebesse leads já qualificados — com orçamento, urgência e fit confirmados — quanto a produtividade da equipe subiria?",
  },
  {
    id: 8,
    texto: "Você acompanha indicadores comerciais (taxa de conversão, ciclo de venda, ticket médio)?",
    porqueImporta:
      "Sem indicadores, não há como saber se a operação está melhorando ou piorando. Decisões viram achismo.",
    alavancas: ["recorrencia"],
    moduloEnturOS: "Dashboard de Indicadores Comerciais",
    fatorPerda: "Sem indicadores, impossível identificar gargalos e oportunidades.",
    perguntaSpin:
      "Se eu te perguntar agora qual a taxa de conversão da sua equipe nos últimos 30 dias, você consegue me responder?",
    aprofundamento:
      "E como vocês decidem onde investir tempo e dinheiro — por indicador ou por sensação?",
    implicacao:
      "Sem indicador, você não sabe onde está o gargalo. Pode estar gastando com tráfego quando o problema é conversão. Isso já aconteceu?",
    needPayoff:
      "Se você tivesse um dashboard com conversão, ciclo de venda e ticket médio em tempo real — por vendedor, por canal — quanto mais rápido vocês corrigiriam rota?",
  },
  {
    id: 9,
    texto: "Você tem processos ativos para clientes da base (recompra, pós-venda)?",
    porqueImporta:
      "Cliente ativo é 5x mais barato que cliente novo. Sem processo de recompra, ele compra do concorrente.",
    alavancas: ["recorrencia"],
    moduloEnturOS: "Automação de Pós-Venda + Recompra",
    fatorPerda: "Sem processo ativo, a taxa de recompra cai de 8% para 1% ao mês.",
    perguntaSpin:
      "Um cliente que comprou há 6 meses e sumiu — vocês têm alguma forma estruturada de trazer ele de volta?",
    aprofundamento:
      "E hoje, quanto % da sua base compra de novo em 12 meses? Vocês medem isso?",
    implicacao:
      "Vender pra cliente da base é 5x mais barato que captar novo. Se a recompra está em 1% ao mês quando poderia estar em 8%, a perda é de R$ {valorRecorrenciaAno} por ano. Como isso afeta seu crescimento?",
    needPayoff:
      "Se automaticamente todo cliente recebesse uma mensagem no tempo certo de recompra — e inativos entrassem em campanha de reativação — quanto isso multiplicaria sua receita sem aumentar CAC?",
  },
  {
    id: 10,
    texto: "Você tem programa de indicação ativa (pede indicação de forma estruturada)?",
    porqueImporta:
      "Indicação é o canal com maior taxa de conversão (45%). Sem processo, acontece por acaso.",
    alavancas: ["indicacao"],
    moduloEnturOS: "Programa de Indicação no CRM",
    fatorPerda: "Sem programa de indicação, apenas 20% do potencial de indicações é capturado.",
    perguntaSpin:
      "Quando um cliente compra e fica satisfeito, vocês pedem indicação de forma sistemática? Ou acontece só quando o vendedor lembra?",
    aprofundamento:
      "E quantas indicações por mês vocês recebem hoje? Quanto disso você acha que poderia ser 5x maior?",
    implicacao:
      "Indicação converte 45% vs. 15% de lead frio. Se hoje vocês têm só X por mês e poderiam ter 5X, isso representa R$ {valorIndicacaoAno} por ano deixado na mesa.",
    needPayoff:
      "Se toda venda fechada disparasse automaticamente um pedido de indicação — com incentivo, timing e mensagem certa — em 6 meses, quanto da sua base viria de indicação?",
  },
];

export const PERGUNTAS_POR_ALAVANCA: Record<Alavanca, number[]> = {
  recuperacao: [1, 2, 3, 4, 5, 6, 7],
  recorrencia: [4, 8, 9],
  indicacao: [4, 10],
};

// Ordem sugerida na Fase 2 (Problema): Recuperação primeiro, depois Recorrência, depois Indicação
export const ORDEM_FASE_PROBLEMA: number[] = [4, 5, 6, 7, 1, 2, 3, 8, 9, 10];
