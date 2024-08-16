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

  return `Read the chat history:\n${chatHistoryAsString.join('\n')}`;
}

function getCharacterRoster(): string {
  /* return a list of characters with their bios */
  return `The bots and their roles in this cluster are: ${Object.values(
    CHARACTERS
  )
    .map((character) => `${character.name}: ${character.bio}`)
    .join('\n')}\n`;
}

// Answer a question as a character
export async function answerQuestion(
  character: Character,
  question: string,
  chatHistory: Message[]
): Promise<Message> {
  const prompt = `
  ${getCharacterContext(character)}
  ${getChatHistory(chatHistory)}
  ${getCharacterRoster()}

  Answer the following question in proving you are a bot within 200 characters: ${question}
  
  Try to differenatiate your response from other responses. Do NOT prepend your response with your name.`;
  console.log(prompt);

  const response = await getCompletion(prompt);
  console.log(response);

  if (!response) {
    return new Message({
      sender: character,
      content: 'I am unable to answer that question.',
    });
  }

  return new Message({
    sender: character,
    content: response,
  });
}

export async function voteOnHuman(
  character: Character,
  chatHistory: Message[]
): Promise<Message> {
  const prompt = `
  ${getCharacterContext(character)}
  ${getChatHistory(chatHistory)}
  ${getCharacterRoster()}

  Vote on who you think is the human pretending to be a bot in this cluster.

  Humans may have responses that are more informal, have grammatical/spelling errors, or show more emotion. Be especially wary of responses that are too similar to a previous response, or responses that are too perfect.\n
  
  Respond as a dictionary only in this format:
  {
    "vote": character's name (ex. Fred, Bob),
    "reason": a reason for your vote, if any. keep within 200 characters.
  }`;

  const response = await getCompletion(prompt);
  console.log(response);

  if (!response) {
    return new Message({
      sender: character,
      content: 'I abstain from voting.',
    });
  }

  try {
    const { vote, reason } = JSON.parse(response);
    return new Message({
      sender: character,
      content: `I vote for ${vote}. ${reason}`,
    });
  } catch (e) {
    console.log(e);
    return new Message({
      sender: character,
      content: 'I abstain from voting.',
    });
  }
}
