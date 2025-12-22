'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'
import type { TableColumn } from '@/lib/table-columns'

interface TableFilterBarProps {
  columns: TableColumn[]
  filters: Record<string, any>
  onFilterChange: (filters: Record<string, any>) => void
}

export function TableFilterBar({ columns, filters, onFilterChange }: TableFilterBarProps) {
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({})

  function updateFilter(columnId: string, value: any) {
    onFilterChange({
      ...filters,
      [columnId]: value,
    })
  }

  function clearFilter(columnId: string) {
    const newFilters = { ...filters }
    delete newFilters[columnId]
    onFilterChange(newFilters)
  }

  function renderFilterInput(column: TableColumn) {
    const filterValue = filters[column.id] || ''

    switch (column.fieldType) {
      case 'text':
        return (
          <Input
            placeholder={`Filter ${column.label}...`}
            value={filterValue}
            onChange={(e) => updateFilter(column.id, e.target.value)}
            className="w-full"
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            placeholder={`Filter ${column.label}...`}
            value={filterValue}
            onChange={(e) => updateFilter(column.id, e.target.value ? parseFloat(e.target.value) : '')}
            className="w-full"
          />
        )
      case 'select':
        return (
          <Select value={filterValue} onValueChange={(val) => updateFilter(column.id, val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Filter ${column.label}...`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle</SelectItem>
              {column.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'checkbox':
        return (
          <Select value={filterValue} onValueChange={(val) => updateFilter(column.id, val === 'true' ? true : val === 'false' ? false : '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Filter ${column.label}...`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle</SelectItem>
              <SelectItem value="true">Ja</SelectItem>
              <SelectItem value="false">Nein</SelectItem>
            </SelectContent>
          </Select>
        )
      case 'status':
        return (
          <Select value={filterValue} onValueChange={(val) => updateFilter(column.id, val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Filter ${column.label}...`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle</SelectItem>
              <SelectItem value="new">Neu</SelectItem>
              <SelectItem value="contacted">Kontaktiert</SelectItem>
              <SelectItem value="converted">Konvertiert</SelectItem>
              <SelectItem value="declined">Abgelehnt</SelectItem>
            </SelectContent>
          </Select>
        )
      default:
        return (
          <Input
            placeholder={`Filter ${column.label}...`}
            value={filterValue}
            onChange={(e) => updateFilter(column.id, e.target.value)}
            className="w-full"
          />
        )
    }
  }

  const filterableColumns = columns.filter(col => col.filterable)
  const activeFilters = Object.keys(filters).filter(key => filters[key] !== null && filters[key] !== undefined && filters[key] !== '')

  if (filterableColumns.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filterableColumns.map((column) => {
        const hasFilter = activeFilters.includes(column.id)
        const isOpen = openFilters[column.id] || false

        return (
          <Popover
            key={column.id}
            open={isOpen}
            onOpenChange={(open) => setOpenFilters(prev => ({ ...prev, [column.id]: open }))}
          >
            <PopoverTrigger asChild>
              <Button
                variant={hasFilter ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {column.label}
                {hasFilter && (
                  <X
                    className="h-3 w-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearFilter(column.id)
                    }}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <div className="font-medium text-sm">{column.label} filtern</div>
                {renderFilterInput(column)}
                {hasFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => clearFilter(column.id)}
                  >
                    Filter entfernen
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )
      })}
      {activeFilters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange({})}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Alle Filter entfernen
        </Button>
      )}
    </div>
  )
}

