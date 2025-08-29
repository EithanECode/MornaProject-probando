'use client';

import React, { useState, useEffect } from 'react';

interface LazyPlayerProps {
  src: any;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

let Player: any = null;

const LazyPlayer: React.FC<LazyPlayerProps> = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !Player) {
      import('@lottiefiles/react-lottie-player').then((module) => {
        Player = module.Player;
        setIsLoaded(true);
      });
    } else if (Player) {
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded || !Player) {
    return <div className={props.className} style={props.style} />;
  }

  return <LazyPlayer {...props} />;
};

export default LazyPlayer;
