export type AgenciaFaseKey =
  | "whatsapp"
  | "abertura"
  | "situacao"
  | "problema"
  | "implicacao"
  | "needPayoff"
  | "proposta"
  | "fechamento";

export interface AgenciaFaseMeta {
  key: AgenciaFaseKey;
  num: number;
  label: string;
  subtitulo: string;
  duracaoMin: number;
  objetivo: string;
}

export interface PerguntaPlaybook {
  texto: string;
  foco: string;
  capturar?: string;
}

export const AGENCIA_FASES: AgenciaFaseMeta[] = [
  {
    key: "whatsapp",
    num: 0,
    label: "WhatsApp",
    subtitulo: "Levar para a chamada",
    duracaoMin: 20,
    objetivo: "Criar conexao, entender o momento e vender a conversa, sem mandar preco por mensagem.",
  },
  {
    key: "abertura",
    num: 1,
    label: "Abertura",
    subtitulo: "Contrato da chamada",
    duracaoMin: 3,
    objetivo: "Dar seguranca, pedir permissao para perguntar e posicionar a curadoria.",
  },
  {
    key: "situacao",
    num: 2,
    label: "Situacao",
    subtitulo: "Sonho, perfil e historico",
    duracaoMin: 8,
    objetivo: "Fazer o cliente contar como imagina a viagem e como decide o que vale a pena.",
  },
  {
    key: "problema",
    num: 3,
    label: "Problema",
    subtitulo: "Montar sozinho",
    duracaoMin: 7,
    objetivo: "Evidenciar a confusao, o excesso de pesquisa e o risco de escolhas ruins.",
  },
  {
    key: "implicacao",
    num: 4,
    label: "Implicacao",
    subtitulo: "As 5 perdas",
    duracaoMin: 8,
    objetivo: "Fazer o cliente sentir o custo de desperdiçar horas, dias e escolhas da viagem.",
  },
  {
    key: "needPayoff",
    num: 5,
    label: "Need-Payoff",
    subtitulo: "Ele descreve a solucao",
    duracaoMin: 6,
    objetivo: "Levar o cliente a verbalizar que precisa de alguem pensando junto.",
  },
  {
    key: "proposta",
    num: 6,
    label: "Proposta",
    subtitulo: "Experiencia desenhada",
    duracaoMin: 8,
    objetivo: "Apresentar conceito, escolhas e logistica usando as palavras do cliente.",
  },
  {
    key: "fechamento",
    num: 7,
    label: "Fechamento",
    subtitulo: "Reserva estrategica",
    duracaoMin: 5,
    objetivo: "Transformar identificacao em compromisso de reserva com clareza e timing.",
  },
];

export const AGENCIA_FASES_MAP = AGENCIA_FASES.reduce(
  (acc, fase) => ({ ...acc, [fase.key]: fase }),
  {} as Record<AgenciaFaseKey, AgenciaFaseMeta>
);

export const pilaresCuradoria = [
  {
    titulo: "Aproveitamento de tempo",
    texto:
      "Dias de viagem sao limitados. Cada hora desperdicada em deslocamento, fila ou escolha errada nao volta.",
  },
  {
    titulo: "Priorizacao personalizada",
    texto:
      "Buenos Aires nao e igual para todo perfil. O roteiro precisa filtrar o que combina com a pessoa.",
  },
  {
    titulo: "Logistica inteligente",
    texto:
      "Bairro, ordem dos dias, horario, deslocamento e reservas invisiveis fazem a viagem fluir.",
  },
  {
    titulo: "Atencao humana com opiniao",
    texto:
      "O cliente nao quer so informacao. Ele quer alguem que escute, organize e recomende com criterio.",
  },
];

export const perdasMontarSozinho = [
  "Pesquisa infinita que consome tempo e energia.",
  "Priorizacao errada: fazer o obvio e deixar o melhor passar.",
  "Buracos no roteiro, dias mal aproveitados e deslocamentos ruins.",
  "Logistica fraca: hotel, bairro, horario ou sequencia que travam a experiencia.",
  "Descobrir tarde demais aquilo que teria valido a viagem.",
];

export const perguntasWhatsApp: PerguntaPlaybook[] = [
  {
    texto: "Me conta o que te fez pensar em Buenos Aires agora?",
    foco: "Origem do desejo e urgencia emocional.",
    capturar: "Motivo real: celebracao, primeira internacional, descanso, recompensa.",
  },
  {
    texto: "Quando voce imagina essa viagem ideal, o que aparece primeiro?",
    foco: "Imagem mental da experiencia.",
    capturar: "Cultura, gastronomia, tango, romance, conforto, descoberta.",
  },
  {
    texto: "Como voce costuma organizar uma viagem quando quer que ela saia bem feita?",
    foco: "Processo atual de decisao.",
    capturar: "Excesso de pesquisa, inseguranca, dependencia de opiniao, falta de tempo.",
  },
  {
    texto: "O que mais te preocupa numa primeira viagem internacional ou numa cidade nova?",
    foco: "Risco percebido.",
    capturar: "Medo de errar hotel, gastar mal, perder tempo, nao aproveitar.",
  },
];

