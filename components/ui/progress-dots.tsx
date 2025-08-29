"use client";

import React from "react";

type Props = {
  total?: number;
  current?: number;
  onDotClick?: (index: number) => void;
};

export default function ProgressDots({ total = 4, current = 0, onDotClick }: Props) {
  return (
    <div className="progress-dots-container">
      {Array.from({ length: total }, (_, index) => (
        <div
          key={index}
          className={`progress-dot ${index === current ? "active" : ""}`}
          onClick={() => onDotClick && onDotClick(index)}
          role="button"
          aria-label={`Ir al mensaje ${index + 1}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && onDotClick) {
              e.preventDefault();
              onDotClick(index);
            }
          }}
        />)
      )}
    </div>
  );
}

