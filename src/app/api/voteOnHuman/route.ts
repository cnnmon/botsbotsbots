import {
  getCharacterContext,
  getCharacterRoster,
  getChatHistory,
  getCompletion,
} from '../utils';
import { CHARACTERS, SYSTEM_CHARACTER } from '@/constants/characters';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const responseSchema = z.object({
  vote: z.string(),
  reason: z.string(),
});

const responseFormat = zodResponseFormat(responseSchema, 'response');

function parseVote(content: string) {
  const trimmed = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  const json = trimmed.startsWith('{')
    ? trimmed
    : trimmed.match(/\{[\s\S]*\}/)?.[0];
  if (!json) {
    throw new Error('No JSON');
  }
  return responseSchema.parse(JSON.parse(json));
}

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

  try {
    const completion = await getCompletion(prompt, responseFormat);
    if (!completion) {
      return NextResponse.json({ error: 'No completion' }, { status: 500 });
    }

    const parsed = parseVote(completion);
    const character = Object.values(CHARACTERS).find(
      (entry) => entry.name.toLowerCase() === parsed.vote.trim().toLowerCase()
    );
    if (!character || character.name === SYSTEM_CHARACTER) {
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: {
        vote: character.name,
        reason: parsed.reason,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid response';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
