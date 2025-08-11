"use client";

import React, { useState } from "react";
import FormPanel from "./FormPanel";
import AnimatedPanel from "@/components/auth/AnimatedPanel";
import { STEPS, CONTACT_METHODS } from "@/lib/constants/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  onNavigateToAuth: () => void;
  initialStep?: number; // Permite forzar el paso inicial (ej: recuperación desde email)
};

export default function PasswordReset({ onNavigateToAuth, initialStep }: Props): JSX.Element {
  const [step, setStep] = useState<number>(initialStep ?? STEPS.CONTACT_METHOD);
  const [contactMethod, setContactMethod] = useState<string>(CONTACT_METHODS.EMAIL);
  const [contactValue, setContactValue] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      // Permanecemos en paso inicial mostrando feedback mediante UI externa
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
      alert("Las contraseñas no coinciden.");
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
    if (passwordStrength !== "very-strong") {
      alert('La contraseña debe ser "Muy Fuerte" para continuar.');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert("¡Contraseña restablecida exitosamente! Serás redirigido al inicio de sesión.");
      setStep(STEPS.CONTACT_METHOD);
      setContactValue("");
      setVerificationCode(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      onNavigateToAuth?.();
    } catch (err) {
      alert("Ocurrió un error al restablecer la contraseña.");
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

  return (
    <div className="main-card">
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
    </div>
  );
}

