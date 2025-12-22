import { PropertyDefinitionManager } from '@/components/admin/property-definition-manager'

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sage-900">Eigenschaften verwalten</h1>
        <p className="mt-2 text-sage-600">
          Definieren Sie Eigenschaften, die Leads und Kunden zugewiesen werden können.
        </p>
      </div>
      <PropertyDefinitionManager />
    </div>
  )
}

