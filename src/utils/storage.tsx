/**
 * STORAGE includes all utils to load, store, and reset game state data.
 */

import { GameState, loadLevel } from '@/utils/levels';

const GAMESTATE_KEY = 'gameState'; // local storage

export const loadInitialGameState = (): GameState => {
  try {
    const savedGameState = localStorage.getItem(GAMESTATE_KEY);
    if (!savedGameState) {
      return loadLevel(0);
    }
    return JSON.parse(savedGameState);
  } catch (e) {
    console.error('Error loading game state:', e);
    return loadLevel(0);
  }
};

export const saveGameState = (gameState: GameState): void => {
  localStorage.setItem(GAMESTATE_KEY, JSON.stringify(gameState));
};

export const resetGameState = (): GameState => {
  localStorage.clear();
  return loadLevel(0);
};

export function scrollToBottom() {
  localStorage.setItem('scrollTop', '999999');
}
