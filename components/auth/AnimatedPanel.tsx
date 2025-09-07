"use client";

import React, { useEffect, useState } from "react";
import { Mail, Phone, Shield, Check } from "lucide-react";
import ProgressDots from "@/components/ui/progress-dots";
import { ANIMATION_CONTENTS } from "@/lib/constants/auth"; // se mantiene por compat si otros usan
import { useTranslation } from "@/hooks/useTranslation";

const ANIMATION_ICONS = [Shield, Mail, Phone, Check];

export default function AnimatedPanel() {
  const [animationStep, setAnimationStep] = useState<number>(0);
  const { t } = useTranslation();

  // Longitud basada en slides traducidos para que no dependa de constante estática
  // Número de slides definido (mantener sincronizado con traducciones)
  const slideCount = 4; // si añades más, actualiza este valor
  const slidesLength = slideCount;

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % slideCount);
    }, 4000);
    return () => clearInterval(interval);
  }, [slideCount]);

  const getCurrentContent = () => {
    const titleKey = `passwordResetSide.slides.${animationStep}.title`;
    const descKey = `passwordResetSide.slides.${animationStep}.desc`;
    const title = t(titleKey);
    const desc = t(descKey);
    // Si devuelve la clave (fallback), usar constantes originales
    if (title === titleKey || desc === descKey) {
      const fallback = ANIMATION_CONTENTS[animationStep] || { title: '', desc: '' };
      return fallback;
    }
    return { title, desc };
  };
  const handleDotClick = (index: number): void => setAnimationStep(index);
  const CurrentIcon = ANIMATION_ICONS[animationStep];

  return (
    <div className="animated-panel">
      <div className="background-animation">
        <div className="floating-circle-1"></div>
        <div className="floating-circle-2"></div>
      </div>
      <div className="relative z-10 text-center max-w-md">
        <div className="mb-8 transform transition-all duration-1000 ease-in-out">
          <div className="icon-container">
            <CurrentIcon size={48} className="text-white animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold mb-4 transition-all duration-500">
            {getCurrentContent().title}
          </h2>
          <p className="text-lg opacity-90 leading-relaxed transition-all duration-500">
            {getCurrentContent().desc}
          </p>
        </div>
        <div className="progress-dots-wrapper">
          <ProgressDots total={slidesLength} current={animationStep} onDotClick={handleDotClick} />
        </div>
      </div>
    </div>
  );
}

