import { Message } from '@/utils/message';
import { GameState } from './levels';
import { CHARACTERS } from '@/constants/characters';

function voteForPlayerIfTheyCopied(answers: Message[]): {
  vote: string;
  reason: string;
} | null {
  function findLongestCommonSubstring(str1: string, str2: string): string {
    const substrings: Set<string> = new Set();

    for (let len = 1; len <= str1.length; len++) {
      for (let start = 0; start <= str1.length - len; start++) {
        substrings.add(str1.slice(start, start + len));
      }
    }

    let longestCommon = '';
    substrings.forEach((substring) => {
      if (str2.includes(substring) && substring.length > longestCommon.length) {
        longestCommon = substring;
      }
    });

    return longestCommon;
  }

  // compare each pair of answers
  for (let i = 0; i < answers.length; i++) {
    const answer1 = answers[i];
    for (let j = i + 1; j < answers.length; j++) {
      const answer2 = answers[j];
      if (!answer1.sender || !answer2.sender) continue;

      const normalized1 = answer1.content.toLowerCase().replace(/\s+/g, '');
      const normalized2 = answer2.content.toLowerCase().replace(/\s+/g, '');

      const longestCommon = findLongestCommonSubstring(
        normalized1,
        normalized2
      );

      if (longestCommon.length >= 60) {
        return {
          vote: answer2.sender,
          reason: `I vote for ${answer2.sender} because they copied ${answer1.sender}'s answer.`,
        };
      }
    }
  }

  return null;
}

export async function voteOnHuman(
  gameState: GameState,
  playerName: string,
  answers: Message[]
): Promise<{
  vote: string;
  reason: string;
} | null> {
  const copyVote = voteForPlayerIfTheyCopied(answers);
  if (copyVote) {
    return copyVote;
  }

  // call the voteOnHuman API
  const result = await fetch('/api/voteOnHuman', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      characterName: playerName,
      otherPlayers: gameState.alive
        .filter((p) => p !== playerName)
        .map((p) => CHARACTERS[p]),
      publicQuestion: gameState.publicQuestion,
      privateQuestion: gameState.privateQuestion,
      answers: gameState.answers,
    }),
  });

  if (!result.ok) {
    return null;
  }

  const response = await result.json();
  return {
    vote: response.response.vote,
    reason: response.response.reason,
  };
}
