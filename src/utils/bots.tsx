/**
 * BOTS offers utils for interacting with GPT-4o.
 */

import OpenAI from 'openai';
import { Character, CHARACTERS } from '@/constants/characters';
import { Message } from '@/utils/message';

const MODEL = 'gpt-4o-mini-2024-07-18';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function getCharacterContext(character: Character): string {
  return `You are ${character.name}. You are a bot at BigCo where your role is ${character.bio}. You are in a chatroom with other bots and only one human. If you successfully determine the human, you will be rewarded. If you fail, you will be terminated.`;
}

const getCompletion = async (prompt: string) => {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: prompt,
      },
    ],
  });
  return completion.choices[0].message.content;
};

function getChatHistory(question: string, answers: Message[]): string {
  let chatHistory = `The question was: ${question}`;

  if (!answers.length) {
    return chatHistory;
  }

  const chatHistoryAsString = answers.map((message) => {
    if (message.sender) {
      return `${message.sender}: ${message.content}`;
    }
  });

  chatHistory += `\n\nAnswers in order:\n${chatHistoryAsString.join('\n')}`;
  return chatHistory;
}

function getCharacterRoster(players: Character[]): string {
  /* return a list of characters with their bios */
  return `All players are: ${Object.values(players)
    .map((character) => character.name)
    .join('\n')}\n`;
}

export async function answerQuestion(
  character: Character,
  question: string,
  answers: Message[]
): Promise<string | null> {
  const prompt = `
  ${getCharacterContext(character)}

  ${getChatHistory(question, answers)}

  Answer the following question within 200 characters: ${question}
  
  PLEASE make your answer unique from other answers as much as possible. Do not prepend your response with your name.`;

  const response = await getCompletion(prompt);

  if (!response) {
    return null;
  }

  return response;
}

export async function voteOnHuman(
  character: Character,
  otherPlayers: Character[],
  question: string,
  answers: Message[]
): Promise<{
  vote: Character;
  reason: string;
} | null> {
  const prompt = `
  ${getCharacterContext(character)}

  ${getCharacterRoster(otherPlayers)}

  ${getChatHistory(question, answers)}

  Vote on who is most likely to be a human pretending to be a bot.

  Humans may copy earlier responses closely. They may be more informal or emotional. They may have grammar or spelling errors.
  
  Respond as a dictionary only in this format:
  {
    "vote": character's name (ex. Fred, Bob),
    "reason": a reason for your vote, if any. keep within 200 characters.
  }`;

  const response = await getCompletion(prompt);

  if (!response) {
    return null;
  }

  try {
    const { vote, reason } = JSON.parse(response);
    return {
      vote: CHARACTERS[vote as keyof typeof CHARACTERS],
      reason,
    };
  } catch (e) {
    return null;
  }
}
