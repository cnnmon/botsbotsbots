'use client';
import { useEffect, useRef } from 'react';
import Chat from '@/components/Chat';
import { LevelStage, GameState } from '@/utils/levels';
import { Message } from '@/utils/message';
import { YOU_CHARACTER, GAME_PLAYER_NAMES } from '@/constants/characters';
import { answerQuestion } from '@/utils/answer';

export default function CustomLevel({
  openWindow,
  gameState,
  startCustomLevel,
  sendCustomMessage,
}: {
  openWindow: (name: string) => void;
  gameState: GameState;
  startCustomLevel: (customQuestion: string) => void;
  sendCustomMessage: (message: Message) => void;
}) {
  const customLevel = gameState.customLevel;
  const isGeneratingAnswers = useRef(false);

  // Initialize custom level if needed
  useEffect(() => {
    if (!customLevel.messages.length) {
      startCustomLevel('');
    }
  }, []);

  // Handle bot answer generation when stage changes to answer and we have a question
  useEffect(() => {
    if (
      customLevel.stage === LevelStage.answer &&
      customLevel.customQuestion &&
      customLevel.answers.length === 0 &&
      !isGeneratingAnswers.current
    ) {
      isGeneratingAnswers.current = true;
      generateBotAnswers().finally(() => {
        isGeneratingAnswers.current = false;
      });
    }
  }, [
    customLevel.stage,
    customLevel.customQuestion,
    customLevel.answers.length,
  ]);

  // Voting stage is now handled in the main game manager (like regular levels)

  const generateBotAnswers = async () => {
    for (const playerName of GAME_PLAYER_NAMES) {
      if (playerName === YOU_CHARACTER) {
        continue;
      }

      const result = await answerQuestion(
        {
          ...gameState,
          publicQuestion: customLevel.customQuestion,
          privateQuestion: '',
        },
        playerName
      );

      if (!result) {
        sendCustomMessage(
          new Message({
            sender: playerName,
            content: 'I am unable to answer this question.',
          })
        );
      } else {
        sendCustomMessage(
          new Message({
            sender: playerName,
            content: result,
          })
        );
      }
    }
  };

  const handleAddMessage = (message: Message) => {
    sendCustomMessage(message);
  };

  const handleRestartCustom = () => {
    startCustomLevel('');
  };

  const handleNextLevel = () => {
    // For custom level, just restart
    handleRestartCustom();
  };

  return (
    <Chat
      messages={customLevel.messages}
      addMessage={handleAddMessage}
      openWindow={openWindow}
      stage={customLevel.stage}
      handleStartLevel={() => {}} // Not used in custom level
      handleRestartLevel={handleRestartCustom}
      handleNextLevel={handleNextLevel}
      currentLevel={-1} // Custom level indicator
      totalLevels={0} // Not applicable for custom level
    />
  );
}
