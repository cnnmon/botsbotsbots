import {
  getCharacterContext,
  getCharacterRoster,
  getChatHistory,
  getCompletion,
} from '../utils';
import { CHARACTERS } from '@/constants/characters';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const responseSchema = z.object({
  vote: z.string(),
  reason: z.string(),
});

const responseFormat = zodResponseFormat(responseSchema, 'response');

export async function POST(req: Request) {
  const body = await req.json();
  const {
    characterName,
    otherPlayers,
    publicQuestion,
    privateQuestion,
    answers,
  } = body;

  const prompt = `
  ${getCharacterContext(characterName)}

  ${getCharacterRoster(otherPlayers)}

  ${getChatHistory(publicQuestion, privateQuestion, answers)}

  Analyze the chat history chronologically. Pay special attention to:
  - Responses that directly copy previous answers
  - Informal language
  - Grammar, spelling, or formatting mistakes
  - Responses that ignore the private question

  Vote on who exhibits the most human-like behavior.
  
  Respond as JSON only:
  {
    "vote": character's name (ex. Fred, Bob),
    "reason": brief explanation under 150 chars
  }`;

  const completion = await getCompletion(prompt, responseFormat);

  try {
    if (!completion) {
      return NextResponse.json({ error: 'No completion' }, { status: 500 });
    }
    const parsed = responseSchema.parse(JSON.parse(completion));
    const response = {
      vote: CHARACTERS[parsed.vote as keyof typeof CHARACTERS],
      reason: parsed.reason,
    };
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid response format' },
      { status: 500 }
    );
  }
}
