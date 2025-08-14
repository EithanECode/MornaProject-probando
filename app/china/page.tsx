"use client";
import "../animations/animations.css";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  FileText,
  Flag,
} from "lucide-react";

export default function ChinaDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Estadísticas específicas para China
  const stats = {
    pendingOrders: 23,
    processingOrders: 15,
    shippedOrders: 8,
    totalProducts: 156,
    averageProcessingTime: "2.3 días",
    warehouseCapacity: "85%",
  };

  const recentOrders = [
    {
      id: "PED-001",
      product: "iPhone 15 Pro",
      quantity: 2,
      status: "pending",
      client: "María González",
      priority: "high",
      time: "2 horas",
    },
    {
      id: "PED-002",
      product: "MacBook Air M2",
      quantity: 1,
      status: "processing",
      client: "Carlos Pérez",
      priority: "medium",
      time: "1 día",
    },
    {
      id: "PED-003",
      product: "AirPods Pro",
      quantity: 3,
      status: "shipped",
      client: "Ana Rodríguez",
      priority: "low",
      time: "3 días",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className={`min-h-screen flex overflow-x-hidden ${
        mounted && theme === "dark"
          ? "bg-slate-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      }`}
    >
      <Sidebar
        isExpanded={sidebarExpanded}
        setIsExpanded={setSidebarExpanded}
        userRole="china"
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarExpanded
            ? "ml-72 w-[calc(100%-18rem)]"
            : "ml-20 w-[calc(100%-5rem)]"
        }`}
      >
        <Header
          notifications={stats.pendingOrders}
          onMenuToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />

        <div className="p-6 space-y-6">
          {/* Header del Dashboard */}
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-3xl font-bold ${
                  mounted && theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                Panel de China
              </h1>
              <p
                className={`text-sm ${
                  mounted && theme === "dark"
                    ? "text-slate-300"
                    : "text-slate-600"
                }`}
              >
                Gestión de pedidos al detal y logística
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Empleado China
            </Badge>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow p-6 card-animate-liftbounce">
              <CardHeader className="flex flex-row items-center justify-center gap-x-3 space-y-0 pb-2">
                <Clock className="h-7 w-7 text-yellow-300" />
                <CardTitle className="text-xl font-bold text-white">
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center">
                <div className="text-2xl font-bold text-white">
                  {stats.pendingOrders}
                </div>
              </CardContent>
            </Card>

            <Card className=" bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg shadow p-6 card-animate-liftbounce">
              <CardHeader className="flex flex-row items-center justify-center gap-x-3 space-y-0 pb-2">
                <Package className="h-7 w-7 text-blue-300" />
                <CardTitle className="text-xl font-bold text-white">
                  En Procesamiento
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center ">
                <div className="text-2xl font-bold text-white">
                  {stats.processingOrders}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg shadow p-6 card-animate-liftbounce">
              <CardHeader className="flex flex-row items-center justify-center gap-x-3 space-y-0 pb-2">
                <Truck className="h-7 w-7 text-green-300" />
                <CardTitle className="text-xl font-bold text-white">
                  Enviados
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center ">
                <div className="text-2xl text-white font-bold">
                  {stats.shippedOrders}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-700 rounded-lg shadow p-6 card-animate-liftbounce">
              <CardHeader className="flex flex-row items-center justify-center gap-x-3 space-y-0 pb-2">
                <ShoppingCart className="h-7 w-7 text-yellow-300" />
                <CardTitle className="text-xl font-bold text-white">
                  Totales
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center">
                <div className="text-2xl text-white font-bold">
                  {stats.totalProducts}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acciones Rápidas */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover:bg-slate-800 hover:text-white"
                >
                  <Package className="h-6 w-6" />
                  <span className="text-sm">Nuevo Pedido</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover:bg-slate-800 hover:text-white"
                >
                  <Truck className="h-6 w-6" />
                  <span className="text-sm">Preparar Envío</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover:bg-slate-800 hover:text-white"
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Documentos</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover:bg-slate-800 hover:text-white"
                >
                  <MapPin className="h-6 w-6" />
                  <span className="text-sm">Tracking</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pedidos Recientes */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle>Pedidos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <p className="font-lg text-sm">{order.id}</p>
                        <p className="text-xs text-slate-600">
                          {order.product}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{order.client}</p>
                        <p className="text-xs text-slate-600">
                          Cantidad: {order.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status === "pending" && "Pendiente"}
                        {order.status === "processing" && "Procesando"}
                        {order.status === "shipped" && "Enviado"}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority === "high" && "Alta"}
                        {order.priority === "medium" && "Media"}
                        {order.priority === "low" && "Baja"}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {order.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Información del Almacén */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle>Información del Almacén</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Capacidad utilizada</span>
                    <span className="font-medium">
                      {stats.warehouseCapacity}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      Tiempo promedio de procesamiento
                    </span>
                    <span className="font-medium">
                      {stats.averageProcessingTime}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle>Próximas Acciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">
                      3 pedidos requieren atención urgente
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">8 pedidos listos para envío</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Pagos confirmados: $2,450</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
