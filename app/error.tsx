'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  ArrowLeft, 
  RefreshCw, 
  MessageCircle, 
  AlertTriangle,
  Zap,
  Sparkles,
  Bug,
  Shield,
  Wifi,
  Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorType, setErrorType] = useState<'network' | 'server' | 'client' | 'unknown'>('unknown');
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setIsAnimating(true), 100);

    // Determine error type based on error message
    const errorMessage = error.message.toLowerCase();
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      setErrorType('network');
    } else if (errorMessage.includes('server') || errorMessage.includes('500')) {
      setErrorType('server');
    } else if (errorMessage.includes('client') || errorMessage.includes('400')) {
      setErrorType('client');
    }
  }, [error]);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleReset = () => {
    reset();
  };

  const getErrorInfo = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: <Wifi className="w-8 h-8 text-orange-500 animate-pulse" />,
          title: t('errors.boundary.networkTitle'),
          message: t('errors.boundary.networkMessage'),
          color: 'from-orange-500 to-red-500'
        };
      case 'server':
        return {
          icon: <Server className="w-8 h-8 text-red-500 animate-pulse" />,
          title: t('errors.boundary.serverTitle'),
          message: t('errors.boundary.serverMessage'),
          color: 'from-red-500 to-pink-500'
        };
      case 'client':
        return {
          icon: <Bug className="w-8 h-8 text-yellow-500 animate-pulse" />,
          title: t('errors.boundary.clientTitle'),
          message: t('errors.boundary.clientMessage'),
          color: 'from-yellow-500 to-orange-500'
        };
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-purple-500 animate-pulse" />,
          title: t('errors.boundary.unexpectedTitle'),
          message: t('errors.boundary.unexpectedMessage'),
          color: 'from-purple-500 to-indigo-500'
        };
    }
  };

  const errorInfo = getErrorInfo();

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-red-900/20 dark:to-orange-900/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <Sparkles className="w-3 h-3 text-red-400/40" />
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
          {/* Error Icon and Code */}
          <div className="mb-8">
            <div className="relative inline-block mb-4">
              {errorInfo.icon}
            </div>
            <div className="text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent animate-pulse">
              {t('errors.boundary.generic')}
            </div>
            {/* Animated Emoji */}
            <div className="mt-4">
              <div className="text-5xl animate-bounce" style={{ animationDuration: '2.5s' }}>
                😵
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="mb-8 space-y-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {errorInfo.title}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              {errorInfo.message}
            </p>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <details className="text-left">
                <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  {t('errors.boundary.devDetails')}
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
                {t('errors.boundary.tryAgain')}
              </Button>
              
              <Button
                onClick={handleGoBack}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                {t('errors.actions.goBack')}
              </Button>
            </div>

            <Button
              onClick={handleGoHome}
              variant="outline"
              className="group border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-2 rounded-lg transition-all duration-300"
            >
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              {t('errors.actions.goHome')}
            </Button>
          </div>

          {/* Help Section */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('notFound.needHelp')}
              </h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/soporte">
                <Button
                  variant="ghost"
                  className="group text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  {t('errors.actions.contactSupport')}
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                className="group text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                {t('errors.boundary.report')}
              </Button>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mt-8 flex justify-center space-x-6 opacity-50">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">{t('errors.boundary.statusDetected')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-300"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">{t('errors.boundary.statusNotified')}</span>
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
            transform: translateY(-15px) rotate(90deg);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 