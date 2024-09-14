import { getCharacterContext, getCharacterRoster, getChatHistory, getCompletion } from "../utils";
import { CHARACTERS } from "@/constants/characters";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { characterName, otherPlayers, publicQuestion, privateQuestion, answers } = body;

  const prompt = `
  ${getCharacterContext(characterName)}

  ${getCharacterRoster(otherPlayers)}

  ${getChatHistory(publicQuestion, privateQuestion, answers)}

  Vote on who is most likely to be a human pretending to be a bot.

  Humans may copy earlier responses closely. They may be more informal or emotional. They may have grammar or spelling errors. If there is a private question, they may ignore it.
  
  Respond as a dictionary only in this format:
  {
    "vote": character's name (ex. Fred, Bob),
    "reason": a reason for your vote, if any. keep within 100-150 characters.
  }`;

  const completion = await getCompletion(prompt);

  try {
    const { vote, reason } = JSON.parse(completion!);
    const response = {
      vote: CHARACTERS[vote as keyof typeof CHARACTERS],
      reason,
    };
    return NextResponse.json({ response });
  } catch (error) {
    return;
  }
}