export const perguntasSituacaoAgencia: PerguntaPlaybook[] = [
  {
    texto: "Me conta: o que te fez querer ir para Buenos Aires?",
    foco: "Historia por tras do destino.",
    capturar: "Desejo, contexto e significado da viagem.",
  },
  {
    texto: "Quando fecha os olhos e imagina essa viagem, o que voce ve?",
    foco: "Cenas e expectativas.",
    capturar: "Palavras emocionais para usar na proposta.",
  },
  {
    texto: "Me descreve como e um dia perfeito de viagem para voce.",
    foco: "Ritmo, conforto e prioridades.",
    capturar: "Se gosta de agenda intensa, liberdade, gastronomia, cultura, descanso.",
  },
  {
    texto: "O que te faz voltar de uma viagem com sensacao de que valeu cada centavo?",
    foco: "Criterio de valor.",
    capturar: "O que justifica investimento para esse cliente.",
  },
  {
    texto: "Me conta da viagem mais marcante que voce ja fez. O que fez ela ser tao boa?",
    foco: "Padrao positivo.",
    capturar: "Elementos que precisam aparecer na proposta.",
  },
  {
    texto: "E a viagem mais frustrante? O que voce nao quer repetir?",
    foco: "Antiexperiencia.",
    capturar: "Medos, arrependimentos e limites.",
  },
];

export const perguntasProblemaAgencia: PerguntaPlaybook[] = [
  {
    texto: "Quando voce comeca a pesquisar uma viagem internacional, o que acontece com seu tempo e energia?",
    foco: "Custo mental da pesquisa.",
    capturar: "Sinais de cansaco, procrastinacao ou excesso de abas abertas.",
  },
  {
    texto: "Como e lidar com tantas opcoes de hotel, bairro, passeio e restaurante sem saber o que priorizar?",
    foco: "Confusao por excesso de informacao.",
    capturar: "Palavras sobre inseguranca e duvida.",
  },
  {
    texto: "O que mais te incomoda na ideia de organizar tudo sozinho para um lugar que voce ainda nao conhece?",
    foco: "Risco de montar errado.",
    capturar: "O erro que ele mais quer evitar.",
  },
  {
    texto: "Em algum momento voce ja voltou de uma viagem pensando: eu deveria ter feito diferente?",
    foco: "Arrependimento passado.",
    capturar: "Frase exata do arrependimento.",
  },
];

export const perguntasImplicacaoAgencia: PerguntaPlaybook[] = [
  {
    texto: "Se no terceiro dia voce descobrir que escolheu um bairro ruim para se hospedar, o que isso muda na viagem?",
    foco: "Implicacao de logistica.",
    capturar: "Consequencia emocional e financeira.",
  },
  {
    texto: "Se voce voltar e descobrir que deixou de viver uma experiencia que era exatamente a sua cara, como se sentiria?",
    foco: "Implicacao de priorizacao errada.",
    capturar: "Medo de arrependimento.",
  },
  {
    texto: "Quanto vale evitar a sensacao de voltar dizendo: eu deveria ter feito diferente?",
    foco: "Valor da curadoria.",
    capturar: "O preco emocional do erro.",
  },
  {
    texto: "Pensando que a viagem custa caro por hora vivida, o que acontece quando meio dia e desperdicado por falta de planejamento?",
    foco: "Monetizacao do tempo.",
    capturar: "Conexao entre tempo, dinheiro e experiencia.",
  },
];

export const perguntasNeedPayoffAgencia: PerguntaPlaybook[] = [
  {
    texto: "Diante disso, o que te daria mais tranquilidade para viajar sem ficar preso em pesquisa infinita?",
    foco: "Cliente descreve a solucao.",
    capturar: "Algo como: alguem que organize, filtre e oriente.",
  },
  {
    texto: "Como seria ter alguem que entende seu perfil, seleciona o que faz sentido e desenha a experiencia certa para voce?",
    foco: "Valor percebido da curadoria.",
    capturar: "Beneficio dito com palavras dele.",
  },
  {
    texto: "Se a proposta ja viesse com bairro, logistica, gastronomia e experiencias alinhadas ao que voce contou, isso muda sua seguranca para decidir?",
    foco: "Validacao antes da proposta.",
    capturar: "Nivel de confianca e objecoes restantes.",
  },
];

export const roteiroPropostaAgencia = [
  "Reancore com as palavras exatas do cliente.",
  "Mostre o conceito da viagem antes de falar de itens.",
  "Explique bairro e hotel pelo motivo, nao pela tabela.",
  "Mostre experiencias, gastronomia e ritmo como escolhas de perfil.",
  "Explique a logistica invisivel: ordem dos dias, deslocamentos, horarios e reservas.",
  "Use prova social quando houver aderencia.",
  "Apresente investimento por ultimo, depois do valor da experiencia.",
];

export const microCompromissosAgencia = [
  "Voce se reconheceu nessa proposta?",
  "Isso parece a viagem que voce descreveu no inicio da conversa?",
  "Considerando que cada hora da viagem precisa ser bem aproveitada, esse investimento faz sentido?",
];

export const frasesAltoNivelAgencia = [
  "Eu nao vendo passagem. Eu desenho a experiencia certa para como voce gosta de viajar.",
  "Comprar e facil. Aproveitar bem e outra historia.",
  "Informacao nao falta. O que falta e alguem que organize tudo com inteligencia para o seu perfil.",
  "A viagem custa caro por hora vivida. Cada hora desperdicada la e hora que nao volta.",
  "Buenos Aires e o palco. A curadoria humana e o que transforma dias limitados na melhor versao possivel da viagem.",
];
