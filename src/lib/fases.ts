export type FaseKey =
  | "abertura"
  | "situacao"
  | "problema"
  | "implicacao"
  | "needPayoff"
  | "fechamento";

export interface FaseMeta {
  key: FaseKey;
  num: number;
  label: string;
  subtitulo: string;
  duracaoMin: number;
  corAccent: string; // tailwind color class
  spinTip: string;
}

export const FASES: FaseMeta[] = [
  {
    key: "abertura",
    num: 0,
    label: "Abertura",
    subtitulo: "Contrato da reunião",
    duracaoMin: 2,
    corAccent: "slate",
    spinTip: "Não pitche. Peça permissão para perguntar.",
  },
  {
    key: "situacao",
    num: 1,
    label: "Situação",
    subtitulo: "Entender a operação hoje",
    duracaoMin: 5,
    corAccent: "sky",
    spinTip: "Escute. Não comente. Só registre. Sem benchmark ainda.",
  },
  {
    key: "problema",
    num: 2,
    label: "Problema",
    subtitulo: "Mapear as dores",
    duracaoMin: 10,
    corAccent: "amber",
    spinTip: "Pergunta aberta. Vendedor não fala mais de 30% do tempo.",
  },
  {
    key: "implicacao",
    num: 3,
    label: "Implicação",
    subtitulo: "Amplificar o custo",
    duracaoMin: 10,
    corAccent: "orange",
    spinTip: "Mostre o número. Pare. Deixe ele reagir.",
  },
  {
    key: "needPayoff",
    num: 4,
    label: "Need-Payoff",
    subtitulo: "Fazer ele descrever a solução",
    duracaoMin: 8,
    corAccent: "emerald",
    spinTip: "Ele precisa articular o valor. Não você.",
  },
  {
    key: "fechamento",
    num: 5,
    label: "Fechamento",
    subtitulo: "Próximo passo",
    duracaoMin: 5,
    corAccent: "indigo",
    spinTip: "Silêncio é bom. Não fale primeiro.",
  },
];

export const FASES_MAP: Record<FaseKey, FaseMeta> = FASES.reduce(
  (acc, f) => ({ ...acc, [f.key]: f }),
  {} as Record<FaseKey, FaseMeta>
);
