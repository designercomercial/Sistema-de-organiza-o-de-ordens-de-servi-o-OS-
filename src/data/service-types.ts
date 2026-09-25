import type { ServiceType } from "@/types"

export const serviceTypes: ServiceType[] = [
  {
    id: "st1",
    name: "Manutenção Preventiva",
    description: "Plano periódico de verificação e conservação da instalação de gás e do fogão.",
    questionnaireId: "q1",
    status: "ativo",
  },
  {
    id: "st2",
    name: "Manutenção Corretiva",
    description: "Atendimento para vazamento, falha de chama ou parada não programada.",
    questionnaireId: "q2",
    status: "ativo",
  },
  {
    id: "st3",
    name: "Instalação",
    description: "Instalação da rede de gás, comissionamento e entrega técnica.",
    questionnaireId: "q3",
    status: "ativo",
  },
  {
    id: "st4",
    name: "Inspeção Técnica",
    description: "Avaliação pontual da instalação e do fogão.",
    questionnaireId: "q4",
    status: "ativo",
  },
  {
    id: "st5",
    name: "Conversão",
    description: "Conversão do fogão e adequação da instalação para gás natural ou GLP.",
    questionnaireId: "q5",
    status: "ativo",
  },
]
