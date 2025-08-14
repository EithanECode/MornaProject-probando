"use client";
import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, Package, Download, Filter, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Reportes = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { theme } = useTheme();
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
    <div className={
      `min-h-screen flex overflow-x-hidden transition-colors duration-300 ` +
      (theme === 'dark' ? 'bg-[#18181b]' : 'bg-gray-50')
    }>
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} userRole="admin" />
      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-20 w-[calc(100%-5rem)]'}`}>
        {/* Header estilo configuración */}
        <header className={
          `sticky top-0 z-40 border-b border-slate-200 backdrop-blur-sm transition-colors duration-300 ` +
          (theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80')
        }>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className={
                `text-2xl font-bold ` +
                (theme === 'dark' ? 'text-white' : 'text-slate-900')
              }>Reportes</h1>
              <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>Analiza el rendimiento y métricas de tu operación</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={20} />
              Exportar
            </button>
          </div>
        </header>
        <div className="p-6 flex flex-col gap-8">
          {/* Filtros */}
          <Card className={
            `rounded-lg text-card-foreground shadow-lg border-0 backdrop-blur-sm p-0 mb-6 transition-colors duration-300 ` +
            (theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/70')
          }>
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={20} className="text-gray-600" />
                <CardTitle className={theme === 'dark' ? 'text-card-foreground' : 'text-black'}>Filtros de Reporte</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
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
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="2024-08">Agosto 2024</option>
                    <option value="2024-07">Julio 2024</option>
                    <option value="2024-06">Junio 2024</option>
                  </select>
                </div>
                {/* Filtro de empleado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Empleado</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todos">Todos los empleados</option>
                    <option value="ana">Ana Pérez</option>
                    <option value="carlos">Carlos Ruiz</option>
                    <option value="lucia">Lucía Méndez</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { title: 'Total Pedidos', value: '156', icon: Package, color: 'bg-blue-500', change: '+12%', animation: 'animate-bounce' },
              { title: 'Completados', value: '124', icon: CheckCircle, color: 'bg-green-500', change: '+8%', animation: 'animate-pulse' },
              { title: 'En Proceso', value: '32', icon: Clock, color: 'bg-orange-500', change: '-3%', animation: 'animate-bounce' },
              { title: 'Eficiencia', value: '89%', icon: TrendingUp, color: 'bg-purple-500', change: '+5%', animation: 'animate-pulse' }
            ].map(({ title, value, icon: Icon, color, change, animation }, index) => (
              <div key={index} className={
                `rounded-lg text-card-foreground shadow-lg border-0 backdrop-blur-sm p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 ` +
                (theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/70')
              }>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${color} transform transition-transform hover:scale-110`}>
                    <Icon size={24} className={`text-white ${animation}`} />
                  </div>
                  <span className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {change}
                  </span>
                </div>
                <h3 className={
                  `text-2xl font-bold mb-1 ` +
                  (theme === 'dark' ? 'text-card-foreground' : 'text-black')
                }>{value}</h3>
                <p className={theme === 'dark' ? 'text-card-foreground' : 'text-black'}>{title}</p>
              </div>
            ))}
          </div>
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de barras - Pedidos por mes */}
            <Card className={
              `rounded-lg text-card-foreground shadow-lg border-0 backdrop-blur-sm p-0 transition-colors duration-300 ` +
              (theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/70')
            }>
              <CardHeader className="pb-0">
                <CardTitle className={theme === 'dark' ? 'text-card-foreground' : 'text-black'}>Pedidos por Mes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
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
              </CardContent>
            </Card>
            {/* Gráfico circular - Estados */}
            <Card className={
              `rounded-lg text-card-foreground shadow-lg border-0 backdrop-blur-sm p-0 transition-colors duration-300 ` +
              (theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/70')
            }>
              <CardHeader className="pb-0">
                <CardTitle className={theme === 'dark' ? 'text-card-foreground' : 'text-black'}>Estado de Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
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
              </CardContent>
            </Card>
          </div>
          {/* Tabla de empleados */}
          <Card className={
            `rounded-lg text-white shadow-lg border-0 backdrop-blur-sm p-0 transition-colors duration-300 ` +
            (theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/70')
          }>
            <CardHeader className="pb-0">
              <CardTitle className="text-slate-900 dark:text-white">Rendimiento por Empleado</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Empleado</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Pedidos Asignados</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Completados</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Eficiencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleadosFiltrados.map((empleado, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-blue-900/60 transition-colors">
                        <td className="py-4 px-4 text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users size={16} className="text-blue-600" />
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">{empleado.nombre}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-900 dark:text-white">{empleado.pedidos}</td>
                        <td className="py-4 px-4 text-slate-900 dark:text-white">{empleado.completados}</td>
                        <td className="py-4 px-4 text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${empleado.eficiencia}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{empleado.eficiencia}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
export default Reportes;