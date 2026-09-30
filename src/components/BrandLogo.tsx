import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showGlow = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 rounded-lg',
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
  };

  const imageSrc = '/src/assets/images/classio_logo_1790771642627.jpg';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Background radial glow */}
      {showGlow && (
        <div 
          className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl opacity-40 blur-sm pointer-events-none"
        />
      )}

      {/* Main Logo Container */}
      <div 
        className={`relative overflow-hidden shadow-md border border-white/20 bg-gradient-to-br from-[#182B49] to-[#0A1424] flex items-center justify-center ${sizeClasses[size]}`}
      >
        {!imageError ? (
          <img
            src={imageSrc}
            alt="Classio 品牌標誌"
            className="w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          /* High-fidelity Vector SVG Fallback with Orbit Ring and Inner Sphere */
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cGrad" x1="15%" y1="15%" x2="85%" y2="85%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="45%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id="ringGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#67E8F9" stopOpacity="1" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.4" />
              </linearGradient>
              <radialGradient id="sphereGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#BAE6FD" />
                <stop offset="100%" stopColor="#0284C7" />
              </radialGradient>
            </defs>
            {/* Background rounded squircle */}
            <rect width="100" height="100" rx="24" fill="#0B1938" />
            {/* The Stylized C Arc */}
            <path
              d="M72 32C66 22 56 18 46 18C28 18 16 32 16 50C16 68 28 82 46 82C58 82 68 76 74 66C76 62 74 58 70 58C67 58 65 60 62 64C58 70 52 74 46 74C32 74 24 63 24 50C24 37 32 26 46 26C53 26 60 30 63 35C65 38 68 39 71 37C73 35 74 33 72 32Z"
              fill="url(#cGrad)"
            />
            {/* Central Sphere */}
            <circle cx="50" cy="50" r="11" fill="url(#sphereGrad)" />
            {/* Orbital Light Ring */}
            <ellipse
              cx="50"
              cy="52"
              rx="38"
              ry="14"
              stroke="url(#ringGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              transform="rotate(-15 50 52)"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
