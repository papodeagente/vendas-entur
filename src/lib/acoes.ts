import { Alavanca } from "./perguntas";

export interface AcaoPlano {
  id: number;
  acao: string;
  alavanca: Alavanca;
  prazoSugerido: string;
  preRequisito: string;
  soViavelPorque: string;
  moduloEnturOS: string;
}

export const ACOES_PLANO: AcaoPlano[] = [
  {
    id: 1,
    acao: "Implantar processo de recuperação de venda para atendimentos perdidos",
    alavanca: "recuperacao",
    prazoSugerido: "Dias 1 a 15",
    preRequisito: "Pergunta 4 (CRM) = Sim",
    soViavelPorque:
      "CRM Kanban do Entur OS tem etapa 'Atendimento Perdido' com automação de cadência de 3 toques",
    moduloEnturOS: "CRM + Automação de Follow-up",
  },
  {
    id: 2,
    acao: "Estruturar cadência de follow-up para leads novos",
    alavanca: "recuperacao",
    prazoSugerido: "Dias 1 a 15",
    preRequisito: "Pergunta 5 (Processo desconhecidos) = Sim",
    soViavelPorque:
      "Automação de cadência do Entur OS dispara sequência de 3 a 5 toques por WhatsApp e e-mail",
    moduloEnturOS: "Automação de Follow-up + Cadência",
  },
  {
    id: 3,
    acao: "Implementar scripts de venda padronizados para a equipe",
    alavanca: "recuperacao",
    prazoSugerido: "Dias 15 a 30",
    preRequisito: "Pergunta 6 (Scripts) = Sim",
    soViavelPorque:
      "Playbook do Entur OS permite criar e distribuir scripts por etapa do funil",
    moduloEnturOS: "Scripts de Venda + Playbook Comercial",
  },
  {
    id: 4,
    acao: "Ativar rastreamento UTM em todas as landing pages",
    alavanca: "recuperacao",
    prazoSugerido: "Dias 15 a 30",
    preRequisito: "Pergunta 3 (Landing pages UTM) = Sim",
    soViavelPorque:
      "Módulo de Landing Pages do Entur OS gera UTMs automaticamente e integra com o CRM",
    moduloEnturOS: "Landing Pages com Rastreamento UTM",
  },
  {
    id: 5,
    acao: "Criar processo de pré-venda e qualificação de leads",
    alavanca: "recuperacao",
    prazoSugerido: "Dias 30 a 45",
    preRequisito: "Pergunta 7 (Pré-venda) = Sim",
    soViavelPorque:
      "Etapa de pré-vendas no CRM Kanban do Entur OS filtra leads antes de chegar ao vendedor",
    moduloEnturOS: "Etapa de Pré-Vendas no CRM",
  },
  {
    id: 6,
    acao: "Implementar dashboard de indicadores comerciais",
    alavanca: "recorrencia",
    prazoSugerido: "Dias 30 a 45",
    preRequisito: "Pergunta 8 (Indicadores) = Sim",
    soViavelPorque:
      "Dashboard do Entur OS calcula conversão, ciclo e ticket automaticamente a partir do CRM",
    moduloEnturOS: "Dashboard de Indicadores Comerciais",
  },
  {
    id: 7,
    acao: "Ativar automação de pós-venda e recompra para clientes ativos",
    alavanca: "recorrencia",
    prazoSugerido: "Dias 45 a 60",
    preRequisito: "Pergunta 9 (Processos clientes ativos) = Sim",
    soViavelPorque:
      "Automação de pós-venda do Entur OS dispara sequência de recompra baseada no tempo médio de recompra do cliente",
    moduloEnturOS: "Automação de Pós-Venda + Recompra",
  },
  {
    id: 8,
    acao: "Lançar campanha de reativação de clientes inativos (90 dias)",
    alavanca: "recorrencia",
    prazoSugerido: "Dias 45 a 60",
    preRequisito: "Base de inativos identificada no CRM",
    soViavelPorque:
      "Carteira de Clientes do Entur OS segmenta inativos automaticamente e dispara campanha de reativação",
    moduloEnturOS: "CRM + Carteira de Clientes",
  },
  {
    id: 9,
    acao: "Implantar programa de indicação ativa com clientes satisfeitos",
    alavanca: "indicacao",
    prazoSugerido: "Dias 60 a 90",
    preRequisito: "Pergunta 10 (Indicação ativa) = Sim",
    soViavelPorque:
      "Programa de Indicação do Entur OS automatiza o pedido de indicação após NPS positivo",
    moduloEnturOS: "Programa de Indicação no CRM",
  },
];
