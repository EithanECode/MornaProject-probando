"use client";

import { useState } from 'react';

interface VenezuelaFlagProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export default function VenezuelaFlag({ size = 'md', animated = true, className = '' }: VenezuelaFlagProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-4',
    md: 'w-8 h-5',
    lg: 'w-12 h-8'
  };

  const starSize = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bandera de Venezuela con colores oficiales */}
      <div className={`
        relative w-full h-full rounded-sm overflow-hidden shadow-lg
        ${animated && isHovered ? 'animate-pulse' : ''}
        transition-all duration-300 transform
        ${animated && isHovered ? 'scale-110 rotate-1' : 'scale-100 rotate-0'}
      `}>
        {/* Franja amarilla superior */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-yellow-400"></div>
        
        {/* Franja azul central */}
        <div className="absolute top-1/3 left-0 w-full h-1/3 bg-blue-600"></div>
        
        {/* Franja roja inferior */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-red-600"></div>
        
        {/* Estrellas en el centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            {/* Primera estrella */}
            <div className={`
              ${starSize[size]} text-yellow-300
              ${animated ? 'animate-bounce' : ''}
              ${animated && isHovered ? 'animate-ping' : ''}
            `}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            
            {/* Segunda estrella */}
            <div className={`
              ${starSize[size]} text-yellow-300
              ${animated ? 'animate-bounce' : ''}
              ${animated && isHovered ? 'animate-ping' : ''}
              ${animated ? 'animation-delay-200' : ''}
            `}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            
            {/* Tercera estrella */}
            <div className={`
              ${starSize[size]} text-yellow-300
              ${animated ? 'animate-bounce' : ''}
              ${animated && isHovered ? 'animate-ping' : ''}
              ${animated ? 'animation-delay-400' : ''}
            `}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            
            {/* Cuarta estrella */}
            <div className={`
              ${starSize[size]} text-yellow-300
              ${animated ? 'animate-bounce' : ''}
              ${animated && isHovered ? 'animate-ping' : ''}
              ${animated ? 'animation-delay-600' : ''}
            `}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            
            {/* Quinta estrella */}
            <div className={`
              ${starSize[size]} text-yellow-300
              ${animated ? 'animate-bounce' : ''}
              ${animated && isHovered ? 'animate-ping' : ''}
              ${animated ? 'animation-delay-800' : ''}
            `}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Efecto de ondulación */}
        {animated && (
          <div className={`
            absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
            ${isHovered ? 'animate-pulse' : ''}
            transition-all duration-500
          `}></div>
        )}
      </div>
      
      {/* Sombra sutil */}
      <div className="absolute -bottom-1 left-1 right-1 h-1 bg-black/20 rounded-full blur-sm"></div>
    </div>
  );
} 