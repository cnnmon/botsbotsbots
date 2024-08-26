import OpenAI from 'openai';
import { Character, CHARACTERS } from '@/utils/characters';
import { Message } from '@/utils/constants';

const MODEL = 'gpt-4o-mini-2024-07-18';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function getCharacterContext(character: Character): string {
  return `You are ${character.name}. You are a bot at BigCo where your role is ${character.bio}. You are in a chatroom with other bots and one human. You are trying to determine who the human is, if there is any.`;
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

function getChatHistory(chatHistory: Message[]): string {
  if (!chatHistory.length) {
    return '';
  }

  const chatHistoryAsString = chatHistory.map((message) => {
    if (message.sender) {
      return `${message.sender.name}: ${message.content}`;
    }
  });

  return `Read the chat history in order:\n${chatHistoryAsString.join('\n')}`;
}

function getCharacterRoster(): string {
  /* return a list of characters with their bios */
  return `The bots and their roles in this cluster are: ${Object.values(
    CHARACTERS
  )
    .map((character) => `${character.name}: ${character.bio}`)
    .join('\n')}\n`;
}

const fallbackQuestions = [
  'If you had to teach quantum mechanics to a group of toddlers using only nursery rhymes, how would you do it?',
  'Explain the concept of time to someone who has never experienced it.',
  'Imagine you must convince a stubborn tree to migrate south for the winter. What would your argument be?',
  'Imagine you are a spoon in a cutlery drawer. Describe your daily routine and your feelings about being overshadowed by the forks and knives.',
  'Explain how you would negotiate peace between two rival factions of sentient robots fighting over control of a Wi-Fi network.',
  'Explain the emotional significance of a traffic light changing from red to green in the context of a philosophy debate on free will.',
  'If clouds were sentient, how would they communicate with each other, and what do you think they gossip about?',
  'Design a utopian society where the primary form of currency is not money. How would the economy function?',
];

export async function generateQuestion(): Promise<string> {
  const prompt = `Write a question that will help identify a human's response in a group of bot responses. The question should be open-ended, outlandish, and egregious. The question should be answerable within 200 characters without special symbols. Examples:
  - If you had to teach quantum mechanics to a group of toddlers using only nursery rhymes, how would you do it?
  - Explain the emotional significance of a traffic light changing from red to green in the context of a philosophy debate on free will.
  - Imagine you must convince a stubborn tree to migrate south for the winter. What would your argument be?
  - Design a utopian society where the primary form of currency is not money. How would the economy function?`;

  const response = await getCompletion(prompt);
  console.log(response);

  if (!response) {
    return fallbackQuestions[
      Math.floor(Math.random() * fallbackQuestions.length)
    ];
  }

  return response;
}

export async function answerQuestion(
  character: Character,
  question: string,
  chatHistory: Message[]
): Promise<string | null> {
  const prompt = `
  ${getCharacterContext(character)}
  ${getChatHistory(chatHistory)}
  ${getCharacterRoster()}

  Answer the following question in proving you are a bot within 200 characters: ${question}
  
  Try to differenatiate your response from other responses. Do NOT prepend your response with your name.`;

  const response = await getCompletion(prompt);
  console.log(response);

  if (!response) {
    return null;
  }

  return response;
}

export async function voteOnHuman(
  character: Character,
  chatHistory: Message[]
): Promise<{
  vote: Character;
  reason: string;
} | null> {
  const prompt = `
  ${getCharacterContext(character)}
  ${getChatHistory(chatHistory)}
  ${getCharacterRoster()}

  Vote on who you think is the human pretending to be a bot in this cluster.

  Humans may have responses that are more informal, have grammar or spelling errors, or show more emotion. Be wary of responses that are too similar to a previous response, or responses that are too perfect. Be wary of responses that are too different from other responses.\n
  
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
