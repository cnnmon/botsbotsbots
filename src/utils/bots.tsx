import OpenAI from 'openai';
import { Character, CHARACTERS, Message } from '@/utils/constants';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function getCharacterContext(character: Character): string {
  return `Answer as ${character.name}.`;
}

const getCompletion = async (prompt: string) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: prompt,
      },
    ],
  });
  return completion.choices[0].message.content;
};

// Answer a question as a character
async function answer(
  character: Character,
  question: string
): Promise<Message> {
  const prompt = `${getCharacterContext(character)}\n${question}`;
  const response = await getCompletion(prompt);

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

async function voteOnHuman(
  character: Character,
  chatHistory: Message[]
): Promise<Message> {
  const prompt = `
  ${getCharacterContext(character)}\n

  Read the chat history: ${chatHistory}.
  
  Vote on who you think is a human out of ${Object.keys(CHARACTERS)}.\n
  
  Respond only in JSON in this format:
  {
    "vote": character's name (ex. Fred, Bob),
    "reason": "I think this character is the human becuase..."
  }`;
  const response = await getCompletion(prompt);

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
    return new Message({
      sender: character,
      content: 'I abstain from voting.',
    });
  }
}
