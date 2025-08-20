'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  MessageCircle, 
  AlertTriangle,
  RefreshCw,
  Zap,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Trigger entrance animation
    setTimeout(() => setIsAnimating(true), 100);
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-blue-400/30" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className={`
          max-w-2xl w-full text-center
          transform transition-all duration-1000 ease-out
          ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}
        `}>
          {/* Error Code */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                404
              </div>
              <div className="absolute -top-4 -right-4">
                <AlertTriangle className="w-8 h-8 text-red-500 animate-bounce" />
              </div>
            </div>
            {/* Animated Emoji */}
            <div className="mt-4">
              <div className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
                😢
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="mb-8 space-y-4">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              ¡Oops! Página no encontrada
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              La página que buscas no existe o ha sido movida. 
              No te preocupes, te ayudamos a encontrar lo que necesitas.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-12 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleGoBack}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Volver Atrás
              </Button>
              
              <Button
                onClick={handleGoHome}
                className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Ir al Inicio
              </Button>
            </div>

            <Button
              onClick={handleRefresh}
              variant="outline"
              className="group border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-2 rounded-lg transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Recargar Página
            </Button>
          </div>

          {/* Help Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                ¿Necesitas ayuda?
              </h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/soporte">
                <Button
                  variant="ghost"
                  className="group text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Contactar Soporte
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                className="group text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Search className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Buscar en el Sitio
              </Button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="mt-12 flex justify-center space-x-8 opacity-30">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping delay-300"></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping delay-600"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 