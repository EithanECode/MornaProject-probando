// components/ui/OrderDetailsModal.tsx
import React from 'react';
import StatusBadge from './StatusBadge';

// Interfaces de tipos para los datos del pedido
interface TrackingItem {
  id: string;
  usuario: string;
  pedido: string;
  transporte: 'Aéreo' | 'Marítimo' | 'Terrestre';
  estado: 'pedido-solicitado' | 'cotizacion-china' | 'cotizacion-venezuela' | 'cliente-paga' | 'validar-pago' | 're-empacar-china' | 'en-transito' | 'almacen-venezuela' | 'entregado';
  diasRestantes: number;
  fecha: string;
}

interface OrderDetailsModalProps {
  order: TrackingItem;
  onClose: () => void;
}

const getTransportIcon = (transporte: TrackingItem['transporte']) => {
  const icons = {
    'Aéreo': '✈️',
    'Marítimo': '🚢',
    'Terrestre': '🚚'
  };
  return icons[transporte] || '📦';
};

const OrderDetailsModal = ({ order, onClose }: OrderDetailsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 w-full text-center">Detalles del Pedido {order.id}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 absolute right-8 top-8">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 text-center">Información del Cliente</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Nombre:</span>
                <p className="font-medium">{order.usuario}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Email:</span>
                <p className="font-medium">{order.usuario.toLowerCase().replace(' ', '.')}@email.com</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Teléfono:</span>
                <p className="font-medium">+34 689 556 345</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Dirección:</span>
                <p className="font-medium">Calle Ejemplo 123, Madrid</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 text-center">Detalles del Producto</h4>
            <div className="space-y-2">
              <p><span className="text-sm text-gray-500">Producto:</span> <span className="font-medium">{order.pedido}</span></p>
              <p><span className="text-sm text-gray-500">Cantidad:</span> <span className="font-medium">1 unidad</span></p>
              <p><span className="text-sm text-gray-500">Precio:</span> <span className="font-medium">€1.200</span></p>
              <p><span className="text-sm text-gray-500">SKU:</span> <span className="font-medium">SKU-8924</span></p>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 text-center">Estado y Tracking</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Estado actual:</span>
                <StatusBadge estado={order.estado} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Método de envío:</span>
                <span className="font-medium flex items-center gap-2">
                  <span>{getTransportIcon(order.transporte)}</span>
                  <span className="text-lg font-semibold">{order.transporte}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Días restantes:</span>
                <span className="font-medium">{order.diasRestantes > 0 ? `${order.diasRestantes} días` : 'Completado'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Fecha de pedido:</span>
                <span className="font-medium">{order.fecha}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 text-center">Historial de Tracking</h4>
            <div className="space-y-3">
              {/* Aquí se podría renderizar dinámicamente el timeline real */}
              <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                      <p className="text-sm font-medium">Pedido confirmado</p>
                      <p className="text-xs text-gray-500">2024-01-15 10:30</p>
                  </div>
              </div>
            </div>
          </div>

        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;