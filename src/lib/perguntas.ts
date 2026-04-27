export type Alavanca = "recuperacao" | "recorrencia" | "indicacao";

export interface Pergunta {
  id: number;
  bloco: Alavanca;
  texto: string;
  porqueImporta: string;
  alavancas: Alavanca[];
  moduloEnturOS: string;
  fatorPerda: string;
  // SPIN Selling (modo ao vivo)
  perguntaSpin: string;
  aprofundamento: string;
  implicacao: string;
  needPayoff: string;
}

// 10 perguntas reorganizadas em 3 BLOCOS focados nas alavancas que o CRM resolve.
// Princípio: cada pergunta deve mapear DIRETAMENTE uma dor que o Entur OS automatiza.
export const PERGUNTAS: Pergunta[] = [
  // ─────────────────────────────────────────────
  // BLOCO RECUPERAÇÃO (4 perguntas) — leads que pediram orçamento e sumiram
  // ─────────────────────────────────────────────
  {
    id: 1,
    bloco: "recuperacao",
    texto: "Você já usa algum CRM para gerenciar leads e clientes?",
    porqueImporta:
      "Sem CRM, leads se perdem na caixa de entrada do vendedor. Não há histórico, não há automação, não há rastreio.",
    alavancas: ["recuperacao", "recorrencia", "indicacao"],
    moduloEnturOS: "CRM Kanban + Carteira de Clientes",
    fatorPerda:
      "Sem CRM, 100% dos atendimentos perdidos viram perda permanente. Com CRM + automação, recupera-se ~10-18%.",
    perguntaSpin:
      "Você já usa algum CRM hoje para gerenciar seus leads e clientes? Como é o sistema?",
    aprofundamento:
      "E quando o vendedor sai de férias ou desliga, o que acontece com os leads dele? Como vocês garantem que ninguém cai?",
    implicacao:
      "Se hoje você perde ~R$ {valorRecuperacaoMes} por mês em atendimentos sem follow-up, em 12 meses isso vira mais de R$ {valorRecuperacaoAno}. Como isso afeta seu plano de crescimento?",
    needPayoff:
      "Se existisse um sistema que, no momento que o lead não respondeu em 48h, disparasse uma sequência de mensagens personalizadas pra recuperar ele — sem o vendedor precisar lembrar — o que isso mudaria no seu mês?",
  },
  {
    id: 2,
    bloco: "recuperacao",
    texto:
      "Quando um lead pede orçamento e não responde, alguém faz follow-up?",
    porqueImporta:
      "Lead frio sem follow-up estruturado é venda perdida. A maioria das compras acontece entre o 5º e 12º contato.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Automação de Follow-up + Cadência",
    fatorPerda:
      "Sem cadência automatizada, 80% dos leads não recebem 2º contato e somem.",
    perguntaSpin:
      "Quando um lead pede orçamento e não responde, o que acontece? Alguém faz follow-up? Em quanto tempo?",
    aprofundamento:
      "Quantos toques o vendedor faz antes de desistir? E quando ele desiste, o lead fica salvo em algum lugar ou some de vez?",
    implicacao:
      "Se 80% dos seus leads silenciosos não recebem 2º contato e cada um custou R$ {custoLeadDesperdicado} pra chegar, isso é dinheiro queimado. Como você lida com essa conta?",
    needPayoff:
      "Imagina que toda vez que um lead caísse em silêncio, uma cadência de 3-5 toques disparasse automaticamente — WhatsApp, e-mail, lembrete pro vendedor. Quanto isso aumentaria sua conversão?",
  },
  {
    id: 3,
    bloco: "recuperacao",
    texto:
      "Vocês sabem quantos orçamentos foram enviados/mês e quantos viraram venda?",
    porqueImporta:
      "Sem rastreio, é impossível saber onde está o gargalo. Decisões viram achismo.",
    alavancas: ["recuperacao"],
    moduloEnturOS: "Dashboard de Funil + Conversão",
    fatorPerda:
      "Sem dashboard, gargalos passam despercebidos por meses — e cada mês cego custa caro.",
    perguntaSpin:
      "Vocês sabem quantos orçamentos são enviados por mês e quantos viram venda? E os que não viraram — ficam em alguma lista ou somem?",
    aprofundamento:
      "E como vocês decidem onde investir energia — por dado ou por sensação? Já aconteceu de gastar com tráfego quando o problema era outro?",
    implicacao:
      "Sem indicador, o gargalo passa despercebido. Você pode estar gastando com tráfego quando o problema é conversão. Quanto tempo já passou sem essa visibilidade?",
    needPayoff:
      "Se você tivesse um painel mostrando, em tempo real, quantos orçamentos saíram, quantos foram respondidos, quantos viraram venda — por vendedor, por canal — quanto mais rápido vocês corrigiriam rota?",
  },
  {
    id: 4,
    bloco: "recuperacao",
    texto:
      "Se um lead reaparece 3 meses depois, vocês têm o histórico do que pediu?",
    porqueImporta:
      "Lead que volta encontrando 'começo do zero' sente desinteresse. Lead que volta e vê seu histórico se sente cuidado — e fecha mais.",
    alavancas: ["recuperacao", "recorrencia"],
    moduloEnturOS: "Carteira de Clientes + Histórico Completo",
    fatorPerda:
      "Sem histórico, conversão de lead que retorna cai pela metade.",
    perguntaSpin:
      "Se um lead reaparece 3 meses depois pedindo informação, vocês têm o histórico do que ele pediu antes ou começam do zero?",
    aprofundamento:
      "E quando troca o vendedor — outro atendente assume — ele tem acesso a essa história ou também recomeça?",
    implicacao:
      "Cada vez que um lead que já demonstrou interesse é tratado como novo, a chance de conversão cai. Quantas vezes por mês isso acontece sem ninguém perceber?",
    needPayoff:
      "Imagina abrir o nome do lead e ver na hora: tudo que ele pediu, todas as conversas, todos os toques anteriores. Quanto isso aceleraria o atendimento?",
  },

  // ─────────────────────────────────────────────
  // BLOCO RECORRÊNCIA (3 perguntas) — clientes da base que somem
  // ─────────────────────────────────────────────
  {
    id: 5,
    bloco: "recorrencia",
    texto:
      "Vocês sabem datas-chave dos clientes (aniversário, última compra) e usam pra agir?",
    porqueImporta:
      "Cliente da base é 5x mais barato que cliente novo — mas só converte se for abordado no momento certo.",
    alavancas: ["recorrencia"],
    moduloEnturOS: "Gatilhos Automáticos por Data",
    fatorPerda:
      "Sem gatilhos por data, clientes da base compram em outra agência sem nem ser abordados.",
    perguntaSpin:
      "Vocês sabem quando é o aniversário dos clientes? Ou a data da última compra? Usam isso pra alguma ação automática?",
    aprofundamento:
      "E quem na equipe é responsável por lembrar? Ou depende de o vendedor olhar a planilha por conta própria?",
    implicacao:
      "Cliente que viajou ano passado e a gente não aborda 3 meses antes do próximo ciclo, compra de outro. Quantos desses já foram pra concorrente sem você notar?",
    needPayoff:
      "Se uma ferramenta identificasse sozinha quais clientes estão no momento ideal de recompra — aniversário próximo, tempo sem comprar — e avisasse o vendedor: 'liga pra esse aqui hoje'. Como seria isso pra equipe?",
  },
  {
    id: 6,
    bloco: "recorrencia",
    texto:
      "Tem cliente que comprou uma vez e nunca mais voltou? Vocês sabem quantos?",
    porqueImporta:
      "Cliente inativo é dinheiro guardado na geladeira. Você já gastou pra adquirir, ele já confiou em você. Reativar custa praticamente zero.",
    alavancas: ["recorrencia"],
    moduloEnturOS: "Segmentação Automática de Inativos",
    fatorPerda:
      "Sem visibilidade de inativos, taxa de reativação fica em 0%.",
    perguntaSpin:
      "Tem cliente que comprou uma vez e nunca mais voltou? Vocês sabem quantos estão nessa situação hoje?",
    aprofundamento:
      "E quantos % da sua base você acha que está inativa há mais de 90 dias? Vocês conseguem listar agora ou só por estimativa?",
    implicacao:
      "Você tem ~{clientesInativos} clientes inativos. Cada um já confiou em você e já pagou ticket cheio. Se 15% voltassem, são R$ {valorRecorrenciaAno}/ano que você não está pegando. Como isso te impacta?",
    needPayoff:
      "Se o sistema gerasse automaticamente uma lista mensal de inativos e disparasse campanha de reativação personalizada com 1 clique, quanto disso voltaria pra mesa?",
  },
  {
    id: 7,
    bloco: "recorrencia",
    texto:
      "Existe processo automático pra reativar cliente sem comprar há X meses?",
    porqueImporta:
      "Reativação manual depende de alguém lembrar. Reativação automática nunca falha, dispara no timing certo e não consome o tempo do vendedor.",
    alavancas: ["recorrencia"],
    moduloEnturOS: "Automação de Pós-Venda + Recompra",
    fatorPerda:
      "Sem automação, taxa de recompra cai de 8% para 1% ao mês — perda de 7x o potencial.",
    perguntaSpin:
      "Existe algum processo automático rodando hoje pra reativar cliente que está sem comprar há mais de X meses?",
    aprofundamento:
      "E o que acontece se ninguém manda nada por 6, 9, 12 meses? Esse cliente compra de outro ou não compra mais ninguém?",
    implicacao:
      "Vender pra base é 5x mais barato que captar novo. Se a recompra está em 1% ao mês quando poderia estar em 8%, são R$ {valorRecorrenciaAno}/ano deixados na mesa. Como isso afeta seu CAC médio?",
    needPayoff:
      "Imagina que toda data-gatilho dispare uma sequência automática de mensagens personalizadas — pós-viagem, aniversário, X meses sem comprar. Quanto isso multiplicaria a receita sem aumentar custo de aquisição?",
  },

  // ─────────────────────────────────────────────
  // BLOCO INDICAÇÃO (3 perguntas) — multiplicador grátis
  // ─────────────────────────────────────────────
  {
    id: 8,
    bloco: "indicacao",
    texto:
      "Depois que o cliente volta de viagem, vocês fazem contato e pedem avaliação?",
    porqueImporta:
      "Pós-viagem é o momento de pico emocional. Quem não pede indicação aí, perde a maior janela de oportunidade do ciclo.",
    alavancas: ["indicacao"],
    moduloEnturOS: "Automação de Pós-Viagem + NPS",
    fatorPerda:
      "Sem pós-viagem ativo, 95% das oportunidades de indicação se perdem.",
    perguntaSpin:
      "Depois que o cliente volta de viagem, vocês fazem algum contato pra saber como foi? Pedem avaliação?",
    aprofundamento:
      "E quanto tempo depois? Em 1 dia, 1 semana, 1 mês? Quem dispara isso — o vendedor lembra ou tem processo?",
    implicacao:
      "O cliente que acabou de voltar feliz é quem mais indica. Se vocês não abordam nas primeiras 72h, a euforia some. Quantas indicações por mês estão se perdendo nessa janela?",
    needPayoff:
      "Se 24h depois de o cliente voltar, o sistema disparasse automaticamente um pedido de avaliação + NPS + pedido de indicação no momento de pico de satisfação, quanto isso geraria de indicação por mês?",
  },
  {
    id: 9,
    bloco: "indicacao",
    texto:
      "Vocês pedem indicação de forma estruturada (com momento e mensagem definidos)?",
    porqueImporta:
      "Indicação acidental rende 5% das vendas. Programa estruturado rende 22%. Diferença vai direto pro caixa.",
    alavancas: ["indicacao"],
    moduloEnturOS: "Programa de Indicação no CRM",
    fatorPerda:
      "Sem programa estruturado, taxa de indicação fica em ~5% — versus 22% com sistema.",
    perguntaSpin:
      "Vocês pedem indicação de forma estruturada? Tem algum momento definido pra fazer isso, ou acontece quando o vendedor lembra?",
    aprofundamento:
      "E quando pede, é com qual incentivo? Como acompanha quem indicou e quem foi indicado?",
    implicacao:
      "Indicação converte 45% vs 15% de lead frio. Se vocês fazem ~{vendasMes} vendas/mês e o índice fica em 5%, são R$ {valorIndicacaoAno}/ano que vocês deixam de gerar — sem precisar gastar 1 centavo em mídia. Quanto disso é aceitável?",
    needPayoff:
      "Imagina que toda venda fechada disparasse automaticamente um pedido de indicação com mensagem certa, timing certo, incentivo certo. Em 6 meses, quanto da sua base viria de indicação?",
  },
  {
    id: 10,
    bloco: "indicacao",
    texto:
      "Se um cliente indica alguém, vocês rastreiam? Sabem quem mais indica?",
    porqueImporta:
      "Cliente indicador é a alavanca mais subestimada. Sem rastreio, você não recompensa nem multiplica seus melhores clientes.",
    alavancas: ["indicacao"],
    moduloEnturOS: "Rastreamento de Indicações + Programa de Recompensa",
    fatorPerda:
      "Sem rastreio, top indicadores não são identificados nem incentivados — e param de indicar.",
    perguntaSpin:
      "Se um cliente indica alguém, vocês rastreiam isso? Sabem quem são os clientes que mais indicam hoje?",
    aprofundamento:
      "E como vocês recompensam ou agradecem quem indica? Tem algum programa formal ou é caso a caso?",
    implicacao:
      "Você provavelmente tem 5-10 clientes que indicam muito e nunca foram identificados. Sem reconhecimento, eles param. Quantos R$/ano isso representa em vendas que dependiam dessa pessoa?",
    needPayoff:
      "Se você abrisse um painel e visse, em ranking, quem mais indicou nos últimos 12 meses — com nome, valor gerado e poder de continuar — o que faria com essa informação?",
  },
];

export const PERGUNTAS_POR_ALAVANCA: Record<Alavanca, number[]> = {
  recuperacao: [1, 2, 3, 4],
  recorrencia: [5, 6, 7],
  indicacao: [8, 9, 10],
};

// Ordem na Fase 2 (Problema): Recuperação → Recorrência → Indicação
export const ORDEM_FASE_PROBLEMA: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Labels e estilo por bloco (usado no UI)
export const BLOCOS: Record<
  Alavanca,
  { label: string; descricao: string; emoji: string }
> = {
  recuperacao: {
    label: "Recuperação",
    descricao: "Leads que pediram orçamento e sumiram",
    emoji: "🎯",
  },
  recorrencia: {
    label: "Recorrência",
    descricao: "Clientes da base que somem",
    emoji: "🔄",
  },
  indicacao: {
    label: "Indicação",
    descricao: "Multiplicador grátis pós-viagem",
    emoji: "🌱",
  },
};
