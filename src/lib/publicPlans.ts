export const PLANS = {
  profissional: {
    id: "profissional",
    name: "Plano Pro",
    price: "30",
    priceCents: 3000,
    description: "Sistema completo de gestão para o seu negócio",
    features: [
      "Estabelecimento com gestão completa",
      "Profissionais ilimitados",
      "Agenda online 24/7",
      "CRM de clientes",
      "Gestão financeira",
      "Relatórios avançados",
      "5 níveis de acesso",
      "Suporte via WhatsApp",
    ],
  },
  pro_ia: {
    id: "pro_ia",
    name: "PRO + IA",
    price: "247",
    priceCents: 34700,
    description: "Tudo do Plano Pro + IA no WhatsApp",
    features: [
      "Tudo do Plano Pro",
      "IA Atendente no WhatsApp 24/7",
      "Respostas automáticas",
      "Lembretes automáticos",
      "Mensagens de retorno",
      "Aniversários automatizados",
      "Promoções e eventos via WhatsApp",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type PublicPlanId = "profissional";

export const VISIBLE_PLAN_IDS: readonly PublicPlanId[] = ["profissional"];

export function getInitialPlanId(value: string | null): PublicPlanId {
  return VISIBLE_PLAN_IDS.includes(value as PublicPlanId)
    ? (value as PublicPlanId)
    : "profissional";
}
