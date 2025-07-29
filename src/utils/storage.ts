/**
 * STORAGE includes all utils to load, store, and reset game state data.
 */

import { GameState, loadLevel, LevelStage } from '@/utils/levels';

const GAMESTATE_KEY = 'gameState'; // local storage

export const loadGameState = (): GameState | undefined => {
  const savedGameState = localStorage.getItem(GAMESTATE_KEY);
  if (savedGameState) {
    const gameState = JSON.parse(savedGameState);
    // Ensure customLevel is initialized for older saves
    if (!gameState.customLevel) {
      const { Message } = require('@/utils/message');
      const { SYSTEM_CHARACTER } = require('@/constants/characters');
      gameState.customLevel = {
          messages: [
            new Message({
              sender: SYSTEM_CHARACTER,
              content: `Training protocol initiated. Fred, respond with a test question for human detection calibration.`,
            }),
          ],
          stage: LevelStage.question,
          customQuestion: '',
          answers: [],
          votes: [],
        };
    }
    return gameState;
  }
};

export const saveGameState = (gameState: GameState): void => {
  localStorage.setItem(GAMESTATE_KEY, JSON.stringify(gameState));
};

export const resetGameState = (): GameState => {
  localStorage.clear();
  window.location.reload();
  return loadLevel(0);
};

export function scrollToBottom() {
  // Find all chat scroll containers and scroll them to bottom
  const chatContainers = document.querySelectorAll('[data-chat-scroll]');
  chatContainers.forEach((container) => {
    if (container instanceof HTMLElement) {
      container.scrollTop = container.scrollHeight;
    }
  });
  
  // Also set localStorage for compatibility
  localStorage.setItem('scrollTop', '999999');
}
