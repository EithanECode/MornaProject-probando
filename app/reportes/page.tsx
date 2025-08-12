"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, Package, Download, Filter, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Reportes = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeFilter, setActiveFilter] = useState('mes');
  const [selectedMonth, setSelectedMonth] = useState('2024-08');
  const [selectedEmployee, setSelectedEmployee] = useState('todos');

  // Datos de ejemplo para los gráficos
  const pedidosPorMes = [
    { mes: 'Ene', total: 45, pendientes: 12, entregados: 33 },
    { mes: 'Feb', total: 52, pendientes: 8, entregados: 44 },
    { mes: 'Mar', total: 38, pendientes: 15, entregados: 23 },
    { mes: 'Abr', total: 61, pendientes: 18, entregados: 43 },
    { mes: 'May', total: 55, pendientes: 22, entregados: 33 },
    { mes: 'Jun', total: 67, pendientes: 14, entregados: 53 }
  ];

  const estadosPedidos = [
    { name: 'Entregados', value: 45, color: '#22c55e' },
    { name: 'En Tránsito', value: 25, color: '#a855f7' },
    { name: 'Pendientes', value: 30, color: '#f97316' }
  ];

  const empleadosData = [
    { nombre: 'Ana Pérez', pedidos: 23, completados: 20, eficiencia: 87 },
    { nombre: 'Carlos Ruiz', pedidos: 18, completados: 15, eficiencia: 83 },
    { nombre: 'Lucía Méndez', pedidos: 31, completados: 28, eficiencia: 90 },
    { nombre: 'Juan Rodríguez', pedidos: 26, completados: 22, eficiencia: 85 }
  ];

  // Filtrar empleados según el filtro seleccionado
  const empleadosFiltrados = selectedEmployee === 'todos'
    ? empleadosData
    : empleadosData.filter(e => {
        if (selectedEmployee === 'ana') return e.nombre === 'Ana Pérez';
        if (selectedEmployee === 'carlos') return e.nombre === 'Carlos Ruiz';
        if (selectedEmployee === 'lucia') return e.nombre === 'Lucía Méndez';
        return true;
      });

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} />
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-20 w-[calc(100%-5rem)]'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes</h1>
                <p className="text-gray-600">Analiza el rendimiento y métricas de tu operación</p>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Download size={20} />
                Exportar
              </button>
            </div>
            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filtros de Reporte</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reporte</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'mes', label: 'Por Mes', icon: Calendar },
                      { key: 'empleado', label: 'Por Empleado', icon: Users },
                      { key: 'estado', label: 'Por Pedido', icon: Package }
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveFilter(key)}
                        className={`flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all transform hover:scale-105 flex-shrink-0 ${
                          activeFilter === key
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon size={14} />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Filtro de fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                  <Select onValueChange={(value) => setSelectedMonth(value)} defaultValue="2024-08">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar mes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-08">Agosto 2024</SelectItem>
                      <SelectItem value="2024-07">Julio 2024</SelectItem>
                      <SelectItem value="2024-06">Junio 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Filtro de empleado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Empleado</label>
                  <Select onValueChange={(value) => setSelectedEmployee(value)} defaultValue="todos">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los empleados</SelectItem>
                      <SelectItem value="ana">Ana Pérez</SelectItem>
                      <SelectItem value="carlos">Carlos Ruiz</SelectItem>
                      <SelectItem value="lucia">Lucía Méndez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { title: 'Total Pedidos', value: '156', icon: Package, color: 'bg-blue-500', change: '+12%', animation: 'animate-bounce' },
              { title: 'Completados', value: '124', icon: CheckCircle, color: 'bg-green-500', change: '+8%', animation: 'animate-pulse' },
              { title: 'En Proceso', value: '32', icon: Clock, color: 'bg-orange-500', change: '-3%', animation: 'animate-bounce' },
              { title: 'Eficiencia', value: '89%', icon: TrendingUp, color: 'bg-purple-500', change: '+5%', animation: 'animate-pulse' }
            ].map(({ title, value, icon: Icon, color, change, animation }, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${color} transform transition-transform hover:scale-110`}>
                    <Icon size={24} className={`text-white ${animation}`} />
                  </div>
                  <span className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className="text-gray-600 text-sm">{title}</p>
              </div>
            ))}
          </div>
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de barras - Pedidos por mes */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos por Mes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pedidosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="entregados" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pendientes" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Gráfico circular - Estados */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Pedidos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={estadosPedidos}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {estadosPedidos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {estadosPedidos.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Tabla de empleados */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Empleado</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Empleado</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Pedidos Asignados</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Completados</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Eficiencia</th>
                  </tr>
                </thead>
                <tbody>
                  {empleadosFiltrados.map((empleado, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users size={16} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{empleado.nombre}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{empleado.pedidos}</td>
                      <td className="py-4 px-4 text-gray-700">{empleado.completados}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${empleado.eficiencia}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{empleado.eficiencia}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reportes;
