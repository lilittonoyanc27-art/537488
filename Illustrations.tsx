import React from 'react';

export const SunIllustration: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="26" fill="#FBBF24" stroke="#F59E0B" strokeWidth="3" />
    {/* Sun rays */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <line
        key={i}
        x1="50"
        y1="14"
        x2="50"
        y2="6"
        stroke="#F59E0B"
        strokeWidth="4"
        strokeLinecap="round"
        transform={`rotate(${angle} 50 50)`}
      />
    ))}
    {/* Happy face */}
    <circle cx="42" cy="46" r="3" fill="#78350F" />
    <circle cx="58" cy="46" r="3" fill="#78350F" />
    <path d="M43 56 C46 62, 54 62, 57 56" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <ellipse cx="37" cy="52" rx="2.5" ry="1.5" fill="#F472B6" opacity="0.7" />
    <ellipse cx="63" cy="52" rx="2.5" ry="1.5" fill="#F472B6" opacity="0.7" />
  </svg>
);

export const FootballIllustration: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="42" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
    <polygon points="50,30 65,41 59,59 41,59 35,41" fill="#0F172A" />
    <path d="M50 30 L50 10" stroke="#1E293B" strokeWidth="3" />
    <path d="M65 41 L88 32" stroke="#1E293B" strokeWidth="3" />
    <path d="M59 59 L75 80" stroke="#1E293B" strokeWidth="3" />
    <path d="M41 59 L25 80" stroke="#1E293B" strokeWidth="3" />
    <path d="M35 41 L12 32" stroke="#1E293B" strokeWidth="3" />
    {/* Corner patches */}
    <path d="M40 9 C45 9 55 9 60 9" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
    <path d="M85 30 L91 42" stroke="#0F172A" strokeWidth="4" />
    <path d="M72 82 L65 91" stroke="#0F172A" strokeWidth="4" />
    <path d="M28 82 L35 91" stroke="#0F172A" strokeWidth="4" />
    <path d="M15 30 L9 42" stroke="#0F172A" strokeWidth="4" />
  </svg>
);

