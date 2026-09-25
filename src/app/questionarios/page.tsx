"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { useApp } from "@/store/app-store"

export default function QuestionnairesPage() {
  const router = useRouter()
  const { questionnaires, serviceTypes } = useApp()

  return (
    <div>
      <PageHeader
        title="Questionários"
        description="Checklists simples, vinculados ao tipo de serviço."
      />
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo de Serviço</TableHead>
              <TableHead>Quantidade de Perguntas</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questionnaires.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => router.push(`/questionarios/${item.id}`)}
              >
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  {serviceTypes.find((type) => type.id === item.serviceTypeId)?.name}
                </TableCell>
                <TableCell>{item.questions.length} perguntas</TableCell>
                <TableCell>{item.updatedAt.split("-").reverse().join("/")}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.status === "ativo" ? "Ativo" : "Inativo"}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
