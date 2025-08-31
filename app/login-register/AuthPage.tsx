"use client";

import React, { useState } from "react";
import Lottie from "react-lottie";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useOptimizedLottie } from "@/hooks/useOptimizedLottie";

type Props = {
  onNavigateToPasswordReset: () => void;
};

export default function AuthPage({
  onNavigateToPasswordReset,
}: Props) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isReturningFromPasswordReset, setIsReturningFromPasswordReset] = useState<boolean>(false);

  // Usar el hook optimizado para cargar la animación
  const { animationData: defaultOptions, isLoading, hasError } = useOptimizedLottie({
    animationPath: "/animations/wired-flat-497-truck-delivery-loop-cycle.json",
    timeout: 3000 // Timeout más corto para mejor UX
  });

  const handleToggle = (toLogin: boolean): void => {
    if (isAnimating) return; // Prevenir múltiples clics durante la animación
    
    setIsAnimating(true);
    setIsLogin(toLogin);
    
    // Resetear el estado de animación después de que termine
    setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Duración de la animación
  };

  // Efecto para detectar cuando regresa de PasswordReset
  React.useEffect(() => {
    // Verificar si venimos de PasswordReset (por ejemplo, por URL o estado)
    const isFromPasswordReset = window.location.search.includes('from=password-reset') || 
                               sessionStorage.getItem('fromPasswordReset') === 'true';
    
    if (isFromPasswordReset) {
      setIsReturningFromPasswordReset(true);
      sessionStorage.removeItem('fromPasswordReset'); // Limpiar el flag
      
      // Resetear el estado después de la animación
      setTimeout(() => {
        setIsReturningFromPasswordReset(false);
      }, 500);
    }
  }, []);

  const handleLottieClick = (): void => {};

  // Componente de fallback para cuando la animación no carga
  const AnimationFallback = () => (
    <div className="lottie-fallback">
      <div className="fallback-icon">🚚</div>
    </div>
  );

  // Componente de loading
  const LoadingSpinner = () => (
    <div className="lottie-placeholder">
      <div className="loading-spinner"></div>
    </div>
  );

  // Componente de animación optimizado
  const OptimizedLottie = ({ height, width }: { height: number; width: number }) => {
    if (hasError) {
      return <AnimationFallback />;
    }

    if (isLoading || !defaultOptions) {
      return <LoadingSpinner />;
    }

    return (
      <Lottie
        options={defaultOptions}
        height={height}
        width={width}
        pointerEvents="none"
        onClick={handleLottieClick}
      />
    );
  };

  return (
    <div className="auth-wrapper">
      {/* Mobile/Tablet Tabs Navigation */}
      <div className="auth-tabs">
        <button 
          className={`auth-tab ${isLogin ? 'active' : ''}`}
          onClick={() => handleToggle(true)}
        >
          Iniciar Sesión
        </button>
        <button 
          className={`auth-tab ${!isLogin ? 'active' : ''}`}
          onClick={() => handleToggle(false)}
        >
          Registrarse
        </button>
      </div>

      {/* Desktop Sliding Panel */}
      <div className={`auth-container ${!isLogin ? "right-panel-active" : ""} ${isReturningFromPasswordReset ? 'returning-from-password-reset' : ''}`}>
        <div className="form-container sign-up-container">
          <RegisterForm />
        </div>

        <div className="form-container sign-in-container">
          <LoginForm onNavigateToPasswordReset={onNavigateToPasswordReset} />
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div className="lottie-panel-icon">
                <OptimizedLottie height={120} width={120} />
              </div>
              <h2 style={{ fontWeight:"bold", fontSize: "1.25rem" }}>¡Bienvenido de Nuevo!</h2>
              <p className="text-sm">
                Para mantenerte conectado, por favor inicia sesión con tu
                información personal.
              </p>
              <button className="ghost-button" onClick={() => handleToggle(true)}>
                Iniciar Sesión
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <div className="lottie-panel-icon">
                <OptimizedLottie height={120} width={120} />
              </div>
              <h2 style={{ fontWeight: "bold", fontSize: "1.25rem" }}>¡Hola Amigo!</h2>
              <p className="text-sm">Introduce tus datos personales y comienza tu viaje con nosotros.</p>
              <button className="ghost-button" onClick={() => handleToggle(false)}>
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Forms */}
      <div className="auth-mobile-forms">
        <div className={`mobile-form-container ${isLogin ? 'active' : ''} ${isAnimating ? 'animating' : ''} ${isReturningFromPasswordReset ? 'returning-from-password-reset' : ''}`}>
          {isLogin ? (
            <div className="mobile-form">
              <div className="mobile-form-header">
                <div className="lottie-mobile-icon">
                  <OptimizedLottie height={80} width={80} />
                </div>
                <h2>¡Bienvenido de Nuevo!</h2>
                <p>Para mantenerte conectado, por favor inicia sesión con tu información personal.</p>
              </div>
              <LoginForm onNavigateToPasswordReset={onNavigateToPasswordReset} />
            </div>
          ) : (
            <div className="mobile-form">
              <div className="mobile-form-header">
                <div className="lottie-mobile-icon">
                  <OptimizedLottie height={80} width={80} />
                </div>
                <h2>¡Hola Amigo!</h2>
                <p>Introduce tus datos personales y comienza tu viaje con nosotros.</p>
              </div>
              <RegisterForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

