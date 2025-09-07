'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle,
  RefreshCw,
  Home,
  MessageCircle,
  Shield,
  Sparkles,
  Zap,
  Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setIsAnimating(true), 100);
  }, []);

  const handleReset = () => {
    reset();
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (!mounted) {
    return null;
  }

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/30 dark:via-orange-900/20 dark:to-yellow-900/20 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <Sparkles className="w-3 h-3 text-red-400/30" />
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
              {/* Critical Error Icon */}
              <div className="mb-8">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                    <AlertTriangle className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-bounce">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent animate-pulse">
                  {t('errors.global.critical')}
                </div>
                {/* Animated Emoji */}
                <div className="mt-4">
                  <div className="text-5xl animate-bounce" style={{ animationDuration: '1.5s' }}>
                    💥
                  </div>
                </div>
              </div>

              {/* Main Message */}
              <div className="mb-8 space-y-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  {t('errors.global.mainTitle')}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  {t('errors.global.mainMessage')}
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <details className="text-left">
                    <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                      {t('errors.global.devDetails')}
                    </summary>
                    <div className="text-xs text-red-700 dark:text-red-300 font-mono bg-red-100 dark:bg-red-900/30 p-3 rounded">
                      <div><strong>Message:</strong> {error.message}</div>
                      {error.digest && <div><strong>Digest:</strong> {error.digest}</div>}
                      <div><strong>Stack:</strong></div>
                      <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                    </div>
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mb-12 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={handleReset}
                    className="group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    {t('errors.global.recover')}
                  </Button>
                  
                  <Button
                    onClick={handleReload}
                    className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <Wifi className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    {t('errors.global.reloadApp')}
                  </Button>
                </div>
              </div>

              {/* Help Section */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                <div className="flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('errors.global.urgentHelp')}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t('errors.global.urgentText')}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="ghost"
                      className="group text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => window.open('mailto:soporte@morna.com?subject=Error Crítico - Urgente', '_blank')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      {t('errors.global.contactSupport')}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="group text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      onClick={() => window.open('https://wa.me/584121234567?text=Error crítico en la aplicación - Necesito ayuda urgente', '_blank')}
                    >
                      <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      {t('errors.global.whatsapp')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-8 flex justify-center space-x-6 opacity-50">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{t('errors.global.statusCritical')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-300"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{t('errors.global.statusNotified')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-600"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{t('errors.global.statusWorking')}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 text-xs text-slate-500 dark:text-slate-400">
                <p>{t('errors.global.errorId')}: {error.digest || 'N/A'} | {t('errors.global.timestamp')}: {new Date().toISOString()}</p>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes float {
              0%, 100% {
                transform: translateY(0px) rotate(0deg);
              }
              50% {
                transform: translateY(-10px) rotate(45deg);
              }
            }
            
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
          `}</style>
        </div>
      </body>
    </html>
  );
} 