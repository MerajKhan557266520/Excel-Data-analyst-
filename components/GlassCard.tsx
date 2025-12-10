import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  border?: 'primary' | 'success' | 'alert' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, hoverEffect = false, border = 'none' }) => {
  const borderClasses = {
    primary: 'border-prism-primary/50 shadow-[0_0_15px_rgba(102,126,234,0.2)]',
    success: 'border-prism-success/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    alert: 'border-prism-alert/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
    none: 'border-white/10'
  };

  return (
    <div 
      onClick={onClick}
      className={`
        glass-morphism rounded-2xl relative overflow-hidden transition-all duration-300
        ${borderClasses[border]}
        ${hoverEffect ? 'hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)] cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Holographic Border Effect */}
      {hoverEffect && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:animate-shimmer pointer-events-none"></div>
      )}
      
      {children}
    </div>
  );
};