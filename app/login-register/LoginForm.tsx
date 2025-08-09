"use client";

import React, { useState } from "react";
import Lottie from "react-lottie";

type Props = {
  onNavigateToPasswordReset: () => void;
};

export default function LoginForm({ onNavigateToPasswordReset }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginAnim, setLoginAnim] = useState<any | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/animations/login.json")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setLoginAnim(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const defaultLoginOptions = loginAnim
    ? {
        loop: true,
        autoplay: true,
        animationData: loginAnim,
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
      }
    : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // TODO: Lógica de autenticación
    console.log("Login Data:", { email, password });
  };

  const toggleShowPassword = (): void => setShowPassword(!showPassword);

  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    onNavigateToPasswordReset?.();
  };

  return (
    <form className="auth-form login-form" onSubmit={handleSubmit}>
      <div className="login-lottie-icon">
        {defaultLoginOptions && <Lottie options={defaultLoginOptions} height={70} width={70} />}
      </div>
      <h2>Iniciar Sesión</h2>
      <label htmlFor="login-email">Correo electrónico</label>
      <input
        type="email"
        id="login-email"
        placeholder="usuario@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="login-password">Contraseña</label>
      <div className="password-input-container">
        <input
          type={showPassword ? "text" : "password"}
          id="login-password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span className="password-toggle-icon" onClick={toggleShowPassword}>
          <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
        </span>
      </div>

      <a href="#" className="forgot-password-link" onClick={handleForgotPassword}>
        ¿Olvidaste tu contraseña?
      </a>

      <button type="submit">Iniciar Sesión</button>
    </form>
  );
}

