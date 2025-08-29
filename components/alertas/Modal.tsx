

'use client';
import React, { useState } from 'react';
import { AlertFormData } from '@/lib/types/Alerts';

interface ModalProps {
  onClose: () => void;
  onCreateAlert: (data: AlertFormData) => void;
}

const Modal: React.FC<ModalProps> = ({ onClose, onCreateAlert }) => {
  const [formData, setFormData] = useState<AlertFormData>({
    type: 'info',
    priority: 'baja',
    title: '',
    message: '',
    category: '',
    action: '',
    pedidoId: '',
    usuario: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAlert(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-medium text-gray-900">Crear Nueva Alerta</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-semibold shadow-sm transition-all duration-150 appearance-none"
              required
            >
              <option value="critical" className="text-red-700 font-bold">Crítica</option>
              <option value="warning" className="text-yellow-700 font-bold">Advertencia</option>
              <option value="info" className="text-blue-700 font-bold">Informativa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prioridad</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-semibold shadow-sm transition-all duration-150 appearance-none"
              required
            >
              <option value="urgente" className="text-red-700 font-bold">Urgente</option>
              <option value="alta" className="text-orange-700 font-bold">Alta</option>
              <option value="media" className="text-yellow-700 font-bold">Media</option>
              <option value="baja" className="text-green-700 font-bold">Baja</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mensaje</label>
            <textarea name="message" value={formData.message} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Acción</label>
            <input type="text" name="action" value={formData.action} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-all shadow-sm"
            >
              Crear Alerta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;