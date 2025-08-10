'use client'

import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ✅ Importación de los modales corregida
import NuevoPedidoModal from './QuickActionsWithModal' // Ahora importa el archivo correcto
import NewOrderVzlaModal from './NewOrderVzlaModal'

// ✅ Interfaz para los datos del modal de China
interface FormDataChina {
  cliente: string
  telefono: string
  producto: string
  cantidad: number | null
  precioUnitario: number | null
  direccionEntrega: string
}

// ✅ Interfaz para los datos del modal de Venezuela
interface FormDataVzla {
  empresa: string
  rif: string
  contacto: string
  telefono: string
  categoria: string
  cantidadLotes: number | null
  precioPorLote: number | null
  almacenDestino: string
  observaciones: string
}

// ✅ Define la interfaz de props para QuickActions, con funciones de submit separadas
interface QuickActionsProps {
  onChinaSubmit: (data: FormDataChina) => void
  onVzlaSubmit: (data: FormDataVzla) => void
}

export default function QuickActions({ onChinaSubmit, onVzlaSubmit }: QuickActionsProps) {
  const [isChinaModalOpen, setIsChinaModalOpen] = useState(false)
  const [isVzlaModalOpen, setIsVzlaModalOpen] = useState(false)

  // ✅ Función para manejar el submit del modal de China
  const handleChinaSubmit = (data: FormDataChina) => {
    onChinaSubmit(data)
    setIsChinaModalOpen(false)
  }

  // ✅ Función para manejar el submit del modal de Venezuela
  const handleVzlaSubmit = (data: FormDataVzla) => {
    onVzlaSubmit(data)
    setIsVzlaModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* ✅ Botón para abrir el modal de China */}
          <Button
            onClick={() => setIsChinaModalOpen(true)}
            className="w-full bg-gradient-to-r from-[#EE3C23] to-[#d63419] hover:from-[#d63419] hover:to-[#c22e15] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Pedido (China)
          </Button>

          {/* ✅ Botón para abrir el modal de Venezuela */}
          <Button
            onClick={() => setIsVzlaModalOpen(true)}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Pedido (Vzla)
          </Button>
        </CardContent>
      </Card>

      {/* ✅ Componente del modal de China, con su propio handler */}
      <NuevoPedidoModal
        isOpen={isChinaModalOpen}
        onClose={() => setIsChinaModalOpen(false)}
        onSubmit={handleChinaSubmit}
      />

      {/* ✅ Componente del modal de Venezuela, con su propio handler */}
      <NewOrderVzlaModal
        isOpen={isVzlaModalOpen}
        onClose={() => setIsVzlaModalOpen(false)}
        onSubmit={handleVzlaSubmit}
      />
    </div>
  )
}