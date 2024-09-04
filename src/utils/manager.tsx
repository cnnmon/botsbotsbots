/**
 * MANAGER provides game manager utils atop the game state reducer.
 */

import { answerQuestion, voteOnHuman } from '@/utils/bots';
import {
  CHARACTERS,
  GamePlayerName,
  SYSTEM_CHARACTER,
  YOU_CHARACTER,
} from '@/constants/characters';
import { useReducer } from 'react';
import { Message } from '@/utils/message';
import { scrollToBottom } from '@/utils/storage';
import { Action, gameReducer } from '@/utils/state';
import {
  GameElement,
  GameState,
  LEVELS,
  LevelStage,
  loadLevel,
} from '@/utils/levels';

export default function useGameManager() {
  const [gameState, dispatch] = useReducer(gameReducer, loadLevel(0));

  const setGameState = (newState: GameState) => {
    dispatch({ type: Action.SET_GAME_STATE, payload: newState });
  };

  const openWindow = (name: string) => {
    if (!gameState.windows.includes(name)) {
      dispatch({ type: Action.OPEN_WINDOW, payload: name });
    }
  };

  const exitWindow = (name: string) => {
    dispatch({ type: Action.EXIT_WINDOW, payload: name });
  };

  const sendMessage = (message: Message) => {
    dispatch({
      type: Action.SEND_MESSAGE,
      payload: message,
    });
    scrollToBottom();
  };

  const setStage = (stage: LevelStage) => {
    dispatch({ type: Action.SET_STAGE, payload: stage });
  };

  const resetGame = () => {
    dispatch({ type: Action.RESET_GAME });
  };

  const restartLevel = () => {
    dispatch({ type: Action.RESTART_LEVEL });
  };

  const endLevel = (mostVotedPlayerName: GamePlayerName | null) => {
    dispatch({ type: Action.END_LEVEL, payload: mostVotedPlayerName });
  };

  const commit = () => {
    dispatch({ type: Action.COMMIT });
  };

  const handleStartLevel = async () => {
    // put the player in an intermediate state where they can't perform any action while async stuff is happening
    setStage(LevelStage.waiting);

    // on "acknowledgement"
    gameState.alive.forEach((playerName) => {
      sendMessage(
        new Message({
          content: `${playerName} has acknowledged.`,
        })
      );
    });

    // ask a question
    setStage(LevelStage.answer);
    const currentLevel = LEVELS[gameState.level];
    const randomChars = ['⣿', '▇', '▓', '▒', '░', '█', '▄', '▁', ' '];
    const censoredText: string = Array.from({
      length: 8 + Math.floor(Math.random() * 8),
    })
      .map(() => randomChars[Math.floor(Math.random() * randomChars.length)])
      .join('');

    if (currentLevel.public.includes(GameElement.question)) {
      sendMessage(
        new Message({
          sender: SYSTEM_CHARACTER,
          content: `Please answer the following question: ${gameState.publicQuestion}`,
        })
      );
    }

    if (currentLevel.private.includes(GameElement.question)) {
      sendMessage(
        new Message({
          sender: SYSTEM_CHARACTER,
          content: `The following question is written only in a language bots can understand: ${censoredText}`,
        })
      );
    }

    if (currentLevel.private.includes(GameElement.behavior)) {
      sendMessage(
        new Message({
          sender: SYSTEM_CHARACTER,
          content: `There is also an extra instruction written only in a language bots can understand: ${censoredText}`,
        })
      );
    }

    // start answering the question
    for (let i = 0; i < gameState.alive.length; i++) {
      const playerName = gameState.alive[i];
      if (playerName === YOU_CHARACTER) {
        continue;
      }

      const response = await answerQuestion(
        CHARACTERS[playerName],
        gameState.publicQuestion,
        gameState.privateQuestion,
        gameState.answers
      );

      if (!response) {
        sendMessage(
          new Message({
            sender: playerName,
            content: 'I am unable to answer this question.',
          })
        );
      } else {
        sendMessage(
          new Message({
            sender: playerName,
            content: response,
          })
        );
      }
    }

    // save once all generations are in
    commit();
  };

  const handleStartVoting = async () => {
    setStage(LevelStage.waiting);
    sendMessage(
      new Message({
        sender: SYSTEM_CHARACTER,
        content: `All answers have been submitted. Please vote for the player you think is the human.`,
      })
    );

    for (let i = 0; i < gameState.alive.length; i++) {
      const playerName = gameState.alive[i];
      if (playerName === YOU_CHARACTER) {
        continue;
      }

      const response = await voteOnHuman(
        CHARACTERS[playerName],
        gameState.alive
          .filter((p) => p !== playerName)
          .map((p) => CHARACTERS[p]),
        gameState.publicQuestion,
        gameState.answers
      );

      if (!response) {
        sendMessage(
          new Message({
            sender: playerName,
            content: 'I am unable to vote.',
          })
        );
        continue;
      }

      sendMessage(
        new Message({
          sender: playerName,
          content: `I vote for ${response.vote.name}. ${response.reason}`,
          metadata: {
            vote: response.vote,
          },
        })
      );
    }

    // save once all generations are in
    commit();
  };

  const handleEndLevel = () => {
    // tally votes
    const voteCounts = {} as Record<string, number>;
    let maxVote = 0;
    let votedPlayer: GamePlayerName | null = YOU_CHARACTER;
    let votedPlayerThatIsNotYou: GamePlayerName = gameState.alive.find(
      (name) => name !== votedPlayer
    )!;

    for (const vote of gameState.votes) {
      if (!vote.metadata) {
        continue;
      }

      const name = vote.metadata.vote.name;
      voteCounts[name] = (voteCounts[name] || 0) + 1;

      if (voteCounts[name] > maxVote) {
        maxVote = voteCounts[name];
        votedPlayer = name;
        if (name !== YOU_CHARACTER) {
          votedPlayerThatIsNotYou = name;
        }
      }
    }

    // send your "vote" automatically, which is either the most voted player (eliminating them) or the second most voted player
    sendMessage(
      new Message({
        sender: YOU_CHARACTER,
        content: `I vote for ${votedPlayerThatIsNotYou}.`,
        metadata: {
          vote: CHARACTERS[votedPlayerThatIsNotYou],
        },
      })
    );

    if (votedPlayer === YOU_CHARACTER) {
      if (voteCounts[votedPlayerThatIsNotYou] + 1 > maxVote) {
        // your vote swayed the decision!
        votedPlayer = votedPlayerThatIsNotYou;
      } else if (voteCounts[votedPlayerThatIsNotYou] + 1 == maxVote) {
        // there is a tie
        votedPlayer = null;
      }
    }

    // eliminate the player with the most votes
    endLevel(votedPlayer);

    // save once all generations are in
    commit();
  };

  return {
    gameState,
    setGameState,
    openWindow,
    exitWindow,
    handleStartLevel,
    handleStartVoting,
    handleEndLevel,
    sendMessage,
    resetGame,
    restartLevel,
  };
}