export const FlowerIllustration: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stem */}
    <path d="M50 55 Q52 75 50 92" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
    {/* Leaves */}
    <path d="M51 72 Q65 65 68 76 Q57 82 50 75" fill="#4ADE80" stroke="#15803D" strokeWidth="2" />
    <path d="M49 80 Q35 73 32 84 Q43 90 49 82" fill="#4ADE80" stroke="#15803D" strokeWidth="2" />
    {/* Petals */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
      <circle
        key={i}
        cx="50"
        cy="26"
        r="14"
        fill="#F472B6"
        stroke="#DB2777"
        strokeWidth="2"
        transform={`rotate(${deg} 50 45)`}
      />
    ))}
    {/* Center */}
    <circle cx="50" cy="45" r="13" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
    <circle cx="46" cy="43" r="1.5" fill="#78350F" />
    <circle cx="54" cy="43" r="1.5" fill="#78350F" />
    <path d="M47 48 Q50 51 53 48" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const TigerIllustration: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ears */}
    <circle cx="28" cy="28" r="14" fill="#F97316" stroke="#C2410C" strokeWidth="3" />
    <circle cx="28" cy="28" r="8" fill="#FDE047" />
    <circle cx="72" cy="28" r="14" fill="#F97316" stroke="#C2410C" strokeWidth="3" />
    <circle cx="72" cy="28" r="8" fill="#FDE047" />
    {/* Head */}
    <ellipse cx="50" cy="55" rx="36" ry="32" fill="#FB923C" stroke="#C2410C" strokeWidth="3" />
    {/* Cheeks */}
    <circle cx="36" cy="64" r="12" fill="#FFEDD5" />
    <circle cx="64" cy="64" r="12" fill="#FFEDD5" />
    {/* Stripes */}
    <path d="M50 25 L50 36 M42 27 L46 36 M58 27 L54 36" stroke="#431407" strokeWidth="3" strokeLinecap="round" />
    <path d="M16 52 L26 53 M18 60 L28 59" stroke="#431407" strokeWidth="3" strokeLinecap="round" />
    <path d="M84 52 L74 53 M82 60 L72 59" stroke="#431407" strokeWidth="3" strokeLinecap="round" />
    {/* Eyes */}
    <circle cx="37" cy="48" r="4.5" fill="#1E293B" />
    <circle cx="35" cy="46" r="1.5" fill="#FFFFFF" />
    <circle cx="63" cy="48" r="4.5" fill="#1E293B" />
    <circle cx="61" cy="46" r="1.5" fill="#FFFFFF" />
    {/* Nose and mouth */}
    <polygon points="50,58 45,53 55,53" fill="#BE185D" />
    <path d="M50 58 L50 64 M44 64 Q50 68 56 64" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const CrocodileIllustration: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Snout & Head */}
    <path
      d="M18 60 C18 45, 35 40, 52 40 C75 40, 88 50, 88 64 C88 74, 75 76, 52 76 C35 76, 18 70, 18 60 Z"
      fill="#22C55E"
      stroke="#15803D"
      strokeWidth="3"
    />
    {/* Big eyes on top */}
    <circle cx="40" cy="34" r="10" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
    <circle cx="58" cy="34" r="10" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
    <circle cx="41" cy="34" r="5" fill="#14532D" />
    <circle cx="39" cy="32" r="2" fill="#FFFFFF" />
    <circle cx="59" cy="34" r="5" fill="#14532D" />
    <circle cx="57" cy="32" r="2" fill="#FFFFFF" />
    {/* Nostrils */}
    <circle cx="24" cy="54" r="2.5" fill="#15803D" />
    {/* Friendly teeth */}
    <path d="M30 62 L33 57 L36 62 L39 57 L42 62" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="#FFFFFF" />
    {/* Scales */}
    <path d="M68 45 Q74 41 80 47" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const CatIllustration: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ears */}
    <polygon points="24,44 32,16 48,34" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
    <polygon points="28,38 33,23 44,34" fill="#F472B6" />
    <polygon points="76,44 68,16 52,34" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
    <polygon points="72,38 67,23 56,34" fill="#F472B6" />
    {/* Head */}
    <circle cx="50" cy="56" r="32" fill="#FBBF24" stroke="#B45309" strokeWidth="3" />
    {/* Hat (Gabi's hat!) */}
    <ellipse cx="50" cy="32" rx="22" ry="6" fill="#6366F1" />
    <path d="M36 32 C38 18 62 18 64 32 Z" fill="#4F46E5" />
    <circle cx="50" cy="18" r="4" fill="#F43F5E" />
    {/* Eyes */}
    <ellipse cx="38" cy="54" rx="4.5" ry="5.5" fill="#047857" />
    <circle cx="36" cy="52" r="2" fill="#FFFFFF" />
    <ellipse cx="62" cy="54" rx="4.5" ry="5.5" fill="#047857" />
    <circle cx="60" cy="52" r="2" fill="#FFFFFF" />
    {/* Nose and mouth */}
    <polygon points="50,62 46,58 54,58" fill="#F43F5E" />
    <path d="M50 62 L50 67 M44 67 Q50 72 56 67" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
    {/* Whiskers */}
    <path d="M30 63 L16 60 M30 67 L16 68 M70 63 L84 60 M70 67 L84 68" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TrophyIllustration: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 26 H68 V52 C68 62 60 70 50 70 C40 70 32 62 32 52 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="3" />
    <path d="M32 34 H20 C16 34 14 38 15 44 C16 52 22 56 32 56" stroke="#D97706" strokeWidth="3" fill="none" />
    <path d="M68 34 H80 C84 34 86 38 85 44 C84 52 78 56 68 56" stroke="#D97706" strokeWidth="3" fill="none" />
    <rect x="44" y="70" width="12" height="14" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
    <path d="M28 84 H72 L66 94 H34 Z" fill="#D97706" stroke="#B45309" strokeWidth="3" />
    {/* Star inside */}
    <polygon points="50,38 53,44 60,45 55,50 56,57 50,53 44,57 45,50 40,45 47,44" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
  </svg>
);

export const ThemeIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = 'w-8 h-8' }) => {
  switch (icon) {
    case 'tiger':
      return <TigerIllustration className={className} />;
    case 'crocodile':
      return <CrocodileIllustration className={className} />;
    case 'cat':
      return <CatIllustration className={className} />;
    case 'ball':
      return <FootballIllustration className={className} />;
    case 'flower':
    case 'rose':
      return <FlowerIllustration className={className} />;
    case 'potato':
      return (
        <span className="text-3xl select-none" role="img" aria-label="potato">
          🥔
        </span>
      );
    case 'moon':
      return (
        <span className="text-3xl select-none" role="img" aria-label="moon">
          🌙
        </span>
      );
    case 'bubble':
      return (
        <span className="text-3xl select-none" role="img" aria-label="bubbles">
          🫧
        </span>
      );
    case 'chair':
      return (
        <span className="text-3xl select-none" role="img" aria-label="chair">
          🪑
        </span>
      );
    case 'jacket':
      return (
        <span className="text-3xl select-none" role="img" aria-label="jacket">
          🧥
        </span>
      );
    case 'dice':
      return (
        <span className="text-3xl select-none" role="img" aria-label="dice">
          🎲
        </span>
      );
    case 'breeze':
      return (
        <span className="text-3xl select-none" role="img" aria-label="breeze">
          🍃
        </span>
      );
    case 'croquette':
      return (
        <span className="text-3xl select-none" role="img" aria-label="croquette">
          🥟
        </span>
      );
    case 'tomato':
      return (
        <span className="text-3xl select-none" role="img" aria-label="tomato">
          🍅
        </span>
      );
    default:
      return <SunIllustration className={className} />;
  }
};
