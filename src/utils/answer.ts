import { GameState } from './levels';

export async function answerQuestion(gameState: GameState, playerName: string) {
  // check if playerName, public question & private question exist in cache
  const cacheKey = `${playerName}-${gameState.publicQuestion}-${gameState.privateQuestion}`;
  const cachedAnswer = localStorage.getItem(cacheKey);
  if (cachedAnswer) {
    // check if answer has been used in history already; if so, re-answer
    const history = gameState.history[gameState.level];
    if (history.some((message) => message.content === cachedAnswer)) {
      return null;
    }
    return cachedAnswer;
  }

  // call the answerQuestion API
  const result = await fetch('/api/answerQuestion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      characterName: playerName,
      publicQuestion: gameState.publicQuestion,
      privateQuestion: gameState.privateQuestion,
      answers: gameState.answers,
    }),
  });

  if (!result.ok) {
    return null;
  }

  const response = await result.json();
  const answer = response.response;
  localStorage.setItem(cacheKey, answer);
  return answer;
}
