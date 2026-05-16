import { gerarTexto, extrairJSON } from "./ai";

export interface PacoteInput {
  nome: string;
  destino: string;
  tipo: string;
  duracaoDias: number;
  valorTotal: number;
  moeda: string;
  personaAlvo: string;
  descricao: string;
  diferenciais?: string | null;
  objecoesComuns?: string | null;
}

export interface PerguntaPlaybookGerada {
  texto: string;
  foco: string;
  capturar?: string;
}

export interface SpinGerado {
  pilares: { titulo: string; texto: string }[];
  perdasMontarSozinho: string[];
  perguntasWhatsApp: PerguntaPlaybookGerada[];
  perguntasSituacao: PerguntaPlaybookGerada[];
  perguntasProblema: PerguntaPlaybookGerada[];
  perguntasImplicacao: PerguntaPlaybookGerada[];
  perguntasNeedPayoff: PerguntaPlaybookGerada[];
  roteiroProposta: string[];
  microCompromissos: string[];
  frasesAltoNivel: string[];
}

const SYSTEM_PROMPT = `Você é um especialista sênior em vendas consultivas SPIN Selling, com foco em agências de viagens premium.
Sua tarefa é gerar um playbook completo de atendimento personalizado para um pacote de viagem específico.

PRINCÍPIOS:
- Curadoria humana > montar sozinho. O cliente paga por TEMPO BEM APROVEITADO.
- Cada hora da viagem custa caro. Erro de roteiro = horas perdidas que não voltam.
- O vendedor não vende passagem — desenha a experiência certa para o perfil.
- Perguntas SPIN devem ser ABERTAS, emocionais, não cabíveis em "sim/não".
- Implicação deve doer: arrependimento, desperdício de tempo, escolha errada.
- Need-Payoff faz o cliente DESCREVER a solução com palavras dele.
- Nunca falar do CRM. Nunca falar do sistema. Apenas da experiência.

FORMATO DE SAÍDA: APENAS JSON válido (sem markdown, sem fences), com esta estrutura exata:

{
  "pilares": [
    { "titulo": "...", "texto": "..." }
  ],
  "perdasMontarSozinho": ["...", "..."],
  "perguntasWhatsApp": [
    { "texto": "...", "foco": "...", "capturar": "..." }
  ],
  "perguntasSituacao": [{...}],
  "perguntasProblema": [{...}],
  "perguntasImplicacao": [{...}],
  "perguntasNeedPayoff": [{...}],
  "roteiroProposta": ["...", "..."],
  "microCompromissos": ["...", "..."],
  "frasesAltoNivel": ["...", "..."]
}

QUANTIDADES OBRIGATÓRIAS:
- pilares: 4 itens (aproveitamento de tempo, priorização, logística, atenção humana — adaptados ao destino)
- perdasMontarSozinho: 5 itens específicos do destino
- perguntasWhatsApp: 4 perguntas (criar desejo, levar para chamada)
- perguntasSituacao: 6 perguntas (sonho, perfil, histórico)
- perguntasProblema: 4 perguntas (custo de montar sozinho)
- perguntasImplicacao: 4 perguntas (dor de escolher errado)
- perguntasNeedPayoff: 3 perguntas (cliente descreve solução)
- roteiroProposta: 7 passos
- microCompromissos: 3 perguntas de fechamento progressivo
- frasesAltoNivel: 5 frases de posicionamento que o vendedor pode usar`;

export function buildPromptUsuario(pacote: PacoteInput): string {
  return `Gere o playbook SPIN COMPLETO para o seguinte pacote:

NOME DO PACOTE: ${pacote.nome}
DESTINO: ${pacote.destino}
TIPO: ${pacote.tipo}
DURAÇÃO: ${pacote.duracaoDias} dias
VALOR: ${pacote.valorTotal} ${pacote.moeda}
PERSONA ALVO: ${pacote.personaAlvo}

DESCRIÇÃO DO PACOTE:
${pacote.descricao}

${pacote.diferenciais ? `DIFERENCIAIS:\n${pacote.diferenciais}` : ""}

${pacote.objecoesComuns ? `OBJEÇÕES COMUNS QUE CLIENTES COSTUMAM TRAZER:\n${pacote.objecoesComuns}` : ""}

Importante: TODAS as perguntas, pilares, perdas e frases devem ser PERSONALIZADAS para "${pacote.destino}" e o perfil "${pacote.personaAlvo}". Não use exemplos genéricos. Use referências culturais, geográficas e contextuais reais do destino.

Retorne APENAS o JSON, sem texto antes ou depois.`;
}

export async function gerarSpinParaPacote(
  pacote: PacoteInput
): Promise<{ spin: SpinGerado; provider: string; modelo: string }> {
  const resultado = await gerarTexto({
    systemPrompt: SYSTEM_PROMPT,
    prompt: buildPromptUsuario(pacote),
    maxTokens: 8000,
    temperature: 0.7,
  });

  const json = extrairJSON<SpinGerado>(resultado.texto);
  if (!json) {
    throw new Error(
      `IA retornou resposta não-JSON. Provider: ${resultado.provider}. Início: ${resultado.texto.slice(0, 200)}`
    );
  }

  // Validação básica
  const camposObrigatorios: (keyof SpinGerado)[] = [
    "pilares",
    "perdasMontarSozinho",
    "perguntasWhatsApp",
    "perguntasSituacao",
    "perguntasProblema",
    "perguntasImplicacao",
    "perguntasNeedPayoff",
    "roteiroProposta",
    "microCompromissos",
    "frasesAltoNivel",
  ];
  for (const campo of camposObrigatorios) {
    if (!Array.isArray(json[campo])) {
      throw new Error(`IA omitiu o campo obrigatório: ${campo}`);
    }
  }

  return { spin: json, provider: resultado.provider, modelo: resultado.modelo };
}
