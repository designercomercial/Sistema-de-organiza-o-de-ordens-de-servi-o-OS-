"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  clients as seedClients,
  currentUser,
  employees as seedEmployees,
  equipment as seedEquipment,
  locations as seedLocations,
  questionnaires as seedQuestionnaires,
  serviceOrders as seedOrders,
  serviceTypes as seedServiceTypes,
  buildChecklist,
} from "@/data"
import { DEMO_TODAY } from "@/lib/demo-date"
import { getDisplayStatus } from "@/lib/status"
import type {
  Client,
  Employee,
  Equipment,
  Location,
  NewServiceOrderInput,
  Questionnaire,
  ServiceOrder,
  ServiceOrderStatus,
  ServiceRequest,
  ServiceType,
} from "@/types"
import { serviceRequests as seedServiceRequests } from "@/data/services"

type AppState = {
  employees: Employee[]
  clients: Client[]
  locations: Location[]
  equipment: Equipment[]
  serviceTypes: ServiceType[]
  questionnaires: Questionnaire[]
  serviceOrders: ServiceOrder[]
  serviceRequests: ServiceRequest[]
  currentUser: Employee
  newOsOpen: boolean
  setNewOsOpen: (open: boolean) => void
  createServiceOrder: (input: NewServiceOrderInput) => ServiceOrder
  updateOrderStatus: (id: string, status: ServiceOrderStatus) => void
  toggleChecklistItem: (orderId: string, itemId: string) => void
  addClient: (client: Omit<Client, "id">) => Client
  addLocation: (location: Omit<Location, "id">) => Location
  addEquipment: (item: Omit<Equipment, "id">) => Equipment
  addEmployee: (item: Omit<Employee, "id" | "initials">) => Employee
  addServiceType: (item: Omit<ServiceType, "id">) => ServiceType
  updateQuestionnaire: (item: Questionnaire) => void
  updateServiceType: (item: ServiceType) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState(seedEmployees)
  const [clients, setClients] = useState(seedClients)
  const [locations, setLocations] = useState(seedLocations)
  const [equipment, setEquipment] = useState(seedEquipment)
  const [serviceTypes, setServiceTypes] = useState(seedServiceTypes)
  const [questionnaires, setQuestionnaires] = useState(seedQuestionnaires)
  const [serviceOrders, setServiceOrders] = useState(seedOrders)
  const [serviceRequests] = useState(seedServiceRequests)
  const [newOsOpen, setNewOsOpen] = useState(false)

  const createServiceOrder = useCallback((input: NewServiceOrderInput) => {
    let created!: ServiceOrder
    setServiceOrders((current) => {
      const nextNumber = Math.max(...current.map((item) => item.number)) + 1
      created = {
        id: `os-${nextNumber}`,
        number: nextNumber,
        ...input,
        status: "agendada",
        checklist: buildChecklist(input.questionnaireId),
        createdAt: DEMO_TODAY,
      }
      return [created, ...current]
    })
    return created
  }, [])

  const updateOrderStatus = useCallback((id: string, status: ServiceOrderStatus) => {
    setServiceOrders((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    )
  }, [])

  const toggleChecklistItem = useCallback((orderId: string, itemId: string) => {
    setServiceOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              checklist: order.checklist.map((item) =>
                item.id === itemId ? { ...item, done: !item.done } : item
              ),
            }
          : order
      )
    )
  }, [])

  const addClient = useCallback((client: Omit<Client, "id">) => {
    const next: Client = { ...client, id: `c-${Date.now()}` }
    setClients((current) => [next, ...current])
    return next
  }, [])

  const addLocation = useCallback((location: Omit<Location, "id">) => {
    const next: Location = { ...location, id: `l-${Date.now()}` }
    setLocations((current) => [next, ...current])
    return next
  }, [])

  const addEquipment = useCallback((item: Omit<Equipment, "id">) => {
    const next: Equipment = { ...item, id: `eq-${Date.now()}` }
    setEquipment((current) => [next, ...current])
    return next
  }, [])

  const addEmployee = useCallback((item: Omit<Employee, "id" | "initials">) => {
    const initials = item.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
    const next: Employee = { ...item, id: `e-${Date.now()}`, initials }
    setEmployees((current) => [next, ...current])
    return next
  }, [])

  const addServiceType = useCallback((item: Omit<ServiceType, "id">) => {
    const next: ServiceType = { ...item, id: `st-${Date.now()}` }
    setServiceTypes((current) => [next, ...current])
    return next
  }, [])

  const updateQuestionnaire = useCallback((item: Questionnaire) => {
    setQuestionnaires((current) =>
      current.map((entry) => (entry.id === item.id ? item : entry))
    )
  }, [])

  const updateServiceType = useCallback((item: ServiceType) => {
    setServiceTypes((current) =>
      current.map((entry) => (entry.id === item.id ? item : entry))
    )
  }, [])

  const value = useMemo(
    () => ({
      employees,
      clients,
      locations,
      equipment,
      serviceTypes,
      questionnaires,
      serviceOrders,
      serviceRequests,
      currentUser,
      newOsOpen,
      setNewOsOpen,
      createServiceOrder,
      updateOrderStatus,
      toggleChecklistItem,
      addClient,
      addLocation,
      addEquipment,
      addEmployee,
      addServiceType,
      updateQuestionnaire,
      updateServiceType,
    }),
    [
      employees,
      clients,
      locations,
      equipment,
      serviceTypes,
      questionnaires,
      serviceOrders,
      serviceRequests,
      newOsOpen,
      createServiceOrder,
      updateOrderStatus,
      toggleChecklistItem,
      addClient,
      addLocation,
      addEquipment,
      addEmployee,
      addServiceType,
      updateQuestionnaire,
      updateServiceType,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}

export function useLookups() {
  const { employees, clients, locations, equipment, serviceTypes, questionnaires, serviceOrders } =
    useApp()

  const employeeById = useCallback(
    (id: string) => employees.find((item) => item.id === id),
    [employees]
  )
  const clientById = useCallback(
    (id: string) => clients.find((item) => item.id === id),
    [clients]
  )
  const locationById = useCallback(
    (id: string) => locations.find((item) => item.id === id),
    [locations]
  )
  const locationsForClient = useCallback(
    (clientId: string) => locations.filter((item) => item.clientId === clientId),
    [locations]
  )
  const equipmentById = useCallback(
    (id: string) => equipment.find((item) => item.id === id),
    [equipment]
  )
  const serviceTypeById = useCallback(
    (id: string) => serviceTypes.find((item) => item.id === id),
    [serviceTypes]
  )
  const questionnaireById = useCallback(
    (id: string) => questionnaires.find((item) => item.id === id),
    [questionnaires]
  )

  const ordersForClient = useCallback(
    (clientId: string) => serviceOrders.filter((item) => item.clientId === clientId),
    [serviceOrders]
  )
  const ordersForEquipment = useCallback(
    (equipmentId: string) =>
      serviceOrders.filter((item) => item.equipmentIds.includes(equipmentId)),
    [serviceOrders]
  )
  const ordersForEmployee = useCallback(
    (employeeId: string) => serviceOrders.filter((item) => item.employeeIds.includes(employeeId)),
    [serviceOrders]
  )
  const equipmentForClient = useCallback(
    (clientId: string) => equipment.filter((item) => item.clientId === clientId),
    [equipment]
  )

  const openStatuses = (order: ServiceOrder) => {
    const status = getDisplayStatus(order)
    return status === "agendada" || status === "em_andamento" || status === "atrasada"
  }

  return {
    employeeById,
    clientById,
    locationById,
    locationsForClient,
    equipmentById,
    serviceTypeById,
    questionnaireById,
    ordersForClient,
    ordersForEquipment,
    ordersForEmployee,
    equipmentForClient,
    openStatuses,
  }
}
