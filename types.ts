export type PlayerId = 'razmik' | 'gayane';

export interface Player {
  id: PlayerId;
  name: string;
  accentColor: string;
  bgLight: string;
  borderColor: string;
  badgeBg: string;
  textColor: string;
  avatarIcon: 'football' | 'flower';
}

export interface Trabalenguas {
  id: number;
  title: string;
  text: string;
  translationArmenian: string;
  tag: string;
  themeIcon: 'potato' | 'tiger' | 'rose' | 'ball' | 'crocodile' | 'moon' | 'bubble' | 'chair' | 'jacket' | 'dice' | 'breeze' | 'croquette' | 'flower' | 'cat' | 'tomato';
}

export interface TurnResult {
  playerId: PlayerId;
  timeMs: number;
  formattedTime: string;
}

export interface RoundResult {
  roundNumber: number;
  trabalenguas: Trabalenguas;
  firstPlayerId: PlayerId;
  secondPlayerId: PlayerId;
  razmikTimeMs: number | null;
  gayaneTimeMs: number | null;
  winner: PlayerId | 'tie' | null;
}

export type StopwatchStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface GameState {
  roundsTrabalenguas: Trabalenguas[];
  currentRoundIndex: number; // 0 to 14
  currentTurnInRound: 0 | 1; // 0 = first player of round, 1 = second player of round
  isCardRevealed: boolean;
  showArmenianTranslation: boolean;
  stopwatchStatus: StopwatchStatus;
  elapsedMs: number;
  currentTurnCompletedTimeMs: number | null;
  // Completed turn 1 result in the current round
  firstTurnResult: TurnResult | null;
  // History of completed rounds
  completedRounds: RoundResult[];
  // Overall scores
  scores: {
    razmik: number;
    gayane: number;
  };
  isGameOver: boolean;
  showingRoundSummaryModal: boolean;
}
