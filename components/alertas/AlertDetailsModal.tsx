"use client";

import React from "react";
import { Alert } from "./interfaces/Alerts";
import { getPriorityBadge } from "./utils/badges";
import { getTypeIcon } from "./utils/icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";

interface AlertDetailsModalProps {
  alert: Alert;
  onClose: () => void;
}

const statusIcon = (type: Alert["type"]) => {
  switch (type) {
    case "critical": return <XCircle className="w-5 h-5 text-red-500 mr-1" />;
    case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-500 mr-1" />;
    case "info": return <Info className="w-5 h-5 text-blue-500 mr-1" />;
    default: return null;
  }
};

const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({ alert, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-7 border border-slate-200 animate-slide-up">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-5">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {statusIcon(alert.type)}
            Detalles de la Alerta
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Título y prioridad */}
        <div className="flex items-center gap-3 mb-6">
          {getTypeIcon(alert.type)}
          <h4 className="text-lg font-semibold text-slate-900">{alert.title}</h4>
          {getPriorityBadge(alert.priority)}
        </div>

        {/* Información del pedido */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Información del Pedido</p>
          <div className="bg-slate-50 p-4 rounded-lg flex flex-col sm:flex-row gap-4 text-sm">
            <div><span className="font-semibold text-slate-700">ID:</span> {alert.pedidoId}</div>
            <div><span className="font-semibold text-slate-700">Usuario:</span> {alert.usuario}</div>
          </div>
        </div>

        {/* Detalles de la alerta */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Detalles</p>
          <div className="bg-slate-50 p-4 rounded-lg space-y-1 text-sm">
            <div><span className="font-semibold text-slate-700">Mensaje:</span> {alert.message}</div>
            <div><span className="font-semibold text-slate-700">Categoría:</span> {alert.category}</div>
            <div><span className="font-semibold text-slate-700">Creada:</span> {format(alert.timestamp, 'dd/MM/yyyy HH:mm', { locale: es })}</div>
            <div className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-1" /><span className="font-semibold text-slate-700">Estado:</span> Pendiente</div>
          </div>
        </div>

        {/* Acción recomendada */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Acción Recomendada</p>
          <div className="bg-slate-50 p-4 rounded-lg mt-2 text-sm text-slate-700 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span>{alert.action}</span>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.2s; }
        .animate-slide-up { animation: slideUp 0.3s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AlertDetailsModal;
