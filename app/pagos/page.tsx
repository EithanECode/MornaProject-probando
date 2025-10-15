"use client";

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { usePagosStats } from '@/hooks/use-pagos-stats';
import { RefreshCcw, TrendingUp, CheckCircle2, Clock, DollarSign, FileText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotifications } from '@/hooks/use-notifications';

export default function PagosDashboardPage() {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { pending, completed, totalAmount, loading, error, refresh } = usePagosStats();
  const { t } = useTranslation();

  // Notificaciones para rol Pagos (igual que en /pagos/validacion-pagos)
  const { uiItems: pagosNotifItems, unreadCount: pagosUnread, markAllAsRead: markAllPagosRead, markOneAsRead: markPagosOneRead } = useNotifications({ role: 'pagos', limit: 20, enabled: true });

  const totalProcesados = pending + completed; // pedidos en pipeline de pagos
  const porcentajeConfirmados = totalProcesados > 0 ? (completed / totalProcesados) * 100 : 0;

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar 
        isExpanded={sidebarExpanded}
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        userRole="pagos"
      />
      <main className={`transition-all duration-300 flex-1 ${sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'}`}> 
        <Header 
          notifications={pagosUnread}
          notificationsItems={pagosNotifItems.filter(n => n.unread)}
          onMarkAllAsRead={markAllPagosRead}
          onItemClick={(id) => markPagosOneRead(id)}
          notificationsRole="pagos"
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={t('paymentsDashboard.title')}
          subtitle={t('paymentsDashboard.subtitle')}
        />
        <div className="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-6 lg:space-y-8">
          {/* Hero */}
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-orange-500 rounded-xl p-4 md:p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">{t('paymentsDashboard.hero.title')}</h2>
                <p className="text-blue-100 text-sm md:text-base lg:text-lg">{t('paymentsDashboard.hero.desc1')}</p>
                <p className="text-blue-200 mt-2 text-xs md:text-sm">{t('paymentsDashboard.hero.desc2')}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold">{pending}</div>
                  <p className="text-blue-100 text-xs md:text-sm">{t('paymentsDashboard.stats.pending.label')}</p>
                </div>
                <div className="text-center hidden md:block">
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold">{completed}</div>
                  <p className="text-blue-100 text-xs md:text-sm">{t('paymentsDashboard.stats.completed.label')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          {error && (
            <div className="text-sm text-red-600 bg-red-100 border border-red-300 rounded-md px-3 py-2">{error}</div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
            <Card className="bg-blue-50 border-blue-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-blue-800 flex items-center gap-1"><Clock className="h-3 w-3" /> {t('paymentsDashboard.stats.pending.label')}</CardTitle>
                <div className="p-1 md:p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform"><Clock className="h-3 w-3 md:h-4 md:w-4 text-white" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900">{loading ? '—' : pending}</div>
                <p className="text-xs text-blue-700">{t('paymentsDashboard.stats.pending.help')}</p>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(pending / Math.max(totalProcesados, 1)) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-emerald-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-emerald-800 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {t('paymentsDashboard.stats.completed.label')}</CardTitle>
                <div className="p-1 md:p-2 bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform"><CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-white" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-900">{loading ? '—' : completed}</div>
                <p className="text-xs text-emerald-700">{t('paymentsDashboard.stats.completed.help')}</p>
                <div className="mt-2 w-full bg-emerald-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${porcentajeConfirmados}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-amber-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-amber-800 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {t('paymentsDashboard.stats.totalAmount.label')}</CardTitle>
                <div className="p-1 md:p-2 bg-amber-500 rounded-lg group-hover:scale-110 transition-transform"><TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-white" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-amber-900">{loading ? '—' : <PriceDisplay amount={totalAmount} currency="USD" variant="inline" size="md" />}</div>
                <p className="text-xs text-amber-700">{t('paymentsDashboard.stats.totalAmount.help')}</p>
                <div className="mt-2 w-full bg-amber-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(100, totalAmount / 10000 * 100)}%` }} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acciones rápidas */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-blue-600" /> {t('paymentsDashboard.quickActions.title')}</CardTitle>
              <p className="text-xs md:text-sm text-slate-600">{t('paymentsDashboard.quickActions.subtitle')}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 lg:gap-6">
                <Link href="/pagos/validacion-pagos" className="col-span-2 md:col-span-1">
                  <Button variant="outline" className="h-16 md:h-20 lg:h-24 w-full flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group">
                    <div className="p-2 md:p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-blue-600" />
                    </div>
                    <span className="text-xs md:text-sm font-medium">{t('paymentsDashboard.quickActions.validate')}</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
