export const MODELO_INTERNO_ENTUR = "entur_crm_interno";
export const MODELO_AGENCIA_BUENOS_AIRES = "agencia_buenos_aires";

export type ModeloSpin =
  | typeof MODELO_INTERNO_ENTUR
  | typeof MODELO_AGENCIA_BUENOS_AIRES;

export interface ModeloSpinMeta {
  key: ModeloSpin;
  label: string;
  subtitulo: string;
  badge: string;
  descricao: string;
  restritoAdmin: boolean;
}

export const MODELOS_SPIN: ModeloSpinMeta[] = [
  {
    key: MODELO_INTERNO_ENTUR,
    label: "Entur OS CRM",
    subtitulo: "Venda interna do CRM",
    badge: "Interno Entur",
    descricao:
      "SPIN Antigravity para mostrar dinheiro na mesa por falta de processos de recuperacao, recorrencia e indicacao.",
    restritoAdmin: true,
  },
  {
    key: MODELO_AGENCIA_BUENOS_AIRES,
    label: "Agencia de Viagens",
    subtitulo: "Experiencia curada",
    badge: "Playbook agencia",
    descricao:
      "SPIN guiado para vender viagem como curadoria, tempo bem aproveitado, logistica inteligente e reducao de arrependimento.",
    restritoAdmin: false,
  },
];

export function normalizarModeloSpin(value: unknown): ModeloSpin {
  if (value === MODELO_AGENCIA_BUENOS_AIRES) return MODELO_AGENCIA_BUENOS_AIRES;
  return MODELO_INTERNO_ENTUR;
}

export function metaModeloSpin(value: string | null | undefined): ModeloSpinMeta {
  const modelo = normalizarModeloSpin(value);
  return MODELOS_SPIN.find((m) => m.key === modelo) ?? MODELOS_SPIN[0];
}
