import type { Employee } from "@/types"

export function formatEmployeeNames(
  employeeIds: string[],
  employeeById: (id: string) => Employee | undefined,
  options?: { firstName?: boolean }
) {
  const names = employeeIds
    .map((id) => employeeById(id)?.name)
    .filter((name): name is string => Boolean(name))
    .map((name) => (options?.firstName ? name.split(" ")[0] : name))
  return names.join(", ")
}
