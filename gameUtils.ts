import { Player, PlayerId } from './types';

export const PLAYERS: Record<PlayerId, Player> = {
  razmik: {
    id: 'razmik',
    name: 'Razmik',
    accentColor: '#EA580C', // orange-600
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-400',
    badgeBg: 'bg-orange-500',
    textColor: 'text-orange-600',
    avatarIcon: 'football',
  },
  gayane: {
    id: 'gayane',
    name: 'Gayane',
    accentColor: '#DB2777', // pink-600
    bgLight: 'bg-pink-50',
    borderColor: 'border-pink-400',
    badgeBg: 'bg-pink-500',
    textColor: 'text-pink-600',
    avatarIcon: 'flower',
  },
};

/**
 * Returns which player starts the round and which player goes second.
 * In round 1 (index 0): Razmik starts, then Gayane.
 * In round 2 (index 1): Gayane starts, then Razmik.
 * Alternating each round.
 */
export function getPlayersForRound(roundIndex: number): { firstPlayerId: PlayerId; secondPlayerId: PlayerId } {
  if (roundIndex % 2 === 0) {
    return { firstPlayerId: 'razmik', secondPlayerId: 'gayane' };
  } else {
    return { firstPlayerId: 'gayane', secondPlayerId: 'razmik' };
  }
}

/**
 * Formats milliseconds into 00:00.00 (minutes, seconds, hundredths).
 */
export function formatTimeHundredths(ms: number): string {
  const safeMs = Math.max(0, ms);
  const totalHundredths = Math.floor(safeMs / 10);
  const hundredths = totalHundredths % 100;
  const totalSeconds = Math.floor(totalHundredths / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
}

/**
 * Compares two times with hundredths-of-a-second accuracy.
 */
export function compareTimes(ms1: number, ms2: number): 'first' | 'second' | 'tie' {
  const h1 = Math.floor(ms1 / 10);
  const h2 = Math.floor(ms2 / 10);
  if (h1 < h2) return 'first';
  if (h2 < h1) return 'second';
  return 'tie';
}

export const PRAISE_MESSAGES = [
  '¡Muy bien!',
  '¡Buen trabajo!',
  '¡Cada vez mejor!',
  '¡Excelente pronunciación!',
  '¡Qué gran velocidad!',
  '¡Impresionante agilidad verbal!',
  '¡Ritmo perfecto!',
];

export function getRandomPraise(): string {
  const index = Math.floor(Math.random() * PRAISE_MESSAGES.length);
  return PRAISE_MESSAGES[index];
}
