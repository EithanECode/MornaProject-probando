"use client";

import React, { useState } from "react";
import AuthPage from "./AuthPage";
import PasswordReset from "./PasswordReset/PasswordReset";

export default function LoginRegisterPage(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<"auth" | "password-reset">(
    "auth"
  );

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
    </main>
  );
}

