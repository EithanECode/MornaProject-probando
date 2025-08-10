// components/ui/EditOrderModal.tsx
"use client";

import React, { useState } from 'react';

// Interfaces de tipos para los datos del pedido
interface TrackingItem {
  id: string;
  usuario: string;
  pedido: string;
  transporte: 'Aéreo' | 'Marítimo' | 'Terrestre';
  estado: 'pedido-solicitado' | 'cotizacion-china' | 'cotizacion-venezuela' | 'cliente-paga' | 'validar-pago' | 're-empacar-china' | 'en-transito' | 'almacen-venezuela' | 'entregado';
  diasRestantes: number;
  fecha: string;
  notas?: string;
}

interface EditOrderModalProps {
  order: TrackingItem;
  onClose: () => void;
  onSave: (editedOrder: TrackingItem) => void;
  onDelete: (orderId: string) => void;
}


const EditOrderModal = ({ order, onClose, onSave, onDelete }: EditOrderModalProps) => {
  const [editedOrder, setEditedOrder] = useState<TrackingItem>({...order, notas: order.notas || ''});


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedOrder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedOrder);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Editar Pedido {order.id}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Información del Pedido</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                <input
                  type="text"
                  name="usuario"
                  value={editedOrder.usuario}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID del Pedido</label>
                <input
                  type="text"
                  name="id"
                  value={editedOrder.id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Pedido</label>
                <input
                  type="text"
                  name="pedido"
                  value={editedOrder.pedido}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas del Pedido</label>
                <textarea
                  name="notas"
                  value={editedOrder.notas || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px]"
                  placeholder="Notas internas, comentarios, etc."
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Estado y Transporte</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  name="estado"
                  value={editedOrder.estado}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pedido-solicitado">Pedido Solicitado</option>
                  <option value="cotizacion-china">Cotización China</option>
                  <option value="cotizacion-venezuela">Cotización Venezuela</option>
                  <option value="cliente-paga">Cliente Paga</option>
                  <option value="validar-pago">Validar Pago</option>
                  <option value="re-empacar-china">Re-empacar China</option>
                  <option value="en-transito">En Tránsito</option>
                  <option value="almacen-venezuela">Almacén Venezuela</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transporte</label>
                <select
                  name="transporte"
                  value={editedOrder.transporte}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Aéreo">Aéreo</option>
                  <option value="Marítimo">Marítimo</option>
                  <option value="Terrestre">Terrestre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Días Restantes</label>
                <input
                  type="number"
                  name="diasRestantes"
                  value={editedOrder.diasRestantes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Pedido</label>
                <input
                  type="text"
                  name="fecha"
                  value={editedOrder.fecha}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-between items-center">
            <div>
              <button type="button" onClick={() => onDelete(order.id)} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors mr-2">
                Eliminar Pedido
              </button>
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Guardar Cambios
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;