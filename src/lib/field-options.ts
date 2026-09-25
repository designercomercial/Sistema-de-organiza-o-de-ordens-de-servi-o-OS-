import type { SolicitacaoTipo } from "@/types"

export function toOptions(values: string[]) {
  return values.map((value) => ({ id: value, label: value }))
}

export const UNIDADES = ["Manaus", "Recife", "Biguaçu"]

export const SUPERVISORES = ["Ana Souza", "Bruno Almeida", "Camila Oliveira", "Carlos Mendes"]

export const ESTABELECIMENTOS = [
  "Supermercado Bom Preço",
  "Restaurante Sabor da Casa",
  "Panificadora Pão & Cia",
  "Hotel Central",
]

export const RESPONSAVEL_OPTIONS = [
  "Proprietário",
  "Inquilino",
  "Zelador",
  "Síndico(a)",
  "Secretária",
  "Outro",
]

export const TIPO_FOGAO_OPTIONS = ["Convencional", "Embutido", "Mesa"]

export const SERVICOS_PRESTADOS_OPTIONS = [
  "Conversão",
  "Troca de Kit",
  "CRM/CM/CRP",
  "Teste de Estanqueidade",
  "Comissionamento de Gás",
  "Inst. Regulador 2º estágio",
  "Rede Aérea",
  "Inst. Botijões",
  "Adequação de Ambientes",
  "Atendimentos",
]

export const QUANTIDADE_LEITURAS_OPTIONS = ["1", "2", "3", "4", "5"]

export const SOLICITACAO_TIPOS: { value: SolicitacaoTipo; label: string }[] = [
  { value: "instalacao", label: "Instalação" },
  { value: "manutencao", label: "Manutenção" },
  { value: "inspecao", label: "Inspeção" },
  { value: "conversao", label: "Conversão" },
  { value: "reparo", label: "Reparo" },
]
