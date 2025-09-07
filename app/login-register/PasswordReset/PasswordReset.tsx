"use client";

import React, { useState } from "react";
import FormPanel from "./FormPanel";
import AnimatedPanel from "@/components/auth/AnimatedPanel";
import { STEPS, CONTACT_METHODS } from "@/lib/constants/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import ResetLinkSentModal from "@/components/ui/ResetLinkSentModal";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  onNavigateToAuth: () => void;
  initialStep?: number; // Permite forzar el paso inicial (ej: recuperación desde email)
};

export default function PasswordReset({ onNavigateToAuth, initialStep }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState<number>(initialStep ?? STEPS.CONTACT_METHOD);
  const [contactMethod, setContactMethod] = useState<string>(CONTACT_METHODS.EMAIL);
  const [contactValue, setContactValue] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanding, setIsExpanding] = useState<boolean>(true);
  const [showLinkSent, setShowLinkSent] = useState<boolean>(false);

  const handleSendCode = async (): Promise<void> => {
    if (!contactValue) return;
    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(contactValue, {
        // Redirige a la página dedicada para restablecer contraseña
        redirectTo: process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/login-register/reset`
          : undefined,
      });
      if (error) throw error;
      // Mostrar modal de enlace enviado
      setShowLinkSent(true);
    } catch (err) {
      // Podríamos integrar toast; por ahora silencioso para no romper UI
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = (): void => {
    // Flujo de Supabase usa link mágico; no se usa código numérico aquí.
    setStep(STEPS.NEW_PASSWORD);
  };

  const handleResetPassword = async (): Promise<void> => {
    if (newPassword !== confirmPassword) {
  alert(t('auth.passwordReset.passwordsNoMatchAlert'));
      return;
    }

    const getPasswordStrengthLevel = (pwd: string):
      | "none"
      | "low"
      | "medium"
      | "strong"
      | "very-strong" => {
      let strength = 0;
      if (pwd.length === 0) return "none";
      strength = 1;
      if (pwd.length >= 6) strength++;
      if (pwd.length >= 8 && /[A-Z]/.test(pwd)) strength++;
      if (pwd.length >= 10 && /[0-9]/.test(pwd)) strength++;
      if (pwd.length >= 12 && /[^A-Za-z0-9]/.test(pwd)) strength++;
      if (strength === 1) return "low";
      if (strength === 2) return "medium";
      if (strength === 3) return "strong";
      if (strength >= 4) return "very-strong";
      return "none";
    };

    const passwordStrength = getPasswordStrengthLevel(newPassword);
    if (passwordStrength === "low" || passwordStrength === "none") {
  alert(t('auth.common.passwordMustBeVeryStrong'));
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
  alert(t('auth.passwordReset.resetSuccess'));
      setStep(STEPS.CONTACT_METHOD);
      setContactValue("");
      setVerificationCode(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      // Marcar que regresamos de PasswordReset
      sessionStorage.setItem('fromPasswordReset', 'true');
      onNavigateToAuth?.();
    } catch (err) {
  alert(t('auth.passwordReset.resetError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeInput = (index: number, value: string): void => {
    if (value.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const handleResendCode = (): void => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Efecto para manejar la animación de entrada
  React.useEffect(() => {
    // La animación se ejecuta al montar el componente
    const timer = setTimeout(() => {
      setIsExpanding(false);
    }, 500); // Duración de la animación

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`main-card ${isExpanding ? 'expanding' : ''}`}>
      <div className="panels-container">
        <FormPanel
          step={step}
          setStep={setStep}
          contactMethod={contactMethod}
          setContactMethod={setContactMethod}
          contactValue={contactValue}
          setContactValue={setContactValue}
          verificationCode={verificationCode}
          handleCodeInput={handleCodeInput}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          isLoading={isLoading}
          onSendCode={handleSendCode}
          onVerifyCode={handleVerifyCode}
          onResetPassword={handleResetPassword}
          onResendCode={handleResendCode}
          onNavigateToAuth={onNavigateToAuth}
        />
        <AnimatedPanel />
      </div>
      <ResetLinkSentModal
        email={contactValue}
        open={showLinkSent}
        onClose={() => setShowLinkSent(false)}
        onResend={async () => {
          // reutiliza handleSendCode pero sin cerrar modal
          if (!contactValue) return;
          const supabase = getSupabaseBrowserClient();
          await supabase.auth.resetPasswordForEmail(contactValue, {
            redirectTo: process.env.NEXT_PUBLIC_SITE_URL
              ? `${process.env.NEXT_PUBLIC_SITE_URL}/login-register/reset`
              : undefined,
          });
        }}
      />
    </div>
  );
}

