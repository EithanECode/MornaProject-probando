"use client";

import React, { useState } from "react";
import AuthPage from "./AuthPage";
import PasswordReset from "./PasswordReset/PasswordReset";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function LoginRegisterPage() {
  const [currentPage, setCurrentPage] = useState<"auth" | "password-reset">(
    "auth"
  );
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const navigateToPasswordReset = (): void => setCurrentPage("password-reset");
  const navigateToAuth = (): void => setCurrentPage("auth");

  return (
    <main>
      {currentPage === "auth" && (
        <AuthPage onNavigateToPasswordReset={navigateToPasswordReset} />
      )}
      {currentPage === "password-reset" && (
        <div className="password-reset-container">
          <PasswordReset onNavigateToAuth={navigateToAuth} />
        </div>
      )}

  <LanguageSwitcher />
    </main>
  );
}

