"use client";

import React, { useState } from "react";
import Lottie from "react-lottie";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type Props = {
  onNavigateToPasswordReset: () => void;
};

export default function AuthPage({
  onNavigateToPasswordReset,
}: Props): JSX.Element {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [overlayAnimation, setOverlayAnimation] = useState<any | null>(null);

  // Cargar JSON de Lottie desde public en cliente
  React.useEffect(() => {
    let cancelled = false;
    fetch("/animations/wired-flat-497-truck-delivery-loop-cycle.json")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setOverlayAnimation(data);
      })
      .catch(() => {
        // Ignorar errores de carga para no romper la UI
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const defaultOptions = overlayAnimation
    ? {
        loop: true,
        autoplay: true,
        animationData: overlayAnimation,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
        },
      }
    : null;

  const handleToggle = (toLogin: boolean): void => setIsLogin(toLogin);
  const handleLottieClick = (): void => {};

  return (
    <div className="auth-wrapper">
      <div className={`auth-container ${!isLogin ? "right-panel-active" : ""}`}>
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
                {defaultOptions && (
                  <Lottie
                    options={defaultOptions}
                    height={150}
                    width={150}
                    pointerEvents="none"
                    onClick={handleLottieClick}
                  />
                )}
              </div>
              <h2 style={{ fontWeight:"bold", fontSize: "1.5rem" }}>¡Bienvenido de Nuevo!</h2>
              <p>
                Para mantenerte conectado, por favor inicia sesión con tu
                información personal.
              </p>
              <button className="ghost-button" onClick={() => handleToggle(true)}>
                Iniciar Sesión
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <div className="lottie-panel-icon">
                {defaultOptions && (
                  <Lottie
                    options={defaultOptions}
                    height={150}
                    width={150}
                    pointerEvents="none"
                    onClick={handleLottieClick}
                  />
                )}
              </div>
              <h2 style={{ fontWeight: "bold", fontSize: "1.5rem" }}>¡Hola Amigo!</h2>
              <p>Introduce tus datos personales y comienza tu viaje con nosotros.</p>
              <button className="ghost-button" onClick={() => handleToggle(false)}>
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

