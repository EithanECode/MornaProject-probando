'use client'

import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface NewOrderProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: FormData) => void
}

interface FormData {
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

export default function NewOrderVzlaModal({ isOpen, onClose, onSubmit }: NewOrderProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    empresa: '',
    rif: '',
    contacto: '',
    telefono: '',
    categoria: '',
    cantidadLotes: null,
    precioPorLote: null,
    almacenDestino: '',
    observaciones: '',
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsVisible(false), 200)
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cantidadLotes' || name === 'precioPorLote') {
      const parsedValue = value.trim() === '' ? null : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: parsedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name as keyof FormData]: undefined }));
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}
    if (!formData.empresa.trim()) newErrors.empresa = 'Requerido'
    if (!formData.rif.trim()) newErrors.rif = 'Requerido'
    if (!formData.contacto.trim()) newErrors.contacto = 'Requerido'
    if (!formData.telefono.trim()) newErrors.telefono = 'Requerido'
    if (!formData.categoria.trim()) newErrors.categoria = 'Requerido'
    if (formData.cantidadLotes === null || formData.cantidadLotes <= 0) newErrors.cantidadLotes 
    if (formData.precioPorLote === null || formData.precioPorLote <= 0) newErrors.precioPorLote 
    if (!formData.almacenDestino.trim()) newErrors.almacenDestino = 'Requerido'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit?.(formData as FormData)
      setFormData({ 
        empresa: '',
        rif: '',
        contacto: '',
        telefono: '',
        categoria: '',
        cantidadLotes: null,
        precioPorLote: null,
        almacenDestino: '',
        observaciones: '',
      })
      onClose()
    }
  }

  const handleCancel = () => {
    setFormData({ 
      empresa: '',
      rif: '',
      contacto: '',
      telefono: '',
      categoria: '',
      cantidadLotes: null,
      precioPorLote: null,
      almacenDestino: '',
      observaciones: '',
    })
    setErrors({})
    onClose()
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-all duration-200 ease-out ${
        isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
    >
      <Card 
        className={`w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-xl border-0 bg-white/70 backdrop-blur-sm transition-all duration-300 ease-out ${
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">Nuevo Pedido - Venezuela (Al Mayor)</CardTitle>
          <Button onClick={handleCancel} variant="ghost" size="sm" className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Empresa/Distribuidor</label>
                <input
                  type="text"
                  name="empresa"
                  placeholder="Nombre de la empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#514F4F] focus:border-transparent bg-white text-black placeholder-gray-400 ${errors.empresa ? 'border-[#EE3C23]' : 'border-gray-300'}`}
                />
                {errors.empresa && <p className="text-[#EE3C23] text-xs mt-1">{errors.empresa}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">RIF/NIT</label>
                <input
                  type="text"
                  name="rif"
                  placeholder="J-xxxxxxxx"
                  value={formData.rif}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#514F4F] focus:border-transparent bg-white text-black placeholder-gray-400 ${errors.rif ? 'border-[#EE3C23]' : 'border-gray-300'}`}
                />
                {errors.rif && <p className="text-[#EE3C23] text-xs mt-1">{errors.rif}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Contacto</label>
                <input
                  type="text"
                  name="contacto"
                  placeholder="Persona de contacto"
                  value={formData.contacto}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#514F4F] focus:border-transparent bg-white text-black placeholder-gray-400 ${errors.contacto ? 'border-[#EE3C23]' : 'border-gray-300'}`}
                />
                {errors.contacto && <p className="text-[#EE3C23] text-xs mt-1">{errors.contacto}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="+58 xxxx xxx xxxx"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#514F4F] focus:border-transparent bg-white text-black placeholder-gray-400 ${errors.telefono ? 'border-[#EE3C23]' : 'border-gray-300'}`}
                />
                {errors.telefono && <p className="text-[#EE3C23] text-xs mt-1">{errors.telefono}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Categoría de Productos</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#514F4F] focus:border-transparent bg-white text-black ${errors.categoria ? 'border-[#EE3C23]' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar categoría</option>
                <option value="electronica">Electrónica</option>
                <option value="ropa">Ropa</option>
                <option value="accesorios">Accesorios</option>
                <option value="hogar">Hogar</option>
                <option value="juguetes">Juguetes</option>
                <option value="otros">Otros</option>
              </select>
              {errors.categoria && <p className="text-[#EE3C23] text-xs mt-1">{errors.categoria}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Cantidad (Lotes)</label>
                <input
                  type="number"
                  name="cantidadLotes"
                  placeholder="Cantidad de lotes"
                  min="1"
                  value={formData.cantidadLotes ?? ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#514F4F] focus:border-transparent bg-white text-black placeholder-gray-400 ${errors.cantidadLotes ? 'border-[#EE3C23]' : 'border-gray-300'}`}
                />
                {errors.cantidadLotes && <p className="text-[#EE3C23] text-xs mt-1">{errors.cantidadLotes}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Precio por Lote (Bs.)</label>
                <input
                  type="number"
                  name="precioPorLote"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.precioPorLote ?? ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#514F4F] focus:border-transparent bg-white text-black placeholder-gray-400 ${errors.precioPorLote ? 'border-[#EE3C23]' : 'border-gray-300'}`}
                />
                {errors.precioPorLote && <p className="text-[#EE3C23] text-xs mt-1">{errors.precioPorLote}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Almacén de Destino</label>
              <input
                type="text"
                name="almacenDestino"
                placeholder="Nombre del almacén"
                value={formData.almacenDestino}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#514F4F] focus:border-transparent bg-white text-black placeholder-gray-400 ${errors.almacenDestino ? 'border-[#EE3C23]' : 'border-gray-300'}`}
              />
              {errors.almacenDestino && <p className="text-[#EE3C23] text-xs mt-1">{errors.almacenDestino}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Observaciones</label>
              <textarea
                name="observaciones"
                placeholder="Notas adicionales sobre el pedido"
                rows={3}
                value={formData.observaciones}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#514F4F] focus:border-transparent resize-none bg-white text-black placeholder-gray-400 ${errors.observaciones ? 'border-[#EE3C23]' : 'border-gray-300'}`}
              />
              {errors.observaciones && <p className="text-[#EE3C23] text-xs mt-1">{errors.observaciones}</p>}
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full bg-[#514F4F] hover:bg-[#434141] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                <Plus className="w-4 h-4 mr-2" />
                Crear Pedido
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}