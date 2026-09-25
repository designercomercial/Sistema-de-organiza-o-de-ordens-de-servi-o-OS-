export type EmployeeStatus = "disponivel" | "em_atendimento" | "indisponivel" | "ativo"

export type EquipmentStatus = "ativo" | "inativo" | "em_manutencao"

export type ServiceOrderStatus =
  | "agendada"
  | "em_andamento"
  | "concluida"
  | "atrasada"
  | "cancelada"

export type Priority = "baixa" | "normal" | "alta" | "urgente"

export type QuestionType =
  | "sim_nao"
  | "texto_curto"
  | "texto_longo"
  | "numero"
  | "selecao"
  | "data"

export type EntityStatus = "ativo" | "inativo"

export interface Employee {
  id: string
  name: string
  role: string
  phone: string
  email: string
  status: EmployeeStatus
  initials: string
}

export interface Client {
  id: string
  name: string
  address: string
  city: string
  state: string
  phone: string
  email: string
  contact: string
}

export interface Location {
  id: string
  name: string
  clientId: string
  address: string
  city: string
  state: string
}

export interface Equipment {
  id: string
  name: string
  clientId: string
  assetTag: string
  model: string
  serialNumber: string
  power: string
  type: string
  status: EquipmentStatus
}

export interface Question {
  id: string
  title: string
  type: QuestionType
  required: boolean
  options?: string[]
}

export interface Questionnaire {
  id: string
  name: string
  serviceTypeId: string
  status: EntityStatus
  updatedAt: string
  questions: Question[]
}

export interface ServiceType {
  id: string
  name: string
  description: string
  questionnaireId: string
  status: EntityStatus
}

export interface ChecklistItem {
  id: string
  title: string
  type: QuestionType
  required: boolean
  options?: string[]
  done: boolean
  answer?: string
}

export type ManometroTipo = "bourdon" | "coluna_agua"

export type ResultadoTeste = "aprovado" | "reprovado"

export type RedeTipo = "primaria" | "secundaria"

export interface TechnicalReport {
  manometro: ManometroTipo | ""
  quantidadeLeituras: string
  resultadoTeste: ResultadoTeste | ""
  redeEstanqueidade: RedeTipo | ""
  tempoTeste: string
  fluido: string
  establishment: string
  servicosPrestados: string[]
}

export interface ServiceOrder {
  id: string
  number: number
  employeeIds: string[]
  clientId: string
  equipmentIds: string[]
  serviceTypeId: string
  questionnaireId: string
  date: string
  startTime: string
  durationHours: number | null
  priority: Priority
  description: string
  status: ServiceOrderStatus
  useRegisteredAddress: boolean
  customAddress?: string
  checklist: ChecklistItem[]
  technicalReport?: TechnicalReport
  createdAt: string
}

export interface NewServiceOrderInput {
  employeeIds: string[]
  clientId: string
  equipmentIds: string[]
  serviceTypeId: string
  questionnaireId: string
  date: string
  startTime: string
  durationHours: number | null
  priority: Priority
  description: string
  useRegisteredAddress: boolean
  customAddress?: string
  technicalReport?: TechnicalReport
}

export type SolicitacaoTipo = "instalacao" | "manutencao" | "inspecao" | "conversao" | "reparo"

export type SolicitacaoStatus = "pendente" | "em_analise" | "aprovada" | "recusada" | "convertida"

export interface ServiceRequest {
  id: string
  number: number
  type: SolicitacaoTipo
  clientId: string
  locationId?: string
  contactName: string
  phone: string
  notes: string
  status: SolicitacaoStatus
  createdAt: string
}

export interface NewServiceRequestInput {
  type: SolicitacaoTipo
  clientId: string
  locationId?: string
  contactName: string
  phone: string
  notes: string
}

export interface CensoPrevioEquipamento {
  hasStove: boolean
  quantity: string
  brand: string
  model: string
  warranty: boolean
  burnerCount: string
  stoveType: string
}

export interface CensoPrevioVisitaTecnica {
  problemSolved: boolean | null
  complaint: string
  diagnosis: string
}

export interface CensoPrevio {
  id: string
  number: number
  clientName: string
  phone: string
  date: string
  arrivalTime: string
  departureTime: string
  unit: string
  supervisor: string
  executorId: string
  establishment: string
  equipment: CensoPrevioEquipamento
  technicalVisit: CensoPrevioVisitaTecnica
  receivedGuide: boolean
  acknowledgedServices: boolean
  responsibleRole: string
  responsibleName: string
  createdAt: string
}

export interface NewCensoPrevioInput {
  clientName: string
  phone: string
  date: string
  arrivalTime: string
  departureTime: string
  unit: string
  supervisor: string
  executorId: string
  establishment: string
  equipment: CensoPrevioEquipamento
  technicalVisit: CensoPrevioVisitaTecnica
  receivedGuide: boolean
  acknowledgedServices: boolean
  responsibleRole: string
  responsibleName: string
}
