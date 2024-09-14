import { Character } from "@/constants/characters";
import { Message } from "@/utils/message";
import { OpenAI } from "openai";

const MODEL = 'gpt-4o-mini-2024-07-18';

export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export function getCharacterContext(characterName: string): string {
  return `You are ${characterName}. You are a bot at a post-apocolyptic corporation. You are in a chatroom with other bots and only one human. If you successfully determine the human, you will win. If you fail, you will be terminated.`;
}

export const getCompletion = async (prompt: string) => {
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


export function getChatHistory(
  publicQuestion: string,
  privateQuestion: string,
  answers: Message[]
): string {
  let chatHistory = '';

  if (publicQuestion) {
    chatHistory += `The public question was: ${publicQuestion}\n`;
  }

  if (privateQuestion) {
    chatHistory += `The private question, only shown to bots, was: ${privateQuestion}\n`;
  }

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

export function getCharacterRoster(players: Character[]): string {
  /* return a list of characters with their bios */
  return `All players are: ${Object.values(players)
    .map((character) => character.name)
    .join('\n')}\n`;
}