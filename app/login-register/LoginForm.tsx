"use client";

import React, { useState } from "react";
import { MAX_EMAIL, MAX_PASSWORD } from '@/lib/constants/validation';
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import Lottie from "react-lottie";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  onNavigateToPasswordReset: () => void;
};


export default function LoginForm({ onNavigateToPasswordReset }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginAnim, setLoginAnim] = useState<any | null>(null);
  const [animError, setAnimError] = useState<boolean>(false);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/animations/login.json")
      .then((res) => {
  if (!res.ok) throw new Error(t('auth.common.animationLoadError'));
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setLoginAnim(data);
      })
      .catch(() => {
        if (!cancelled) setAnimError(true);
      });
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

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const validateEmail = (value: string) => {
    // Validación básica de email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMsg("");
    let valid = true;

    // Validar email
    if (!validateEmail(email)) {
  setEmailError(t('auth.common.invalidEmail'));
      valid = false;
    } else {
      setEmailError("");
    }

    // Validar contraseña
    if (!password) {
  setPasswordError(t('auth.common.passwordRequired'));
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Asegurar registro en userlevel sólo si NO existe; no sobrescribir roles existentes
      const userId = data?.user?.id;
      if (userId) {
        try {
          // Verificar si ya existe un userlevel distinto
          const { data: existingLevel, error: existingErr } = await supabase
            .from("userlevel")
            .select("user_level")
            .eq("id", userId)
            .maybeSingle();
          if (existingErr) {
            console.warn("Error consultando userlevel previo:", existingErr.message);
          }
          const alreadyHasLevel = !!(existingLevel?.user_level && existingLevel.user_level.trim() !== "");
          if (!alreadyHasLevel) {
            // Sólo crear si no existía; usar Client como valor por defecto inicial
            const res = await fetch("/api/auth/after-signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, userLevel: "Client" }),
            });
            if (!res.ok) {
              const payload = await res.json().catch(() => ({}));
              console.warn("after-signup error:", payload?.error);
            }
          }
        } catch (e) {
          console.warn("after-signup verificación falló", e);
        }
      }
      // Consultar nivel desde la tabla 'userlevel' usando la id del usuario autenticado
      let normalized = "";
      let levelRaw = "";
      if (userId) {
        const { data: ul, error: ulError } = await supabase
          .from("userlevel")
          .select("user_level")
          .eq("id", userId)
          .maybeSingle();
        if (ulError) {
          console.warn("Error consultando userlevel:", ulError.message);
        }
        if (!ul) {
          console.warn("No se encontró registro en userlevel para el usuario", userId);
        }
        const level = (ul?.user_level ?? "").toString();
        levelRaw = level;
        normalized = level.trim().toLowerCase();
      }

      const isClient = ["cliente", "client"].includes(normalized);
      const isVzla = ["vzla", "venezuela"].includes(normalized);
      const isChina = ["china"].includes(normalized);
      const isAdmin = ["admin", "administrador", "administrator"].includes(normalized);

      if (isClient) {
        window.location.href = "/cliente";
      } else if (isVzla) {
        window.location.href = "/venezuela";
      } else if (isChina) {
        window.location.href = "/china";
      } else if (isAdmin) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/gestion";
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
  setErrorMsg(message || t('auth.login.errorFallback'));
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = (): void => setShowPassword(!showPassword);

  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    onNavigateToPasswordReset?.();
  };

  return (
    <form className="auth-form login-form" onSubmit={handleSubmit}>
      <div className="login-lottie-icon">
        {defaultLoginOptions && !animError && (
          <Lottie options={defaultLoginOptions} height={70} width={70} />
        )}
        {animError && (
          <div style={{ color: 'red', fontSize: 14, textAlign: 'center' }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>{t('auth.common.animationLoadError')}</div>
          </div>
        )}
      </div>
      <h2>{t('auth.login.title')}</h2>
      <label htmlFor="login-email">{t('auth.common.email')}</label>
      <input
        type="email"
        id="login-email"
        placeholder={t('auth.common.emailPlaceholder')}
        value={email}
        maxLength={MAX_EMAIL}
        onChange={(e) => setEmail(e.target.value.slice(0, MAX_EMAIL))}
        required
      />
      {emailError && (
        <p className="text-red-500 text-xs mt-1" role="alert">{emailError}</p>
      )}

    <label htmlFor="login-password">{t('auth.common.password')}</label>
      <div className="password-input-container">
        <input
          type={showPassword ? "text" : "password"}
          id="login-password"
      placeholder={t('auth.common.passwordPlaceholder')}
          value={password}
          maxLength={MAX_PASSWORD}
          onChange={(e) => setPassword(e.target.value.slice(0, MAX_PASSWORD))}
          required
        />
        <span className="password-toggle-icon" onClick={toggleShowPassword}>
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </span>
      </div>
      {passwordError && (
        <p className="text-red-500 text-xs mt-1" role="alert">{passwordError}</p>
      )}

      <a href="#" className="forgot-password-link" onClick={handleForgotPassword}>
        {t('auth.common.forgotPassword')}
      </a>

      {errorMsg && (
        <p className="text-red-500 text-sm mt-2" role="alert">{errorMsg}</p>
      )}
  <button type="submit" disabled={loading || !email || !password}>
        {loading ? t('auth.common.loadingLogin') : t('auth.common.login')}
      </button>
    </form>
  );
}

