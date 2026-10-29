import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

/**
 * Brightcone AI Mark Icon (from reference HTML)
 */
export const BrightconeIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <img
      src="/brightcone-logo-mark.png"
      alt="Brightcone AI"
      width={size}
      height={size}
      className={`shrink-0 object-contain drop-shadow-sm select-none ${className}`}
      onError={(e) => {
        // Fallback to /logo.png if needed
        (e.currentTarget as HTMLImageElement).src = '/logo.png';
      }}
    />
  );
};

/**
 * Brightcone AI Full Logo with slogan (from reference HTML lp-logo)
 */
export const BrightconeFullLogo: React.FC<{
  className?: string;
  width?: number | string;
}> = ({ className = '', width = 280 }) => {
  return (
    <img
      src="/brightcone-logo-full.png"
      alt="brightcone.ai, Clarity. Focus. Impact"
      style={{ maxWidth: typeof width === 'number' ? `${width}px` : width, height: 'auto' }}
      className={`shrink-0 object-contain drop-shadow-md select-none ${className}`}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = '/brightcone-logo-mark.png';
      }}
    />
  );
};

/**
 * Brightcone AI Brand Component (Icon + Sora typography + .ai badge + Slogan)
 */
export const BrightconeBrand: React.FC<LogoProps> = ({
  size = 32,
  className = '',
  textSize = 'md',
  subtitle = 'Clarity. Focus. Impact.',
}) => {
  const titleClass =
    textSize === 'lg'
      ? 'text-2xl font-bold'
      : textSize === 'sm'
      ? 'text-sm font-bold'
      : 'text-lg font-bold';

  const subClass =
    textSize === 'lg'
      ? 'text-xs font-medium'
      : textSize === 'sm'
      ? 'text-[10px] font-medium'
      : 'text-[11px] font-medium';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon squircle container */}
      <div className="relative shrink-0 flex items-center justify-center p-1 rounded-xl bg-gradient-to-tr from-sky-500/20 to-blue-600/30 border border-sky-400/30 shadow-sm">
        <BrightconeIcon size={size} />
      </div>

      {/* Brand Typography (Sora font) */}
      <div className="flex flex-col font-['Sora',sans-serif] leading-tight select-none">
        <div className={`flex items-center gap-1.5 tracking-tight ${titleClass} text-slate-900 dark:text-white`}>
          <span>brightcone</span>
          <span className="text-sky-600 dark:text-sky-400 text-[11px] px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/80 border border-sky-400/60 dark:border-sky-400/50 font-bold tracking-normal shadow-sm">
            .ai
          </span>
        </div>
        <div className={`tracking-wide text-slate-500 dark:text-sky-400/90 font-medium ${subClass}`}>
          {subtitle}
        </div>
      </div>
    </div>
  );
};

export default BrightconeBrand;
