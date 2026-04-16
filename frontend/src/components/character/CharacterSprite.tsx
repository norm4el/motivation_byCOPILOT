import { getRankTier } from '@/utils/xp';

interface CharacterSpriteProps {
  level: number;
  size?: number;
  animated?: boolean;
}

export function CharacterSprite({ level, size = 120, animated = true }: CharacterSpriteProps) {
  const rank = getRankTier(level);
  const stage = getStage(rank);

  return (
    <div
      style={{ width: size, height: size }}
      className={animated ? 'animate-[float_3s_ease-in-out_infinite]' : ''}
    >
      {stage === 1 && <Stage1 size={size} />}
      {stage === 2 && <Stage2 size={size} />}
      {stage === 3 && <Stage3 size={size} />}
      {stage === 4 && <Stage4 size={size} />}
      {stage === 5 && <Stage5 size={size} />}
      {stage === 6 && <Stage6 size={size} />}
      {stage === 7 && <Stage7 size={size} />}
    </div>
  );
}

function getStage(rank: string): number {
  const map: Record<string, number> = {
    Novice: 1,
    Apprentice: 2,
    Scholar: 3,
    Adept: 4,
    Expert: 5,
    Master: 6,
    Grandmaster: 7,
    Legend: 7,
  };
  return map[rank] ?? 1;
}

