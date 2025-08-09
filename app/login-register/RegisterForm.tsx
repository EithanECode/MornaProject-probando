"use client";

import React, { useEffect, useRef, useState } from "react";
import Lottie from "react-lottie";

export default function RegisterForm(): JSX.Element {
  const [registerAnim, setRegisterAnim] = useState<any | null>(null);
  const [successAnim, setSuccessAnim] = useState<any | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/animations/Register.json").then((r) => r.json()),
      fetch("/animations/Success.json").then((r) => r.json()),
    ])
      .then(([reg, suc]) => {
        if (!cancelled) {
          setRegisterAnim(reg);
          setSuccessAnim(suc);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordMatchError, setPasswordMatchError] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<
    "none" | "low" | "medium" | "strong" | "very-strong"
  >("none");
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const [showFeedbackDiv, setShowFeedbackDiv] = useState<boolean>(false);
  const [animateFeedback, setAnimateFeedback] = useState<boolean>(false);
  const [showMatchErrorDiv, setShowMatchErrorDiv] = useState<boolean>(false);
  const [animateMatchError, setAnimateMatchError] = useState<boolean>(false);
  const [showCheckmark, setShowCheckmark] = useState<boolean>(false);

  const strengthTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const matchErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkmarkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const defaultRegisterOptions = registerAnim
    ? {
        loop: true,
        autoplay: true,
        animationData: registerAnim,
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
      }
    : null;

  const defaultCheckmarkOptions = successAnim
    ? {
        loop: false,
        autoplay: true,
        animationData: successAnim,
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
      }
    : null;

  const getPasswordStrengthInfo = (pwd: string): { text: string; level: typeof passwordStrength } => {
    let strength = 0;
    let text = "";
    let level: typeof passwordStrength = "none";

    if (pwd.length === 0) return { text: "", level: "none" };

    strength = 1;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8 && /[A-Z]/.test(pwd)) strength++;
    if (pwd.length >= 10 && /[0-9]/.test(pwd)) strength++;
    if (pwd.length >= 12 && /[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength === 1) {
      text = "Débil";
      level = "low";
    } else if (strength === 2) {
      text = "Normal";
      level = "medium";
    } else if (strength === 3) {
      text = "Fuerte";
      level = "strong";
    } else if (strength >= 4) {
      text = "Muy Fuerte";
      level = "very-strong";
    }

    return { text, level };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const { level } = getPasswordStrengthInfo(newPassword);
    setPasswordStrength(level);

    if (confirmPassword.length > 0) {
      setPasswordMatchError(newPassword !== confirmPassword);
    } else {
      setPasswordMatchError(false);
    }
  };

  const handlePasswordFocus = (): void => setIsPasswordFocused(true);
  const handlePasswordBlur = (): void => setIsPasswordFocused(false);

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    const doMatch = password === newConfirmPassword && newConfirmPassword.length > 0;
    setPasswordMatchError(!doMatch);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      return;
    }
    if (passwordStrength !== "very-strong") {
      alert('La contraseña debe ser "Muy Fuerte" para registrarse.');
      return;
    }
    setPasswordMatchError(false);
    try {
      alert("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.");
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Ocurrió un error inesperado: " + message);
    }
  };

  const toggleShowPassword = (): void => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = (): void => setShowConfirmPassword(!showConfirmPassword);

  const currentStrengthInfo = getPasswordStrengthInfo(password);

  useEffect(() => {
    return () => {
      if (strengthTimeoutRef.current) clearTimeout(strengthTimeoutRef.current);
      if (matchErrorTimeoutRef.current) clearTimeout(matchErrorTimeoutRef.current);
      if (checkmarkTimeoutRef.current) clearTimeout(checkmarkTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const shouldShowStrengthFeedback = password.length > 0 && isPasswordFocused;
    if (shouldShowStrengthFeedback) {
      setShowFeedbackDiv(true);
      if (strengthTimeoutRef.current) clearTimeout(strengthTimeoutRef.current);
      strengthTimeoutRef.current = setTimeout(() => setAnimateFeedback(true), 50);
    } else {
      setAnimateFeedback(false);
      if (strengthTimeoutRef.current) clearTimeout(strengthTimeoutRef.current);
      strengthTimeoutRef.current = setTimeout(() => setShowFeedbackDiv(false), 300);
    }
  }, [password.length, isPasswordFocused]);

  useEffect(() => {
    if (passwordMatchError) {
      setShowMatchErrorDiv(true);
      if (matchErrorTimeoutRef.current) clearTimeout(matchErrorTimeoutRef.current);
      matchErrorTimeoutRef.current = setTimeout(() => setAnimateMatchError(true), 50);
    } else {
      setAnimateMatchError(false);
      if (matchErrorTimeoutRef.current) clearTimeout(matchErrorTimeoutRef.current);
      matchErrorTimeoutRef.current = setTimeout(() => setShowMatchErrorDiv(false), 300);
    }
  }, [passwordMatchError]);

  useEffect(() => {
    const shouldShowCheckmark = !passwordMatchError && confirmPassword.length > 0;
    if (shouldShowCheckmark) {
      setShowCheckmark(true);
      if (checkmarkTimeoutRef.current) clearTimeout(checkmarkTimeoutRef.current);
      checkmarkTimeoutRef.current = setTimeout(() => {}, 50);
    } else {
      if (checkmarkTimeoutRef.current) clearTimeout(checkmarkTimeoutRef.current);
      checkmarkTimeoutRef.current = setTimeout(() => setShowCheckmark(false), 0);
    }
  }, [passwordMatchError, confirmPassword.length]);

  return (
    <form className="auth-form register-form" onSubmit={handleSubmit}>
      <div className="register-lottie-icon">
        {defaultRegisterOptions && (
          <Lottie options={defaultRegisterOptions} height={70} width={70} />
        )}
      </div>
      <h2>Registrarse</h2>

      <label htmlFor="register-fullname">Nombre completo</label>
      <input
        type="text"
        id="register-fullname"
        placeholder="Tu nombre"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <label htmlFor="register-email">Correo electrónico</label>
      <input
        type="email"
        id="register-email"
        placeholder="usuario@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="register-password">Contraseña</label>
      <div className="password-input-container">
        <input
          type={showPassword ? "text" : "password"}
          id="register-password"
          placeholder="********"
          value={password}
          onChange={handlePasswordChange}
          onFocus={handlePasswordFocus}
          onBlur={handlePasswordBlur}
          required
          className={`password-input ${
            currentStrengthInfo.level !== "none"
              ? `password-strength-border-${currentStrengthInfo.level}`
              : ""
          }`}
        />
        <span className="password-toggle-icon" onClick={toggleShowPassword}>
          <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
        </span>
        {showFeedbackDiv && (
          <div className={`password-strength-feedback ${animateFeedback ? "active" : ""}`}>
            <div
              className={`password-strength-text password-strength-text-${currentStrengthInfo.level}`}
            >
              {currentStrengthInfo.text}
            </div>
            <div className="password-strength-bar-container">
              <div
                className={`password-strength-bar password-strength-bar-${currentStrengthInfo.level}`}
              ></div>
            </div>
          </div>
        )}
      </div>

      <label htmlFor="register-confirm-password">Confirmar Contraseña</label>
      <div className="password-input-container">
        <input
          type={showConfirmPassword ? "text" : "password"}
          id="register-confirm-password"
          placeholder="********"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
        />
        <span
          className={`password-toggle-icon ${showCheckmark ? "hidden" : ""}`}
          onClick={toggleShowConfirmPassword}
        >
          <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
        </span>
        {showMatchErrorDiv && (
          <p className={`password-error-message ${animateMatchError ? "active" : ""}`}>
            Las contraseñas no coinciden.
          </p>
        )}
        {showCheckmark && defaultCheckmarkOptions && (
          <div className="checkmark-icon-container">
            <Lottie options={defaultCheckmarkOptions} height={25} width={25} />
          </div>
        )}
      </div>

      <button type="submit">Crear cuenta</button>
    </form>
  );
}

