"use client"

import { useMemo, useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function SearchableSelect<T extends { id: string }>({
  items,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Buscar...",
  getLabel,
  getDescription,
  className,
}: {
  items: T[]
  value?: string
  onChange: (id: string) => void
  placeholder: string
  searchPlaceholder?: string
  getLabel: (item: T) => string
  getDescription?: (item: T) => string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const selected = items.find((item) => item.id === value)

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim()
    if (!term) return items
    return items.filter((item) => {
      const haystack = `${getLabel(item)} ${getDescription?.(item) ?? ""}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [getDescription, getLabel, items, query])

  return (
    <Popover open={open} onOpenChange={(next) => setOpen(next)}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn("h-9 w-full justify-between font-normal", className)}
          />
        }
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? getLabel(selected) : placeholder}
        </span>
        <ChevronsUpDown className="size-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) p-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className="mb-2"
        />
        <div className="max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">Nenhum resultado.</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "flex w-full flex-col rounded-md px-2 py-1.5 text-left hover:bg-muted",
                  item.id === value && "bg-muted"
                )}
                onClick={() => {
                  onChange(item.id)
                  setOpen(false)
                  setQuery("")
                }}
              >
                <span className="text-sm">{getLabel(item)}</span>
                {getDescription ? (
                  <span className="text-xs text-muted-foreground">{getDescription(item)}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function SearchableMultiSelect<T extends { id: string }>({
  items,
  values,
  onChange,
  placeholder,
  searchPlaceholder = "Buscar...",
  getLabel,
  getDescription,
  className,
}: {
  items: T[]
  values: string[]
  onChange: (ids: string[]) => void
  placeholder: string
  searchPlaceholder?: string
  getLabel: (item: T) => string
  getDescription?: (item: T) => string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const selected = items.filter((item) => values.includes(item.id))

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim()
    if (!term) return items
    return items.filter((item) => {
      const haystack = `${getLabel(item)} ${getDescription?.(item) ?? ""}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [getDescription, getLabel, items, query])

  function toggle(id: string) {
    onChange(values.includes(id) ? values.filter((item) => item !== id) : [...values, id])
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className={cn("h-9 w-full justify-between font-normal", className)}
            />
          }
        >
          <span className={cn("truncate", selected.length === 0 && "text-muted-foreground")}>
            {selected.length === 0
              ? placeholder
              : selected.length === 1
                ? getLabel(selected[0])
                : `${selected.length} selecionados`}
          </span>
          <ChevronsUpDown className="size-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--anchor-width) p-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="mb-2"
          />
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">Nenhum resultado.</p>
            ) : (
              filtered.map((item) => {
                const checked = values.includes(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted",
                      checked && "bg-muted"
                    )}
                    onClick={() => toggle(item.id)}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input",
                        checked && "border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      {checked ? <Check className="size-3" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm">{getLabel(item)}</span>
                      {getDescription ? (
                        <span className="block text-xs text-muted-foreground">
                          {getDescription(item)}
                        </span>
                      ) : null}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-muted px-2 py-0.5 text-xs"
            >
              {getLabel(item)}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-background"
                aria-label={`Remover ${getLabel(item)}`}
                onClick={() => toggle(item.id)}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
