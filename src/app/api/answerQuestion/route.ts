import { getCharacterContext, getChatHistory, getCompletion } from '../utils';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { characterName, publicQuestion, privateQuestion, answers } = body;

  const prompt = `
  ${getCharacterContext(characterName)}

  ${getChatHistory(publicQuestion, privateQuestion, answers)}

  Answer uniquely in up to 150 characters. No name prefix.`;

  const response = await getCompletion(prompt);
  if (!response) {
    return;
  }

  return NextResponse.json({ response });
}
