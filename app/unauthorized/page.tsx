'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  ArrowLeft, 
  Lock, 
  Shield, 
  AlertTriangle,
  RefreshCw,
  Zap,
  Sparkles,
  User,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Unauthorized() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setIsAnimating(true), 100);
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/login-register');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
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
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-purple-400/30" />
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
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <Lock className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
              403
            </div>
            {/* Animated Emoji */}
            <div className="mt-4">
              <div className="text-5xl animate-bounce" style={{ animationDuration: '2s' }}>
                🚫
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="mb-8 space-y-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Acceso Denegado
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              No tienes permisos para acceder a esta página. 
              Verifica tus credenciales o contacta al administrador.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-12 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleLogin}
                className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <Key className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Iniciar Sesión
              </Button>
              
              <Button
                onClick={handleGoBack}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Volver Atrás
              </Button>
            </div>

            <Button
              onClick={handleGoHome}
              variant="outline"
              className="group border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-2 rounded-lg transition-all duration-300"
            >
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Ir al Inicio
            </Button>
          </div>

          {/* Help Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                ¿Necesitas ayuda?
              </h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Si crees que deberías tener acceso a esta página, contacta a nuestro equipo de soporte.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/soporte">
                  <Button
                    variant="ghost"
                    className="group text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Contactar Soporte
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  className="group text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Solicitar Acceso
                </Button>
              </div>
            </div>
          </div>

          {/* Security Tips */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
            <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">
              💡 Consejos de Seguridad
            </h4>
            <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1 text-left">
              <li>• Verifica que estés usando la cuenta correcta</li>
              <li>• Asegúrate de tener los permisos necesarios</li>
              <li>• Contacta al administrador si necesitas acceso</li>
            </ul>
          </div>

          {/* Status Indicators */}
          <div className="mt-8 flex justify-center space-x-6 opacity-50">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">Acceso Denegado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-300"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">Verificación Requerida</span>
            </div>
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