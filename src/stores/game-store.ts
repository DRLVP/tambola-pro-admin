import { create } from 'zustand';
import type { Game, Ticket, GameRule, GameWinner } from '@/types';
import { areAllRulesCompleted } from '@/lib/game-rules';

interface GameState {
  // State
  currentGame: Game | null;
  myTickets: Ticket[];
  calledNumbers: number[];
  markedNumbers: Set<number>;
  lastCalledNumber: number | null;
  completedRuleIds: Set<string>;
  winners: GameWinner[];

  // Computed
  isGameActive: boolean;
  isGameComplete: boolean;

  // Actions
  setCurrentGame: (game: Game | null) => void;
  setMyTickets: (tickets: Ticket[]) => void;
  addCalledNumber: (number: number) => void;
  markNumber: (number: number) => void;
  markRuleCompleted: (ruleId: string, winner: GameWinner) => void;
  updateRules: (rules: GameRule[]) => void;
  addWinner: (winner: GameWinner) => void;
  checkGameCompletion: () => boolean;
  resetGame: () => void;
}

const initialState = {
  currentGame: null,
  myTickets: [],
  calledNumbers: [],
  markedNumbers: new Set<number>(),
  lastCalledNumber: null,
  completedRuleIds: new Set<string>(),
  winners: [],
  isGameActive: false,
  isGameComplete: false,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setCurrentGame: (game) => {
    const completedRuleIds = new Set<string>();
    const winners: GameWinner[] = [];

    // Initialize completed rules and winners from game data
    if (game?.rules) {
      game.rules.forEach(rule => {
        if (rule.isCompleted) {
          completedRuleIds.add(rule.id);
        }
      });
    }

    if (game?.winners) {
      winners.push(...game.winners);
    }

    set({
      currentGame: game,
      calledNumbers: game?.calledNumbers || [],
      lastCalledNumber: game?.calledNumbers?.length
        ? game.calledNumbers[game.calledNumbers.length - 1]
        : null,
      isGameActive: game?.status === 'active',
      isGameComplete: game?.status === 'completed',
      completedRuleIds,
      winners,
    });
  },

  setMyTickets: (tickets) => set({ myTickets: tickets }),

  addCalledNumber: (number) => {
    const { calledNumbers, currentGame } = get();
    if (!calledNumbers.includes(number)) {
      const newCalledNumbers = [...calledNumbers, number];

      set({
        calledNumbers: newCalledNumbers,
        lastCalledNumber: number,
        currentGame: currentGame ? {
          ...currentGame,
          calledNumbers: newCalledNumbers,
        } : null,
      });
    }
  },

  markNumber: (number) => {
    const { markedNumbers } = get();
    const newSet = new Set(markedNumbers);
    if (newSet.has(number)) {
      newSet.delete(number);
    } else {
      newSet.add(number);
    }
    set({ markedNumbers: newSet });
  },

  markRuleCompleted: (ruleId, winner) => {
    const { completedRuleIds, winners, currentGame } = get();
    const newCompletedRuleIds = new Set(completedRuleIds);
    newCompletedRuleIds.add(ruleId);

    const newWinners = [...winners, winner];

    // Update the rule in currentGame
    let updatedGame = currentGame;
    if (currentGame) {
      updatedGame = {
        ...currentGame,
        rules: currentGame.rules.map(rule =>
          rule.id === ruleId
            ? {
              ...rule, isCompleted: true, winner: {
                userId: winner.userId,
                userName: winner.userName,
                ticketId: winner.ticketId,
                claimedAt: winner.claimedAt,
              }
            }
            : rule
        ),
        winners: newWinners,
      };
    }

    set({
      completedRuleIds: newCompletedRuleIds,
      winners: newWinners,
      currentGame: updatedGame,
    });

    // Check if game should be marked complete
    get().checkGameCompletion();
  },

  updateRules: (rules) => {
    const { currentGame } = get();
    if (currentGame) {
      set({
        currentGame: {
          ...currentGame,
          rules,
        },
      });
    }
  },

  addWinner: (winner) => {
    const { winners } = get();
    set({ winners: [...winners, winner] });
  },

  checkGameCompletion: () => {
    const { currentGame } = get();
    if (!currentGame) return false;

    const allComplete = areAllRulesCompleted(currentGame.rules);

    if (allComplete && currentGame.status === 'active') {
      set({
        isGameComplete: true,
        isGameActive: false,
        currentGame: {
          ...currentGame,
          status: 'completed',
          endedAt: new Date().toISOString(),
        },
      });
    }

    return allComplete;
  },

  resetGame: () => set(initialState),
}));

// Selector hooks for optimized re-renders
export const useCurrentGame = () => useGameStore((state) => state.currentGame);
export const useMyTickets = () => useGameStore((state) => state.myTickets);
export const useCalledNumbers = () => useGameStore((state) => state.calledNumbers);
export const useMarkedNumbers = () => useGameStore((state) => state.markedNumbers);
export const useLastCalledNumber = () => useGameStore((state) => state.lastCalledNumber);
export const useIsGameActive = () => useGameStore((state) => state.isGameActive);
export const useIsGameComplete = () => useGameStore((state) => state.isGameComplete);
export const useCompletedRuleIds = () => useGameStore((state) => state.completedRuleIds);
export const useWinners = () => useGameStore((state) => state.winners);

// Derived selectors
export const useGameRules = () => useGameStore((state) => state.currentGame?.rules || []);
export const useUncompletedRules = () => useGameStore((state) =>
  (state.currentGame?.rules || []).filter(rule => !rule.isCompleted)
);
export const useSortedWinners = () => useGameStore((state) =>
  [...state.winners].sort((a, b) => a.rank - b.rank)
);

// Action hooks
export const useGameActions = () => useGameStore((state) => ({
  setCurrentGame: state.setCurrentGame,
  setMyTickets: state.setMyTickets,
  addCalledNumber: state.addCalledNumber,
  markNumber: state.markNumber,
  markRuleCompleted: state.markRuleCompleted,
  updateRules: state.updateRules,
  addWinner: state.addWinner,
  checkGameCompletion: state.checkGameCompletion,
  resetGame: state.resetGame,
}));

export default useGameStore;
