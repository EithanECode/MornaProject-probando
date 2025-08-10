
"use client";
import React from 'react';

// Tipos para el estado y la configuración del badge
type Status = 'pedido-solicitado' | 'cotizacion-china' | 'cotizacion-venezuela' | 'cliente-paga' | 'validar-pago' | 're-empacar-china' | 'en-transito' | 'almacen-venezuela' | 'entregado';

interface StatusConfig {
	color: string;
	text: string;
}

const getStatusConfig = (estado: Status): StatusConfig => {
	const statusConfig: Record<Status, StatusConfig> = {
		'pedido-solicitado': { color: 'bg-gray-100 text-gray-800', text: 'Pedido Solicitado' },
		'cotizacion-china': { color: 'bg-yellow-100 text-yellow-800', text: 'Cotización China' },
		'cotizacion-venezuela': { color: 'bg-orange-100 text-orange-800', text: 'Cotización Venezuela' },
		'cliente-paga': { color: 'bg-purple-100 text-purple-800', text: 'Cliente Paga' },
		'validar-pago': { color: 'bg-indigo-100 text-indigo-800', text: 'Validar Pago' },
		're-empacar-china': { color: 'bg-pink-100 text-pink-800', text: 'Re-empacar China' },
		'en-transito': { color: 'bg-blue-100 text-blue-800', text: 'En Tránsito' },
		'almacen-venezuela': { color: 'bg-teal-100 text-teal-800', text: 'Almacén Venezuela' },
		'entregado': { color: 'bg-green-100 text-green-800', text: 'Entregado' }
	};
  
	return statusConfig[estado] || statusConfig['pedido-solicitado'];
};

interface StatusBadgeProps {
	estado: Status;
}

const StatusBadge = ({ estado }: StatusBadgeProps) => {
	const config = getStatusConfig(estado);
	return (
		<span className={`status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
			{config.text}
		</span>
	);
};

export default StatusBadge;
