import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  href?: string;
  className?: string;
  variant?: 'vector' | 'image';
}

export function Logo({
  size = 'md',
  showText = true,
  theme = 'auto',
  href = '/',
  className = '',
  variant = 'vector',
}: LogoProps) {
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {variant === 'image' ? (
        <div className={`relative ${iconSizes[size]} rounded-xl overflow-hidden shadow-sm border border-brand-500/20 group-hover:scale-105 transition-transform duration-300`}>
          <img src="/logo.png" alt="LearnHub Logo" className="w-full h-full object-cover" />
        </div>
      ) : (
        /* ── Vector Theme-Matched Geometric SVG Mark ── */
        <div
          className={`relative ${iconSizes[size]} rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-gradient-to-br from-surface-900 via-surface-950 to-brand-950 p-1.5 border border-brand-500/30 group-hover:border-accent-500/60 group-hover:shadow-brand-500/20 group-hover:shadow-lg transition-all duration-300`}
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              {/* Primary Teal-Blue Gradient */}
              <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0e7490" />
              </linearGradient>

              {/* Accent Amber-Gold Gradient */}
              <linearGradient id="goldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>

              {/* Cap Center Burst */}
              <linearGradient id="burstGrad" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Glowing Stars / Sparkles on top */}
            <path d="M50 10 L52 14 L56 16 L52 18 L50 22 L48 18 L44 16 L48 14 Z" fill="url(#goldGrad)" />
            <path d="M38 18 L39 20 L41 21 L39 22 L38 24 L37 22 L35 21 L37 20 Z" fill="#fde047" opacity="0.85" />
            <path d="M62 18 L63 20 L65 21 L63 22 L62 24 L61 22 L59 21 L61 20 Z" fill="#fde047" opacity="0.85" />

            {/* Graduation Cap Diamond Top */}
            <polygon
              points="50,22 84,36 50,50 16,36"
              fill="#0f172a"
              stroke="url(#tealGrad)"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Rising Knowledge Arrow */}
            <path
              d="M50 48 L50 28 M44 34 L50 28 L56 34"
              stroke="url(#goldGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Cap Base Arch */}
            <path
              d="M28 42 L28 50 C28 58 72 58 72 50 L72 42"
              stroke="url(#tealGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Tassel */}
            <path
              d="M50 36 Q74 38 76 54"
              stroke="url(#goldGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="76" cy="56" r="3" fill="url(#goldGrad)" />

            {/* Open Book Wings */}
            <path
              d="M18 58 C32 54 44 56 50 62 C56 56 68 54 82 58 L82 82 C68 78 56 80 50 86 C44 80 32 78 18 82 Z"
              fill="#0f172a"
              stroke="url(#tealGrad)"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Gold Page Highlights */}
            <path
              d="M24 64 C34 61 43 62 48 66"
              stroke="url(#goldGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M76 64 C66 61 57 62 52 66"
              stroke="url(#goldGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight leading-none ${textSizes[size]}`}>
            <span className="text-brand-600 dark:text-brand-400">Learn</span>
            <span className="text-accent-500">Hub</span>
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-block">{content}</Link>;
  }

  return content;
}
