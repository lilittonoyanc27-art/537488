/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
  Eye,
  EyeOff,
  Medal,
  Clock,
  Flame,
  Info,
} from 'lucide-react';
import { GameState, PlayerId, RoundResult, StopwatchStatus } from './types';
import { TRABALENGUAS_LIST, shuffleTrabalenguas } from './trabalenguasData';
import {
  PLAYERS,
  getPlayersForRound,
  formatTimeHundredths,
  compareTimes,
  getRandomPraise,
} from './gameUtils';
import {
  SunIllustration,
  FootballIllustration,
  FlowerIllustration,
  TrophyIllustration,
  ThemeIcon,
} from './Illustrations';
import { sounds } from './SoundEffects';
import { Confetti } from './Confetti';

const STORAGE_KEY = 'trabalenguas_por_turnos_v1';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPraiseBanner, setShowPraiseBanner] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Initialize GameState from localStorage if available, or create initial state
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as GameState;
          // If the app was closed while timer was running, restore it as paused
          if (parsed.stopwatchStatus === 'running') {
            parsed.stopwatchStatus = 'paused';
          }
          return parsed;
        }
      } catch (err) {
        console.error('Error loading game state from localStorage', err);
      }
    }

    const shuffled = shuffleTrabalenguas(TRABALENGUAS_LIST);
    return {
      roundsTrabalenguas: shuffled,
      currentRoundIndex: 0,
      currentTurnInRound: 0,
      isCardRevealed: false,
      showArmenianTranslation: false,
      stopwatchStatus: 'idle',
      elapsedMs: 0,
      currentTurnCompletedTimeMs: null,
      firstTurnResult: null,
      completedRounds: [],
      scores: {
        razmik: 0,
        gayane: 0,
      },
      isGameOver: false,
      showingRoundSummaryModal: false,
    };
  });

  // Current active stopwatch elapsed time in milliseconds for immediate rendering
  const [displayElapsedMs, setDisplayElapsedMs] = useState<number>(gameState.elapsedMs);

  // Ref to track stopwatch state and prevent multiple intervals
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const baseElapsedRef = useRef<number>(gameState.elapsedMs);

  // Persist gameState to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  }, [gameState]);

  // Synchronize baseElapsedRef when gameState.elapsedMs updates externally
  useEffect(() => {
    baseElapsedRef.current = gameState.elapsedMs;
    setDisplayElapsedMs(gameState.elapsedMs);
  }, [gameState.elapsedMs]);

  // Stop running stopwatch
  const stopTimerInterval = useCallback(() => {
    if (timerRef.current !== null) {
      window.cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Stopwatch animation frame tick
  const startTimerInterval = useCallback(() => {
    stopTimerInterval();
    startTimeRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const currentDelta = now - startTimeRef.current;
      const total = baseElapsedRef.current + currentDelta;
      setDisplayElapsedMs(total);
      timerRef.current = window.requestAnimationFrame(tick);
    };

    timerRef.current = window.requestAnimationFrame(tick);
  }, [stopTimerInterval]);

  // Handle running status
  useEffect(() => {
    if (gameState.stopwatchStatus === 'running') {
      startTimerInterval();
    } else {
      stopTimerInterval();
    }
    return () => {
      stopTimerInterval();
    };
  }, [gameState.stopwatchStatus, startTimerInterval, stopTimerInterval]);

  // Current round metadata
  const currentTrabalenguas = gameState.roundsTrabalenguas[gameState.currentRoundIndex] || TRABALENGUAS_LIST[0];
  const { firstPlayerId, secondPlayerId } = getPlayersForRound(gameState.currentRoundIndex);
  const currentTurnPlayerId: PlayerId =
    gameState.currentTurnInRound === 0 ? firstPlayerId : secondPlayerId;
  const currentTurnPlayer = PLAYERS[currentTurnPlayerId];

  // Helper sound wrapper
  const playSfx = (type: 'click' | 'start' | 'pause' | 'finish' | 'victory') => {
    if (!soundEnabled) return;
    if (type === 'click') sounds.playClick();
    if (type === 'start') sounds.playStart();
    if (type === 'pause') sounds.playPause();
    if (type === 'finish') sounds.playFinish();
    if (type === 'victory') sounds.playVictory();
  };

  // Card Reveal Action
  const handleRevealCard = () => {
    playSfx('click');
    setGameState((prev) => ({
      ...prev,
      isCardRevealed: true,
      showArmenianTranslation: false,
    }));
  };

  // Stopwatch Button: Empezar
  const handleStartStopwatch = () => {
    if (gameState.stopwatchStatus === 'running') return;
    playSfx('start');
    baseElapsedRef.current = 0;
    setDisplayElapsedMs(0);

    setGameState((prev) => ({
      ...prev,
      stopwatchStatus: 'running',
      elapsedMs: 0,
      currentTurnCompletedTimeMs: null,
    }));
  };

  // Stopwatch Button: Pausar
  const handlePauseStopwatch = () => {
    if (gameState.stopwatchStatus !== 'running') return;
    playSfx('pause');
    const now = performance.now();
    const currentDelta = now - startTimeRef.current;
    const finalElapsed = baseElapsedRef.current + currentDelta;
    baseElapsedRef.current = finalElapsed;
    setDisplayElapsedMs(finalElapsed);

    setGameState((prev) => ({
      ...prev,
      stopwatchStatus: 'paused',
      elapsedMs: finalElapsed,
    }));
  };

  // Stopwatch Button: Continuar
  const handleContinueStopwatch = () => {
    if (gameState.stopwatchStatus !== 'paused') return;
    playSfx('start');
    setGameState((prev) => ({
      ...prev,
      stopwatchStatus: 'running',
    }));
  };

  // Stopwatch Button: Terminar
  const handleFinishTurn = () => {
    if (gameState.stopwatchStatus !== 'running' && gameState.stopwatchStatus !== 'paused') return;
    playSfx('finish');

    let finalTime = baseElapsedRef.current;
    if (gameState.stopwatchStatus === 'running') {
      const now = performance.now();
      const currentDelta = now - startTimeRef.current;
      finalTime = baseElapsedRef.current + currentDelta;
    }

    baseElapsedRef.current = finalTime;
    setDisplayElapsedMs(finalTime);

    setShowPraiseBanner(getRandomPraise());
    setTimeout(() => setShowPraiseBanner(null), 3000);

    setGameState((prev) => ({
      ...prev,
      stopwatchStatus: 'finished',
      elapsedMs: finalTime,
      currentTurnCompletedTimeMs: finalTime,
    }));
  };

  // Stopwatch Button: Reintentar
  const handleRetryTurn = () => {
    playSfx('click');
    stopTimerInterval();
    baseElapsedRef.current = 0;
    setDisplayElapsedMs(0);

    setGameState((prev) => ({
      ...prev,
      stopwatchStatus: 'idle',
      elapsedMs: 0,
      currentTurnCompletedTimeMs: null,
    }));
  };

  // Advance to Next Turn / Finish Round
  const handleNextTurn = () => {
    playSfx('click');
    if (gameState.currentTurnCompletedTimeMs === null) return;

    if (gameState.currentTurnInRound === 0) {
      // Completed first turn: store it and transition to second turn
      const firstResult = {
        playerId: currentTurnPlayerId,
        timeMs: gameState.currentTurnCompletedTimeMs,
        formattedTime: formatTimeHundredths(gameState.currentTurnCompletedTimeMs),
      };

      baseElapsedRef.current = 0;
      setDisplayElapsedMs(0);

      setGameState((prev) => ({
        ...prev,
        currentTurnInRound: 1,
        isCardRevealed: false,
        showArmenianTranslation: false,
        stopwatchStatus: 'idle',
        elapsedMs: 0,
        currentTurnCompletedTimeMs: null,
        firstTurnResult: firstResult,
      }));
    } else {
      // Completed second turn of the round: evaluate round results
      const firstResult = gameState.firstTurnResult;
      if (!firstResult) return;

      const secondResult = {
        playerId: currentTurnPlayerId,
        timeMs: gameState.currentTurnCompletedTimeMs,
        formattedTime: formatTimeHundredths(gameState.currentTurnCompletedTimeMs),
      };

      const razmikTimeMs =
        firstResult.playerId === 'razmik' ? firstResult.timeMs : secondResult.timeMs;
      const gayaneTimeMs =
        firstResult.playerId === 'gayane' ? firstResult.timeMs : secondResult.timeMs;

      // Lower time gets 1 point; equal time gives 1 point to each
      const comparison = compareTimes(razmikTimeMs, gayaneTimeMs);
      let winner: PlayerId | 'tie' = 'tie';
      let addRazmik = 0;
      let addGayane = 0;

      if (comparison === 'first') {
        winner = 'razmik';
        addRazmik = 1;
      } else if (comparison === 'second') {
        winner = 'gayane';
        addGayane = 1;
      } else {
        winner = 'tie';
        addRazmik = 1;
        addGayane = 1;
      }

      const completedRound: RoundResult = {
        roundNumber: gameState.currentRoundIndex + 1,
        trabalenguas: currentTrabalenguas,
        firstPlayerId,
        secondPlayerId,
        razmikTimeMs,
        gayaneTimeMs,
        winner,
      };

      playSfx('finish');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);

      setGameState((prev) => ({
        ...prev,
        showingRoundSummaryModal: true,
        completedRounds: [...prev.completedRounds, completedRound],
        scores: {
          razmik: prev.scores.razmik + addRazmik,
          gayane: prev.scores.gayane + addGayane,
        },
      }));
    }
  };

  // Move from round summary to next round or end game
  const handleProceedToNextRound = () => {
    playSfx('click');
    const nextRoundIndex = gameState.currentRoundIndex + 1;

    if (nextRoundIndex >= 15) {
      // All 15 rounds complete
      playSfx('victory');
      setShowConfetti(true);
      setGameState((prev) => ({
        ...prev,
        isGameOver: true,
        showingRoundSummaryModal: false,
      }));
    } else {
      // Start next round
      baseElapsedRef.current = 0;
      setDisplayElapsedMs(0);

      setGameState((prev) => ({
        ...prev,
        currentRoundIndex: nextRoundIndex,
        currentTurnInRound: 0,
        isCardRevealed: false,
        showArmenianTranslation: false,
        stopwatchStatus: 'idle',
        elapsedMs: 0,
        currentTurnCompletedTimeMs: null,
        firstTurnResult: null,
        showingRoundSummaryModal: false,
      }));
    }
  };

  // Restart game / Play again
  const handleRestartGame = () => {
    playSfx('click');
    const shuffled = shuffleTrabalenguas(TRABALENGUAS_LIST);
    baseElapsedRef.current = 0;
    setDisplayElapsedMs(0);
    stopTimerInterval();

    const freshState: GameState = {
      roundsTrabalenguas: shuffled,
      currentRoundIndex: 0,
      currentTurnInRound: 0,
      isCardRevealed: false,
      showArmenianTranslation: false,
      stopwatchStatus: 'idle',
      elapsedMs: 0,
      currentTurnCompletedTimeMs: null,
      firstTurnResult: null,
      completedRounds: [],
      scores: {
        razmik: 0,
        gayane: 0,
      },
      isGameOver: false,
      showingRoundSummaryModal: false,
    };

    setGameState(freshState);
  };

  // Toggle Armenian translation
  const handleToggleTranslation = () => {
    playSfx('click');
    setGameState((prev) => ({
      ...prev,
      showArmenianTranslation: !prev.showArmenianTranslation,
    }));
  };

  // Calculate totals for end game
  const totalRazmikMs = gameState.completedRounds.reduce(
    (acc, r) => acc + (r.razmikTimeMs || 0),
    0
  );
  const totalGayaneMs = gameState.completedRounds.reduce(
    (acc, r) => acc + (r.gayaneTimeMs || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-blue-100 flex flex-col font-sans pb-12 selection:bg-amber-200">
      <Confetti active={showConfetti} />

      {/* Top Navbar / Header */}
      <header className="w-full bg-white/90 backdrop-blur-md shadow-xs border-b border-sky-200 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-100 rounded-xl shadow-xs">
              <SunIllustration className="w-8 h-8 md:w-9 md:h-9" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-sky-950 tracking-tight flex items-center gap-1.5">
                <span>¡Trabalenguas por turnos!</span>
              </h1>
              <p className="text-xs text-sky-700 hidden sm:block">
                Juego de lectura y dicción para Razmik y Gayane
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl text-sky-700 hover:bg-sky-100 transition-colors"
              title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Quieres reiniciar la partida desde la Ronda 1?')) {
                  handleRestartGame();
                }
              }}
              className="px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-100 hover:bg-sky-200 rounded-xl transition shadow-2xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 pt-4 md:pt-6 flex-1 flex flex-col gap-5">
        {/* Rule reminder pill */}
        <div className="bg-white/80 border border-sky-200/80 rounded-2xl p-3 md:px-5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-sky-900 text-xs md:text-sm font-semibold">
            <span className="p-1.5 bg-sky-100 text-sky-700 rounded-lg shrink-0">
              <Info className="w-4 h-4" />
            </span>
            <span>«Lee todo el texto con claridad. Si te equivocas, corrige y continúa.»</span>
          </div>
          <div className="shrink-0 hidden md:flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Precisión: centésimas</span>
          </div>
        </div>

        {/* Players Scoreboard & Current Round Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-stretch">
          {/* Razmik Score Card */}
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all shadow-xs flex items-center justify-between gap-2 ${
              currentTurnPlayerId === 'razmik' && !gameState.isGameOver
                ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200'
                : 'bg-white border-orange-200 opacity-90'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shadow-2xs shrink-0">
                <FootballIllustration className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-orange-950 text-sm md:text-base">Razmik</span>
                  {currentTurnPlayerId === 'razmik' && !gameState.isGameOver && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-bold text-orange-600">
                  {gameState.scores.razmik} {gameState.scores.razmik === 1 ? 'punto' : 'puntos'}
                </div>
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black text-orange-600 px-2 py-0.5 bg-orange-100/80 rounded-lg">
              {gameState.scores.razmik}
            </div>
          </div>

          {/* Gayane Score Card */}
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all shadow-xs flex items-center justify-between gap-2 ${
              currentTurnPlayerId === 'gayane' && !gameState.isGameOver
                ? 'bg-pink-50 border-pink-400 ring-2 ring-pink-200'
                : 'bg-white border-pink-200 opacity-90'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shadow-2xs shrink-0">
                <FlowerIllustration className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-pink-950 text-sm md:text-base">Gayane</span>
                  {currentTurnPlayerId === 'gayane' && !gameState.isGameOver && (
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-bold text-pink-600">
                  {gameState.scores.gayane} {gameState.scores.gayane === 1 ? 'punto' : 'puntos'}
                </div>
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black text-pink-600 px-2 py-0.5 bg-pink-100/80 rounded-lg">
              {gameState.scores.gayane}
            </div>
          </div>

          {/* Round Indicator & Progress */}
          <div className="col-span-2 sm:col-span-1 bg-white border border-sky-200 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-sky-700">Ronda actual</span>
              <span className="text-xs font-extrabold text-sky-900 bg-sky-100 px-2 py-0.5 rounded-md">
                {gameState.currentRoundIndex + 1} / 15
              </span>
            </div>
            <div className="my-1.5">
              <div className="text-base font-black text-sky-950 flex items-center justify-between">
                <span>Ronda {gameState.currentRoundIndex + 1} de 15</span>
              </div>
              <div className="w-full h-2 bg-sky-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${((gameState.currentRoundIndex + 1) / 15) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-[11px] text-sky-600 font-medium flex items-center justify-between">
              <span>{15 - (gameState.currentRoundIndex + 1)} restantes</span>
              <span>Turno {gameState.currentTurnInRound + 1} de 2</span>
            </div>
          </div>
        </div>

        {/* Praise Banner Popover */}
        {showPraiseBanner && (
          <div className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-amber-950 font-black text-center py-2.5 px-4 rounded-2xl shadow-md animate-bounce flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-100 fill-yellow-100" />
            <span className="text-base md:text-lg">{showPraiseBanner}</span>
            <Sparkles className="w-5 h-5 text-yellow-100 fill-yellow-100" />
          </div>
        )}

        {/* Active Game Stage vs Game Over */}
        {!gameState.isGameOver ? (
          <div className="flex flex-col gap-5">
            {/* Turn Banner */}
            <div
              className={`rounded-3xl p-4 md:p-5 border-3 transition-all duration-300 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 ${
                currentTurnPlayerId === 'razmik'
                  ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white border-orange-400'
                  : 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-pink-600 text-white border-pink-400'
              }`}
            >
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border-2 border-white/40 shadow-inner shrink-0">
                  {currentTurnPlayer.avatarIcon === 'football' ? (
                    <FootballIllustration className="w-10 h-10" />
                  ) : (
                    <FlowerIllustration className="w-10 h-10" />
                  )}
                </div>
                <div>
                  <div className="text-xs uppercase font-extrabold tracking-widest text-white/80">
                    {gameState.currentTurnInRound === 0 ? 'Primer lector de la ronda' : 'Segundo lector de la ronda'}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-xs">
                    Turno de {currentTurnPlayer.name}
                  </h2>
                </div>
              </div>

              {/* Tag or indicator */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/30 text-xs md:text-sm font-bold">
                <Flame className="w-4 h-4 text-yellow-200 fill-yellow-200" />
                <span>
                  {gameState.currentTurnInRound === 0
                    ? `Abre la ronda ${gameState.currentRoundIndex + 1}`
                    : `Cierra la ronda ${gameState.currentRoundIndex + 1}`}
                </span>
              </div>
            </div>

            {/* Trabalenguas Card Container */}
            <div className="bg-white rounded-3xl border-2 border-sky-200 shadow-lg p-5 md:p-8 flex flex-col items-center text-center relative overflow-hidden">
              {/* Background decorative corner element */}
              <div className="absolute top-3 right-4 opacity-15 pointer-events-none">
                <ThemeIcon icon={currentTrabalenguas.themeIcon} className="w-24 h-24" />
              </div>

              {!gameState.isCardRevealed ? (
                /* Card Closed State */
                <div className="py-8 md:py-12 flex flex-col items-center gap-4 max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-3xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center shadow-inner text-sky-600">
                    <ThemeIcon icon={currentTrabalenguas.themeIcon} className="w-12 h-12" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                      Ronda {gameState.currentRoundIndex + 1} de 15
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-2">
                      Trabalenguas preparado para {currentTurnPlayer.name}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-sm">
                      Pulsa el botón para descubrir el texto. Léelo con calma antes de empezar el cronómetro.
                    </p>
                  </div>

                  <button
                    onClick={handleRevealCard}
                    className={`mt-2 w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-lg md:text-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-white flex items-center justify-center gap-3 ${
                      currentTurnPlayerId === 'razmik'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-200'
                        : 'bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 shadow-pink-200'
                    }`}
                  >
                    <Eye className="w-6 h-6" />
                    <span>Mostrar trabalenguas</span>
                  </button>
                </div>
              ) : (
                /* Card Revealed State */
                <div className="w-full flex flex-col items-center gap-5">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="text-xs md:text-sm font-extrabold text-sky-800 bg-sky-100 border border-sky-300 px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                      <ThemeIcon icon={currentTrabalenguas.themeIcon} className="w-4 h-4" />
                      <span>{currentTrabalenguas.tag}</span>
                    </span>
                    <span className="text-xs md:text-sm font-extrabold text-slate-700 bg-slate-100 border border-slate-300 px-3.5 py-1 rounded-full">
                      #{gameState.currentRoundIndex + 1}: {currentTrabalenguas.title}
                    </span>
                  </div>

                  {/* Spanish Tongue Twister Text */}
                  <div className="w-full bg-sky-50/70 border-2 border-sky-100 rounded-2xl p-5 md:p-8">
                    <p className="text-xl md:text-3xl font-extrabold text-slate-900 leading-relaxed md:leading-loose tracking-wide">
                      {currentTrabalenguas.text}
                    </p>
                  </div>

                  {/* Armenian Translation Toggle Button */}
                  <div className="flex flex-col items-center gap-2 w-full max-w-xl">
                    <button
                      onClick={handleToggleTranslation}
                      className="px-4 py-2 text-xs md:text-sm font-bold text-sky-800 bg-white hover:bg-sky-50 border border-sky-300 rounded-xl transition shadow-2xs flex items-center gap-2"
                    >
                      {gameState.showArmenianTranslation ? (
                        <>
                          <EyeOff className="w-4 h-4 text-sky-600" />
                          <span>Ocultar traducción</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 text-sky-600" />
                          <span>Mostrar traducción</span>
                        </>
                      )}
                    </button>

                    {/* Armenian Translation Body */}
                    {gameState.showArmenianTranslation && (
                      <div className="w-full bg-amber-50/90 border border-amber-300 rounded-2xl p-4 md:p-5 text-center shadow-xs animate-fadeIn">
                        <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-800 block mb-1">
                          Հայերեն թարգմանություն (բնական իմաստով)
                        </span>
                        <p className="text-sm md:text-base font-semibold text-amber-950 leading-relaxed font-sans">
                          {currentTrabalenguas.translationArmenian}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stopwatch Section */}
            {gameState.isCardRevealed && (
              <div className="bg-white rounded-3xl border-2 border-sky-200 shadow-md p-5 md:p-7 flex flex-col items-center">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>Cronómetro de {currentTurnPlayer.name}</span>
                </div>

                {/* Big Digital Display */}
                <div className="relative my-2 px-6 py-3 rounded-2xl bg-slate-900 border-4 border-slate-800 shadow-inner flex items-center justify-center min-w-[260px] md:min-w-[320px]">
                  <span className="font-mono text-4xl md:text-6xl font-black text-amber-400 tracking-wider">
                    {formatTimeHundredths(displayElapsedMs)}
                  </span>

                  {/* Paused Banner indicator */}
                  {gameState.stopwatchStatus === 'paused' && (
                    <span className="absolute -top-3.5 bg-amber-500 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full shadow-md animate-pulse uppercase tracking-wider">
                      En pausa
                    </span>
                  )}
                  {gameState.stopwatchStatus === 'running' && (
                    <span className="absolute -top-3.5 bg-emerald-500 text-white text-xs font-black px-3 py-0.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      Leyendo
                    </span>
                  )}
                  {gameState.stopwatchStatus === 'finished' && (
                    <span className="absolute -top-3.5 bg-sky-500 text-white text-xs font-black px-3 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                      Completado
                    </span>
                  )}
                </div>

                {/* Stopwatch Action Controls */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-lg">
                  {/* EMPEZAR button (when idle) */}
                  {gameState.stopwatchStatus === 'idle' && (
                    <button
                      onClick={handleStartStopwatch}
                      className="flex-1 min-w-[160px] py-3.5 px-6 rounded-2xl font-black text-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <Play className="w-5 h-5 fill-white" />
                      <span>Empezar</span>
                    </button>
                  )}

                  {/* PAUSAR button (when running) */}
                  {gameState.stopwatchStatus === 'running' && (
                    <button
                      onClick={handlePauseStopwatch}
                      className="flex-1 min-w-[140px] py-3.5 px-5 rounded-2xl font-black text-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Pause className="w-5 h-5 fill-slate-950" />
                      <span>Pausar</span>
                    </button>
                  )}

                  {/* CONTINUAR button (when paused) */}
                  {gameState.stopwatchStatus === 'paused' && (
                    <button
                      onClick={handleContinueStopwatch}
                      className="flex-1 min-w-[140px] py-3.5 px-5 rounded-2xl font-black text-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5 fill-white" />
                      <span>Continuar</span>
                    </button>
                  )}

                  {/* TERMINAR button (when running or paused) */}
                  {(gameState.stopwatchStatus === 'running' || gameState.stopwatchStatus === 'paused') && (
                    <button
                      onClick={handleFinishTurn}
                      className="flex-1 min-w-[140px] py-3.5 px-5 rounded-2xl font-black text-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Terminar</span>
                    </button>
                  )}

                  {/* REINTENTAR button */}
                  <button
                    onClick={handleRetryTurn}
                    disabled={gameState.stopwatchStatus === 'idle' && displayElapsedMs === 0}
                    className="py-3 px-4 rounded-2xl font-bold text-sm bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-300 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                    title="Reiniciar el tiempo de este turno"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reintentar</span>
                  </button>

                  {/* SIGUIENTE TURNO button (only available once player finishes) */}
                  {gameState.stopwatchStatus === 'finished' && (
                    <button
                      onClick={handleNextTurn}
                      className={`w-full sm:w-auto flex-1 min-w-[200px] py-3.5 px-6 rounded-2xl font-black text-lg text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 ${
                        currentTurnPlayerId === 'razmik'
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-300'
                          : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-pink-300'
                      }`}
                    >
                      <span>Siguiente turno</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Subtext info */}
                <div className="mt-3 text-xs text-slate-500 font-medium text-center">
                  {gameState.stopwatchStatus === 'idle' && 'Presiona «Empezar» cuando estés listo para comenzar a leer.'}
                  {gameState.stopwatchStatus === 'running' && 'Lee con claridad. Pulsa «Terminar» al acabar la última palabra.'}
                  {gameState.stopwatchStatus === 'paused' && 'Cronómetro detenido. El tiempo de pausa no se contabiliza.'}
                  {gameState.stopwatchStatus === 'finished' && (
                    <span className="text-emerald-700 font-bold">
                      ¡Tiempo guardado: {formatTimeHundredths(displayElapsedMs)}! Pulsa «Siguiente turno» para continuar o «Reintentar» para repetir.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Final Results Screen after 15 Rounds */
          <div className="bg-white rounded-3xl border-3 border-sky-300 shadow-xl p-6 md:p-10 flex flex-col items-center text-center">
            <div className="p-3 bg-amber-100 rounded-3xl shadow-inner mb-3">
              <TrophyIllustration className="w-20 h-20 md:w-24 md:h-24" />
            </div>

            <span className="text-xs uppercase font-black tracking-widest text-sky-700 bg-sky-100 px-4 py-1 rounded-full border border-sky-300">
              ¡Partida finalizada! (15 de 15 Rondas)
            </span>

            {/* Winner Announcement */}
            {gameState.scores.razmik > gameState.scores.gayane ? (
              <div className="mt-3">
                <h2 className="text-3xl md:text-5xl font-black text-orange-600 tracking-tight">
                  ¡Felicidades Razmik! 🏆
                </h2>
                <p className="text-slate-600 text-sm md:text-base font-semibold mt-1">
                  ¡Gran campeón de trabalenguas con {gameState.scores.razmik} puntos! ¡Buen trabajo!
                </p>
              </div>
            ) : gameState.scores.gayane > gameState.scores.razmik ? (
              <div className="mt-3">
                <h2 className="text-3xl md:text-5xl font-black text-pink-600 tracking-tight">
                  ¡Felicidades Gayane! 🏆
                </h2>
                <p className="text-slate-600 text-sm md:text-base font-semibold mt-1">
                  ¡Gran campeona de trabalenguas con {gameState.scores.gayane} puntos! ¡Buen trabajo!
                </p>
              </div>
            ) : (
              <div className="mt-3">
                <h2 className="text-3xl md:text-5xl font-black text-indigo-600 tracking-tight">
                  ¡Empate legendario! 🤝
                </h2>
                <p className="text-slate-600 text-sm md:text-base font-semibold mt-1">
                  ¡Tanto Razmik como Gayane han obtenido {gameState.scores.razmik} puntos! ¡Cada vez mejor!
                </p>
              </div>
            )}

            {/* Score & Time Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl my-6">
              {/* Razmik Summary */}
              <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-4 text-left shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <FootballIllustration className="w-8 h-8" />
                  <div>
                    <h4 className="font-black text-orange-950 text-lg">Razmik</h4>
                    <span className="text-xs text-orange-700 font-bold">15 trabalenguas leídos</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-3 border-t border-orange-200 pt-2">
                  <span className="text-xs font-bold text-orange-800">Puntos totales:</span>
                  <span className="text-2xl font-black text-orange-600">{gameState.scores.razmik} pts</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xs font-bold text-orange-800">Tiempo acumulado:</span>
                  <span className="text-sm font-mono font-black text-orange-950">
                    {formatTimeHundredths(totalRazmikMs)}
                  </span>
                </div>
              </div>

              {/* Gayane Summary */}
              <div className="bg-pink-50 border-2 border-pink-300 rounded-2xl p-4 text-left shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <FlowerIllustration className="w-8 h-8" />
                  <div>
                    <h4 className="font-black text-pink-950 text-lg">Gayane</h4>
                    <span className="text-xs text-pink-700 font-bold">15 trabalenguas leídos</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-3 border-t border-pink-200 pt-2">
                  <span className="text-xs font-bold text-pink-800">Puntos totales:</span>
                  <span className="text-2xl font-black text-pink-600">{gameState.scores.gayane} pts</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xs font-bold text-pink-800">Tiempo acumulado:</span>
                  <span className="text-sm font-mono font-black text-pink-950">
                    {formatTimeHundredths(totalGayaneMs)}
                  </span>
                </div>
              </div>
            </div>

            {/* Complete 15 Rounds History Table */}
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-sky-200 shadow-xs mb-6 text-left">
              <div className="bg-sky-100 px-4 py-2.5 font-black text-xs md:text-sm text-sky-950 uppercase tracking-wide flex items-center justify-between">
                <span>Tabla de las 15 Rondas</span>
                <span className="text-xs text-sky-700 font-normal">Comparación exacta por centésimas</span>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead className="bg-sky-50 text-sky-900 border-b border-sky-200 sticky top-0 font-bold">
                    <tr>
                      <th className="py-2 px-3 text-left">Ronda</th>
                      <th className="py-2 px-3 text-left">Trabalenguas</th>
                      <th className="py-2 px-3 text-center text-orange-700">Razmik</th>
                      <th className="py-2 px-3 text-center text-pink-700">Gayane</th>
                      <th className="py-2 px-3 text-center">Ganador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100 bg-white">
                    {gameState.completedRounds.map((r) => (
                      <tr key={r.roundNumber} className="hover:bg-sky-50/50">
                        <td className="py-2 px-3 font-bold text-slate-700">#{r.roundNumber}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {r.trabalenguas.title}
                        </td>
                        <td className={`py-2 px-3 text-center font-mono font-bold ${
                          r.winner === 'razmik' ? 'text-orange-600 bg-orange-50/60 font-black' : 'text-slate-700'
                        }`}>
                          {r.razmikTimeMs !== null ? formatTimeHundredths(r.razmikTimeMs) : '-'}
                        </td>
                        <td className={`py-2 px-3 text-center font-mono font-bold ${
                          r.winner === 'gayane' ? 'text-pink-600 bg-pink-50/60 font-black' : 'text-slate-700'
                        }`}>
                          {r.gayaneTimeMs !== null ? formatTimeHundredths(r.gayaneTimeMs) : '-'}
                        </td>
                        <td className="py-2 px-3 text-center font-bold">
                          {r.winner === 'razmik' && (
                            <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full text-xs">
                              🏆 Razmik
                            </span>
                          )}
                          {r.winner === 'gayane' && (
                            <span className="inline-flex items-center gap-1 text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full text-xs">
                              🏆 Gayane
                            </span>
                          )}
                          {r.winner === 'tie' && (
                            <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full text-xs">
                              🤝 Empate
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Play Again Button */}
            <button
              onClick={handleRestartGame}
              className="px-8 py-4 rounded-2xl font-black text-lg md:text-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-3"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Jugar otra vez</span>
            </button>
          </div>
        )}
      </main>

      {/* Side-by-side Round Summary Modal (after both players complete current round) */}
      {gameState.showingRoundSummaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-3 border-sky-300 shadow-2xl max-w-lg w-full p-6 md:p-8 flex flex-col items-center text-center animate-scaleUp">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mb-3">
              <ThemeIcon icon={currentTrabalenguas.themeIcon} className="w-10 h-10" />
            </div>

            <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-0.5 rounded-full">
              ¡Ronda {gameState.currentRoundIndex + 1} completada!
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
              {currentTrabalenguas.title}
            </h3>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Ambos jugadores han completado el mismo trabalenguas.
            </p>

            {/* Side-by-side result cards */}
            {(() => {
              const lastRound = gameState.completedRounds[gameState.completedRounds.length - 1];
              if (!lastRound) return null;

              const isRazmikWinner = lastRound.winner === 'razmik';
              const isGayaneWinner = lastRound.winner === 'gayane';
              const isTie = lastRound.winner === 'tie';

              return (
                <div className="w-full my-5 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Razmik Result */}
                    <div
                      className={`p-4 rounded-2xl border-2 text-left relative transition-all ${
                        isRazmikWinner
                          ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {isRazmikWinner && (
                        <span className="absolute -top-3 right-3 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                          +1 Punto 🏆
                        </span>
                      )}
                      {isTie && (
                        <span className="absolute -top-3 right-3 bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                          +1 Punto
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 mb-1">
                        <FootballIllustration className="w-5 h-5" />
                        <span className="font-extrabold text-orange-950 text-sm">Razmik</span>
                      </div>
                      <div className="font-mono text-xl md:text-2xl font-black text-orange-600">
                        {lastRound.razmikTimeMs !== null ? formatTimeHundredths(lastRound.razmikTimeMs) : '-'}
                      </div>
                    </div>

                    {/* Gayane Result */}
                    <div
                      className={`p-4 rounded-2xl border-2 text-left relative transition-all ${
                        isGayaneWinner
                          ? 'bg-pink-50 border-pink-400 ring-2 ring-pink-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {isGayaneWinner && (
                        <span className="absolute -top-3 right-3 bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                          +1 Punto 🏆
                        </span>
                      )}
                      {isTie && (
                        <span className="absolute -top-3 right-3 bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                          +1 Punto
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 mb-1">
                        <FlowerIllustration className="w-5 h-5" />
                        <span className="font-extrabold text-pink-950 text-sm">Gayane</span>
                      </div>
                      <div className="font-mono text-xl md:text-2xl font-black text-pink-600">
                        {lastRound.gayaneTimeMs !== null ? formatTimeHundredths(lastRound.gayaneTimeMs) : '-'}
                      </div>
                    </div>
                  </div>

                  {/* Winner Banner */}
                  <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-xs md:text-sm font-bold text-sky-900 flex items-center justify-center gap-2">
                    <Medal className="w-4 h-4 text-amber-500" />
                    <span>
                      {isRazmikWinner && '¡Razmik consigue el punto por menor tiempo!'}
                      {isGayaneWinner && '¡Gayane consigue el punto por menor tiempo!'}
                      {isTie && '¡Tiempos exactamente iguales! ¡1 punto para cada jugador!'}
                    </span>
                  </div>

                  {/* Score update badge */}
                  <div className="flex items-center justify-center gap-4 text-xs font-extrabold text-slate-700">
                    <span>
                      Marcador: <strong className="text-orange-600">{gameState.scores.razmik}</strong> (Razmik) -{' '}
                      <strong className="text-pink-600">{gameState.scores.gayane}</strong> (Gayane)
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Next Round Action */}
            <button
              onClick={handleProceedToNextRound}
              className="w-full py-4 px-6 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 shadow-lg shadow-sky-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <span>
                {gameState.currentRoundIndex + 1 < 15
                  ? `Siguiente ronda (Ronda ${gameState.currentRoundIndex + 2} de 15)`
                  : 'Ver resultados finales de la partida'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer info */}
      <footer className="mt-auto pt-6 text-center text-xs text-sky-800/80 max-w-md mx-auto px-4">
        <p className="font-medium">
          «¡Trabalenguas por turnos!» • 15 trabalenguas • 30 turnos • Para Razmik y Gayane
        </p>
      </footer>
    </div>
  );
}