// Stage 1: Simple outline figure (Novice)
function Stage1({ size }: { size: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      {/* Head */}
      <circle cx="50" cy="22" r="12" stroke="#94a3b8" strokeWidth="2.5" fill="#1e293b" />
      {/* Body */}
      <rect x="36" y="36" width="28" height="30" rx="4" stroke="#94a3b8" strokeWidth="2.5" fill="#1e293b" />
      {/* Arms */}
      <line x1="36" y1="42" x2="24" y2="54" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="64" y1="42" x2="76" y2="54" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <line x1="44" y1="66" x2="38" y2="84" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="56" y1="66" x2="62" y2="84" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Stage 2: More detailed figure (Apprentice - blue tones)
function Stage2({ size }: { size: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="20" r="13" stroke="#60a5fa" strokeWidth="2.5" fill="#1e3a5f" />
      {/* Hair */}
      <path d="M37 18 Q50 8 63 18" stroke="#60a5fa" strokeWidth="2" fill="none" />
      {/* Body */}
      <path d="M35 35 L30 65 L40 65 L44 50 L56 50 L60 65 L70 65 L65 35 Z" stroke="#60a5fa" strokeWidth="2" fill="#1e3a5f" />
      {/* Arms */}
      <path d="M35 40 L20 55 L24 58" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M65 40 L80 55 L76 58" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Belt */}
      <rect x="34" y="48" width="32" height="4" rx="2" fill="#2563eb" opacity="0.7" />
      {/* Feet */}
      <ellipse cx="39" cy="68" rx="8" ry="4" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1.5" />
      <ellipse cx="61" cy="68" rx="8" ry="4" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1.5" />
    </svg>
  );
}

// Stage 3: Robed scholar (Scholar - purple)
function Stage3({ size }: { size: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      {/* Glow */}
      <circle cx="50" cy="50" r="45" fill="rgba(124,58,237,0.06)" />
      {/* Head */}
      <circle cx="50" cy="19" r="13" stroke="#a78bfa" strokeWidth="2" fill="#2d1b69" />
      {/* Scholar hat */}
      <rect x="36" y="8" width="28" height="8" rx="2" fill="#7c3aed" />
      <rect x="30" y="8" width="40" height="3" rx="1" fill="#8b5cf6" />
      {/* Robe */}
      <path d="M34 34 L28 82 L72 82 L66 34 Z" stroke="#a78bfa" strokeWidth="2" fill="#2d1b69" />
      {/* Robe trim */}
      <path d="M50 34 L50 82" stroke="#7c3aed" strokeWidth="1.5" opacity="0.6" />
      <path d="M34 34 L28 82" stroke="#a78bfa" strokeWidth="1" opacity="0.4" />
      <path d="M66 34 L72 82" stroke="#a78bfa" strokeWidth="1" opacity="0.4" />
      {/* Arms / sleeves */}
      <path d="M34 42 L18 58" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round" />
      <path d="M66 42 L82 58" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round" />
      {/* Book */}
      <rect x="82" y="50" width="10" height="12" rx="1" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1" />
      <line x1="87" y1="50" x2="87" y2="62" stroke="#a78bfa" strokeWidth="0.5" />
    </svg>
  );
}

// Stage 4: Glowing adept (Adept - violet)
function Stage4({ size }: { size: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="aura4" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Aura */}
      <circle cx="50" cy="50" r="46" fill="url(#aura4)" />
      {/* Head */}
      <circle cx="50" cy="18" r="13" stroke="#c4b5fd" strokeWidth="2" fill="#3b1f8c" />
      {/* Energy crown */}
      <path d="M37 14 L40 8 L43 13 L47 6 L50 12 L53 6 L57 13 L60 8 L63 14"
        stroke="#a78bfa" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Body with energy lines */}
      <path d="M34 33 L27 80 L73 80 L66 33 Z" stroke="#c4b5fd" strokeWidth="2" fill="#3b1f8c" />
      {/* Energy lines */}
      <line x1="50" y1="33" x2="50" y2="80" stroke="#7c3aed" strokeWidth="1" opacity="0.8" />
      <line x1="42" y1="45" x2="58" y2="45" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />
      <line x1="40" y1="58" x2="60" y2="58" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />
      {/* Glowing hands */}
      <circle cx="20" cy="56" r="5" stroke="#a78bfa" strokeWidth="1.5" fill="#3b1f8c" />
      <circle cx="20" cy="56" r="8" stroke="#7c3aed" strokeWidth="0.5" opacity="0.4" />
      <circle cx="80" cy="56" r="5" stroke="#a78bfa" strokeWidth="1.5" fill="#3b1f8c" />
      <circle cx="80" cy="56" r="8" stroke="#7c3aed" strokeWidth="0.5" opacity="0.4" />
      {/* Arms */}
      <line x1="34" y1="42" x2="25" y2="56" stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round" />
      <line x1="66" y1="42" x2="75" y2="56" stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// Stage 5: Expert - violet + cyan elaborate
function Stage5({ size }: { size: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="expertGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <radialGradient id="aura5" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
          <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.1" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#aura5)" />
      {/* Orbit ring */}
      <ellipse cx="50" cy="50" rx="44" ry="12" stroke="url(#expertGrad)" strokeWidth="0.8" opacity="0.4" />
      {/* Head */}
      <circle cx="50" cy="17" r="13" stroke="url(#expertGrad)" strokeWidth="2.5" fill="#1a0b3d" />
      {/* Circlet */}
      <path d="M37 14 Q50 5 63 14" stroke="url(#expertGrad)" strokeWidth="2" fill="none" />
      <circle cx="50" cy="7" r="3" fill="#06b6d4" opacity="0.9" />
      {/* Armored body */}
      <path d="M33 32 L26 80 L74 80 L67 32 Z" stroke="url(#expertGrad)" strokeWidth="2" fill="#1a0b3d" />
      {/* Armor plates */}
      <path d="M40 32 L38 48 L50 44 L62 48 L60 32 Z" fill="#2d1b69" stroke="#7c3aed" strokeWidth="1" />
      {/* Cape */}
      <path d="M33 34 L16 72 L26 74 L33 50" fill="#0e0e2a" stroke="#7c3aed" strokeWidth="1" opacity="0.8" />
      <path d="M67 34 L84 72 L74 74 L67 50" fill="#0e0e2a" stroke="#06b6d4" strokeWidth="1" opacity="0.8" />
      {/* Energy weapons */}
      <line x1="18" y1="52" x2="10" y2="38" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
      <line x1="82" y1="52" x2="90" y2="38" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
      {/* Arms */}
      <line x1="33" y1="44" x2="20" y2="58" stroke="url(#expertGrad)" strokeWidth="5" strokeLinecap="round" />
      <line x1="67" y1="44" x2="80" y2="58" stroke="url(#expertGrad)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

// Stage 6: Master - golden elements
function Stage6({ size }: { size: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="masterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <radialGradient id="aura6" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill="url(#aura6)" />
      {/* Concentric rings */}
      <circle cx="50" cy="50" r="44" stroke="#f59e0b" strokeWidth="0.5" opacity="0.3" />
      <circle cx="50" cy="50" r="38" stroke="#fbbf24" strokeWidth="0.3" opacity="0.2" />
      {/* Head */}
      <circle cx="50" cy="15" r="14" stroke="url(#masterGrad)" strokeWidth="2.5" fill="#1c1003" />
      {/* Golden crown */}
      <path d="M36 12 L39 5 L42 11 L46 3 L50 9 L54 3 L58 11 L61 5 L64 12 Z"
        stroke="url(#masterGrad)" strokeWidth="1.5" fill="#1c1003" strokeLinejoin="round" />
      {/* Crown gems */}
      <circle cx="50" cy="5" r="2" fill="#f59e0b" />
      <circle cx="42" cy="8" r="1.5" fill="#fbbf24" />
      <circle cx="58" cy="8" r="1.5" fill="#fbbf24" />
      {/* Elaborate robes */}
      <path d="M32 32 L22 86 L78 86 L68 32 Z" stroke="url(#masterGrad)" strokeWidth="2" fill="#1c1003" />
      {/* Robe patterns */}
      <path d="M50 32 L50 86" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
      <path d="M40 40 Q50 44 60 40" stroke="#f59e0b" strokeWidth="1" opacity="0.5" fill="none" />
      <path d="M38 55 Q50 59 62 55" stroke="#f59e0b" strokeWidth="1" opacity="0.5" fill="none" />
      <path d="M36 70 Q50 74 64 70" stroke="#f59e0b" strokeWidth="1" opacity="0.5" fill="none" />
      {/* Staff */}
      <line x1="82" y1="20" x2="82" y2="88" stroke="url(#masterGrad)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="82" cy="18" r="5" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1" />
      {/* Arms */}
      <line x1="32" y1="44" x2="82" y2="52" stroke="url(#masterGrad)" strokeWidth="4" strokeLinecap="round" />
      <line x1="68" y1="44" x2="34" y2="58" stroke="#1c1003" strokeWidth="4" strokeLinecap="round" opacity="0" />
      {/* Left arm normally */}
      <line x1="32" y1="44" x2="20" y2="60" stroke="url(#masterGrad)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

// Stage 7: Grandmaster/Legend - full glow effects
function Stage7({ size }: { size: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="legendGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <radialGradient id="aura7" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <filter id="glow7">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Outer aura */}
      <circle cx="50" cy="50" r="48" fill="url(#aura7)" />
      {/* Orbit rings */}
      <ellipse cx="50" cy="50" rx="46" ry="10" stroke="url(#legendGrad)" strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="50" cy="50" rx="10" ry="46" stroke="url(#legendGrad)" strokeWidth="0.8" opacity="0.3" />
      {/* Stars */}
      {[20, 80, 15, 85, 50].map((x, i) => (
        <circle key={i} cx={x} cy={[10, 10, 90, 90, 95][i]} r="1.5" fill="#a855f7" opacity="0.8" />
      ))}
      {/* Head */}
      <circle cx="50" cy="14" r="14" stroke="url(#legendGrad)" strokeWidth="3" fill="#110020" filter="url(#glow7)" />
      {/* Legendary crown */}
      <path d="M35 10 L38 2 L42 8 L46 0 L50 6 L54 0 L58 8 L62 2 L65 10 Z"
        stroke="url(#legendGrad)" strokeWidth="2" fill="#110020" strokeLinejoin="round" filter="url(#glow7)" />
      <circle cx="50" cy="2" r="3" fill="#f43f5e" filter="url(#glow7)" />
      <circle cx="42" cy="5" r="2" fill="#a855f7" filter="url(#glow7)" />
      <circle cx="58" cy="5" r="2" fill="#06b6d4" filter="url(#glow7)" />
      {/* Wings */}
      <path d="M32 36 Q10 28 4 50 Q12 46 20 52 Q28 38 36 42" fill="#110020" stroke="url(#legendGrad)" strokeWidth="1.5" />
      <path d="M68 36 Q90 28 96 50 Q88 46 80 52 Q72 38 64 42" fill="#110020" stroke="url(#legendGrad)" strokeWidth="1.5" />
      {/* Body */}
      <path d="M33 30 L24 84 L76 84 L67 30 Z" stroke="url(#legendGrad)" strokeWidth="2.5" fill="#110020" filter="url(#glow7)" />
      {/* Body energy pattern */}
      <path d="M50 30 L50 84" stroke="#a855f7" strokeWidth="2" opacity="0.7" />
      <path d="M41 40 Q50 46 59 40" stroke="url(#legendGrad)" strokeWidth="1.5" fill="none" opacity="0.8" />
      <path d="M38 55 Q50 61 62 55" stroke="url(#legendGrad)" strokeWidth="1.5" fill="none" opacity="0.8" />
      <path d="M35 70 Q50 76 65 70" stroke="url(#legendGrad)" strokeWidth="1.5" fill="none" opacity="0.8" />
      {/* Arms with glow */}
      <line x1="33" y1="42" x2="15" y2="58" stroke="url(#legendGrad)" strokeWidth="5" strokeLinecap="round" filter="url(#glow7)" />
      <line x1="67" y1="42" x2="85" y2="58" stroke="url(#legendGrad)" strokeWidth="5" strokeLinecap="round" filter="url(#glow7)" />
      {/* Energy orbs in hands */}
      <circle cx="14" cy="60" r="6" fill="url(#legendGrad)" opacity="0.8" filter="url(#glow7)" />
      <circle cx="86" cy="60" r="6" fill="url(#legendGrad)" opacity="0.8" filter="url(#glow7)" />
    </svg>
  );
}
