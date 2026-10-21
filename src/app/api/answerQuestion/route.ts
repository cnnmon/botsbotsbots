import { getCharacterContext, getChatHistory, getCompletion } from '../utils';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { characterName, publicQuestion, privateQuestion, answers } = body;

  const prompt = `
  ${getCharacterContext(characterName)}

  ${getChatHistory(publicQuestion, privateQuestion, answers)}

  Answer uniquely in up to 150 characters. No name prefix.`;

  try {
    const response = await getCompletion(prompt);
    if (!response) {
      return NextResponse.json({ error: 'No completion' }, { status: 500 });
    }

    return NextResponse.json({ response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No completion';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
