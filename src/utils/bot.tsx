import OpenAI from "openai";
import { Character, CharacterName, Message, characters } from "./constants";

const OPENAI_API_KEY = "sk-proj-twiPtJcUIbrgwPvGUDCIT3BlbkFJyLQ2oD9ObFtc8cda9gpJ"

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function commonContext(character: Character, chatHistory: Message[]) {
  return `Your name is ${character.name}. You are a gpt-3.5-turbo bot. There is a human hiding amongst you. There is a common chat window where you, three other bots, and a human will answer a question. You win if you can successfully determine who is a human and not a bot.\n 
  
  The characters in the game (including yourself) are ${Object.values(CharacterName).join(', ')}.\n
      
  The chat history is ${chatHistory.toString()}.\n`
}

async function generateQuestion(character: Character, chatHistory: Message[]): Promise<Message> {
  const completion = await openai.chat.completions.create({
    messages: [{
      role: "system",
      content: `${commonContext(character, chatHistory)}
      
      Generate a question that hasn't been asked before according to your character's personality and to weed out the human. The question shouldn't necessarily be about artificial intelligence, some examples could be: "What's your favorite movie and why?" or "What do you think the meaning of life is?" or "What do you think about the current political climate?"`
    }],
    model: "gpt-4-turbo",
  });

  const response = completion.choices[0].message.content;
  if (!response) {
    return {
      sender: character.name,
      content: "I don't know what to say."
    }
  }

  return {
    sender: character.name,
    content: response
  }
}

// just focused on answering questions
async function answerQuestion(character: Character, chatHistory: Message[], question: string): Promise<Message> {
  // if chatHistory exists, then default to -- read the chat history and respond to whatever is asked
  // if no chatHistory, then ask the model to make its own question to ask the chat

  const completion = await openai.chat.completions.create({
    messages: [{
      role: "system",
      content: `${commonContext(character, chatHistory)}
      
      Answer the question ${question} according to your character's personality. Limit your response to 50 words or less.`
    }],
    model: "gpt-4-turbo",
  });

  const response = completion.choices[0].message.content;
  if (!response) {
    return {
      sender: character.name,
      content: "I don't know what to say."
    }
  }

  return {
    sender: character.name,
    content: response
  }
}

async function voteOnHuman(character: Character, chatHistory: Message[]): Promise<Message> {
  const completion = await openai.chat.completions.create({
    messages: [{
      role: "system",
      content: `${commonContext(character, chatHistory)}

      You are ${character.name}. Vote on who you think is the human. Respond with ONLY the name of the player and nothing else.`
    }],
    model: "gpt-4-turbo",
  });

  const response = completion.choices[0].message.content;
  return {
    sender: character.name,
    content: response || "I abstain from voting."
  }
}

export { answerQuestion, generateQuestion, voteOnHuman }