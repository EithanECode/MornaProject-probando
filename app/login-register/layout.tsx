import "./styles/AuthPage.css";
import "./styles/PasswordReset.css";
import React from "react";

export default function LoginRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <>
      <img
        id="background-image"
        src="/images/background.jpg"
        alt="Fondo de nubes"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      />
      {children}
    </>
  );
}

