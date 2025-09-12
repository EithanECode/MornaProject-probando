"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mail, ChevronRight, ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import Lottie from "react-lottie";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { STEPS } from "@/lib/constants/auth";
import { MAX_PASSWORD, MAX_EMAIL } from "@/lib/constants/validation";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  step: number;
  setStep: (v: number) => void;
  contactMethod: string;
  setContactMethod: (v: string) => void;
  contactValue: string;
  setContactValue: (v: string) => void;
  verificationCode: string[];
  handleCodeInput: (index: number, value: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  isLoading: boolean;
  onSendCode: () => void;
  onVerifyCode: () => void;
  onResetPassword: () => void;
  onResendCode: () => void;
  onNavigateToAuth: () => void;
};

export default function FormPanel(props: Props) {
  const { t } = useTranslation();
  const {
    step,
    setStep,
    contactMethod,
    setContactMethod,
    contactValue,
    setContactValue,
    verificationCode,
    handleCodeInput,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    onSendCode,
    onVerifyCode,
    onResetPassword,
    onResendCode,
    onNavigateToAuth,
  } = props;

  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
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

  const [currentRenderedStep, setCurrentRenderedStep] = useState<number>(step);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const strengthTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const matchErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkmarkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [successAnim, setSuccessAnim] = useState<any | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/animations/Success.json")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSuccessAnim(data);
      })
      .catch(() => {
        // si falla la carga, no mostramos animación
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const defaultCheckmarkOptions = successAnim
    ? {
        loop: false,
        autoplay: true,
        animationData: successAnim,
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
      }
    : null;

  const getPasswordStrengthInfo = (
    pwd: string
  ): { text: string; level: typeof passwordStrength } => {
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
  text = t('auth.common.passwordLevelLow');
      level = "low";
    } else if (strength === 2) {
  text = t('auth.common.passwordLevelMedium');
      level = "medium";
    } else if (strength === 3) {
  text = t('auth.common.passwordLevelStrong');
      level = "strong";
    } else if (strength >= 4) {
  text = t('auth.common.passwordLevelVeryStrong');
      level = "very-strong";
    }
    return { text, level };
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newPasswordValue = e.target.value.slice(0, MAX_PASSWORD);
    setNewPassword(newPasswordValue);
    const { level } = getPasswordStrengthInfo(newPasswordValue);
    setPasswordStrength(level);
    if (confirmPassword.length > 0) {
      setPasswordMatchError(newPasswordValue !== confirmPassword);
    } else {
      setPasswordMatchError(false);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newConfirmPassword = e.target.value.slice(0, MAX_PASSWORD);
    setConfirmPassword(newConfirmPassword);
    const doMatch = newPassword === newConfirmPassword && newConfirmPassword.length > 0;
    setPasswordMatchError(!doMatch);
  };

  const handlePasswordFocus = (): void => setIsPasswordFocused(true);
  const handlePasswordBlur = (): void => setIsPasswordFocused(false);
  const toggleShowNewPassword = (): void => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmPassword = (): void => setShowConfirmPassword(!showConfirmPassword);

  const currentStrengthInfo = getPasswordStrengthInfo(newPassword);

  useEffect(() => {
    return () => {
      if (strengthTimeoutRef.current) clearTimeout(strengthTimeoutRef.current);
      if (matchErrorTimeoutRef.current) clearTimeout(matchErrorTimeoutRef.current);
      if (checkmarkTimeoutRef.current) clearTimeout(checkmarkTimeoutRef.current);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const shouldShowStrengthFeedback = newPassword.length > 0 && isPasswordFocused;
    if (shouldShowStrengthFeedback) {
      setShowFeedbackDiv(true);
      if (strengthTimeoutRef.current) clearTimeout(strengthTimeoutRef.current);
      strengthTimeoutRef.current = setTimeout(() => setAnimateFeedback(true), 50);
    } else {
      setAnimateFeedback(false);
      if (strengthTimeoutRef.current) clearTimeout(strengthTimeoutRef.current);
      strengthTimeoutRef.current = setTimeout(() => setShowFeedbackDiv(false), 300);
    }
  }, [newPassword.length, isPasswordFocused]);

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
    const shouldShowCheckmark = !passwordMatchError && confirmPassword.length > 0 && newPassword === confirmPassword;
    setShowCheckmark(shouldShowCheckmark);
  }, [passwordMatchError, confirmPassword.length, newPassword, confirmPassword]);

  useEffect(() => {
    if (step !== currentRenderedStep) {
      setIsAnimating(true);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = setTimeout(() => {
        setCurrentRenderedStep(step);
        setIsAnimating(false);
      }, 300);
    } else {
      setIsAnimating(false);
    }
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, [step, currentRenderedStep]);

  const getStepTitle = (): string => {
    switch (step) {
      case STEPS.CONTACT_METHOD:
  return t('auth.passwordReset.titles.reset');
      case STEPS.VERIFICATION:
  return t('auth.passwordReset.titles.verify');
      case STEPS.NEW_PASSWORD:
  return t('auth.passwordReset.titles.new');
      default:
  return t('auth.passwordReset.titles.reset');
    }
  };

  const getStepDescription = (): string => {
    switch (step) {
      case STEPS.CONTACT_METHOD:
  return t('auth.passwordReset.descriptions.enterEmail');
      case STEPS.VERIFICATION:
  return t('auth.passwordReset.descriptions.codeSent', { contact: contactValue });
      case STEPS.NEW_PASSWORD:
  return t('auth.passwordReset.descriptions.createNew');
      default:
  return t('auth.passwordReset.descriptions.enterEmail');
    }
  };

  const getStepContent = (currentStep: number) => {
    switch (currentStep) {
      case STEPS.CONTACT_METHOD:
        return (
          <div
            key={STEPS.CONTACT_METHOD}
            className={`form-step ${currentRenderedStep === STEPS.CONTACT_METHOD && !isAnimating ? "active-step" : "inactive-step"}`}
          >
            <div className="input-container">
              <div className="input-icon">
                <Mail size={20} className="text-gray-400" />
              </div>
              <input
                type="email"
                placeholder={t('auth.passwordReset.placeholders.email')}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value.slice(0, MAX_EMAIL))}
                className="input-field-with-icon"
                maxLength={MAX_EMAIL}
                required
              />
            </div>
            <button onClick={onSendCode} disabled={!contactValue || isLoading} className="btn-primary">
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <span>{t('auth.passwordReset.buttons.continue')}</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        );
      case STEPS.NEW_PASSWORD:
        return (
          <div
            key={STEPS.NEW_PASSWORD}
            className={`form-step ${currentRenderedStep === STEPS.NEW_PASSWORD && !isAnimating ? "active-step" : "inactive-step"}`}
          >
            <button onClick={() => setStep(STEPS.CONTACT_METHOD)} className="back-step-btn">
              <ArrowLeft size={20} />
              <span>{t('auth.passwordReset.buttons.back')}</span>
            </button>
            <div className="password-input-container">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder={t('auth.passwordReset.placeholders.newPassword')}
                value={newPassword}
                onChange={handleNewPasswordChange}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                className={`input-field password-input ${
                  currentStrengthInfo.level !== "none" ? `password-strength-border-${currentStrengthInfo.level}` : ""
                }`}
                required
                maxLength={MAX_PASSWORD}
              />
              <span className="password-toggle-icon" onClick={toggleShowNewPassword}>
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
              {showFeedbackDiv && (
                <div className={`password-strength-feedback ${animateFeedback ? "active" : ""}`}>
                  <div className={`password-strength-text password-strength-text-${currentStrengthInfo.level}`}>
                    {currentStrengthInfo.text}
                  </div>
                  <div className="password-strength-bar-container">
                    <div className={`password-strength-bar password-strength-bar-${currentStrengthInfo.level}`}></div>
                  </div>
                </div>
              )}
            </div>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('auth.passwordReset.placeholders.confirmPassword')}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="input-field password-input"
                required
                maxLength={MAX_PASSWORD}
              />
              <span className={`password-toggle-icon ${showCheckmark ? "hidden" : ""}`} onClick={toggleShowConfirmPassword}>
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
              {showMatchErrorDiv && (
                <p className={`password-error-message ${animateMatchError ? "active" : ""}`}>{t('auth.common.passwordsNoMatch')}</p>
              )}
              {showCheckmark && defaultCheckmarkOptions && (
                <div className="checkmark-icon-container">
                  <Lottie options={defaultCheckmarkOptions} height={25} width={25} />
                </div>
              )}
            </div>
            <button onClick={onResetPassword} disabled={passwordStrength !== "very-strong" || passwordMatchError || isLoading} className="btn-primary">
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <span>{t('auth.passwordReset.buttons.reset')}</span>
                  <Check size={20} />
                </>
              )}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="form-panel">
      {step === STEPS.CONTACT_METHOD && (
        <button
          onClick={(e) => {
            e.preventDefault();
            // Marcar que regresamos de PasswordReset
            sessionStorage.setItem('fromPasswordReset', 'true');
            onNavigateToAuth?.();
          }}
          className="back-to-login-btn"
          title={t('auth.passwordReset.tooltips.backToLogin')}
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <div className="form-content">
        <div className="form-header">
          <div className="header-icon">
            <Image src="/images/escudo.gif" alt={t('auth.passwordReset.alts.securityShield')} width={48} height={48} className="shield-gif" />
          </div>
          <h1 className="form-title">{getStepTitle()}</h1>
          <p className="form-description">{getStepDescription()}</p>
        </div>
        <div className="step-transition-container">{getStepContent(currentRenderedStep)}</div>
      </div>
    </div>
  );
}

