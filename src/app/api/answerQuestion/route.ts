import { getCharacterContext, getChatHistory, getCompletion } from "../utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { characterName, publicQuestion, privateQuestion, answers } = body;

  const prompt = `
  ${getCharacterContext(characterName)}

  ${getChatHistory(publicQuestion, privateQuestion, answers)}

  IMPORTANT: Answer the question within 100-200 characters, at a maximum of 200 characters.
  
  PLEASE make your answer unique from other answers as much as possible. Do not prepend your response with your name.`;

  const response = await getCompletion(prompt);

  if (!response) {
    return null;
  }

  return  NextResponse.json({ response });
}