"use client";

import React, { useEffect, useState } from "react";
import { Mail, Phone, Shield, Check } from "lucide-react";
import ProgressDots from "./common/ProgressDots";
import { ANIMATION_CONTENTS } from "../utils/constants";

const ANIMATION_ICONS = [Shield, Mail, Phone, Check];

export default function AnimatedPanel(): JSX.Element {
  const [animationStep, setAnimationStep] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % ANIMATION_CONTENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentContent = () => ANIMATION_CONTENTS[animationStep];
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
          <ProgressDots total={ANIMATION_CONTENTS.length} current={animationStep} onDotClick={handleDotClick} />
        </div>
      </div>
    </div>
  );
}

