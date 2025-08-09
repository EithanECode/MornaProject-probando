"use client";

import React, { useState } from "react";
import FormPanel from "./FormPanel";
import AnimatedPanel from "../components/AnimatedPanel";
import { STEPS, CONTACT_METHODS } from "../utils/constants";
import "../styles/PasswordReset.css";

type Props = {
  onNavigateToAuth: () => void;
};

export default function PasswordReset({ onNavigateToAuth }: Props): JSX.Element {
  const [step, setStep] = useState<number>(STEPS.CONTACT_METHOD);
  const [contactMethod, setContactMethod] = useState<string>(CONTACT_METHODS.EMAIL);
  const [contactValue, setContactValue] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendCode = (): void => {
    if (!contactValue) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(STEPS.NEW_PASSWORD);
    }, 2000);
  };

  const handleVerifyCode = (): void => {
    const code = verificationCode.join("");
    if (code.length !== 6) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(STEPS.NEW_PASSWORD);
    }, 1500);
  };

  const handleResetPassword = (): void => {
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
    setTimeout(() => {
      setIsLoading(false);
      alert("¡Contraseña restablecida exitosamente! Serás redirigido al inicio de sesión.");
      setStep(STEPS.CONTACT_METHOD);
      setContactValue("");
      setVerificationCode(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      onNavigateToAuth?.();
    }, 2000);
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

