"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PriorityBadge } from "@/components/priority-badge"
import { StatusBadge } from "@/components/status-badge"
import { formatEmployeeNames } from "@/lib/employees"
import { formatOsNumber, getDisplayStatus } from "@/lib/status"
import { useLookups } from "@/store/app-store"
import type { ServiceOrder } from "@/types"

export function ServiceOrderTable({ orders }: { orders: ServiceOrder[] }) {
  const router = useRouter()
  const { clientById, employeeById, serviceTypeById } = useLookups()

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>OS</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            return (
              <TableRow
                key={order.id}
                className="cursor-pointer"
                onClick={() => router.push(`/ordens/${order.id}`)}
              >
                <TableCell className="font-medium">{formatOsNumber(order.number)}</TableCell>
                <TableCell>{clientById(order.clientId)?.name}</TableCell>
                <TableCell>{serviceTypeById(order.serviceTypeId)?.name}</TableCell>
                <TableCell>{formatEmployeeNames(order.employeeIds, employeeById)}</TableCell>
                <TableCell>{order.date.split("-").reverse().join("/")}</TableCell>
                <TableCell>{order.startTime}</TableCell>
                <TableCell>
                  <PriorityBadge priority={order.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={getDisplayStatus(order)} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
