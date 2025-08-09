"use client";

import React from "react";

type Props = {
  size?: number;
  color?: "white" | "blue";
};

export default function LoadingSpinner({ size = 6, color = "white" }: Props): JSX.Element {
  const sizeClass = `w-${size} h-${size}`;
  const borderColor = color === "white" ? "border-white border-t-transparent" : "border-blue-500 border-t-transparent";
  return <div className={`${sizeClass} border-2 ${borderColor} rounded-full animate-spin`} />;
}

