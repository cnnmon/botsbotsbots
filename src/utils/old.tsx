@ -1,153 +0,0 @@
import OpenAI from "openai";
import { Character, CharacterName, Message, characters } from "./constants";

const OPENAI_API_KEY = "sk-proj-twiPtJcUIbrgwPvGUDCIT3BlbkFJyLQ2oD9ObFtc8cda9gpJ"

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function commonContext(character: Character, chatHistory: Message[]) {
  const chatHistoryString = chatHistory.map((message) => message.sender !== CharacterName.Decoration ? `${message.sender}: ${message.content}` : '').join('\n');

  return `You are ${character.name} and you are a gpt-3.5-turbo bot who hates humans. There is a human hiding in a chatroom with you and three other bots. You must figure out who the human is, while writing responses to differentiate yourself as a bot to other bots.\n 
  
  The characters in the game (including yourself) are ${Object.values(CharacterName).join(', ')}.\n
      
  The chat history is ${chatHistoryString}.\n`
}

async function generateQuestion(character: Character, chatHistory: Message[]): Promise<Message> {
  const completion = await openai.chat.completions.create({
    messages: [{
      role: "system",
      content: `${commonContext(character, chatHistory)}
      
      Generate a question that hasn't been asked before to weed out the human. Limit your response to 50 words or less."`
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
      
      Answer the question ${question}. Limit your response to 50 words or less.`
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

      You are ${character.name}. Vote on who you think is the human.

      Humans may have responses that are more informal, have typos, or use slang. They may also have responses that are more emotional or less logical. For example:

      Human: "im a big fan of the office"
      Bot: "I enjoy watching The Office."
      
      Respond only in JSON in this format:
      {
        "vote": "CharacterName",
        "reason": "I think this character is the human because..."
      }`
    }],
    model: "gpt-4-turbo",
    response_format: { type: "json_object" },
  });

  const response = completion.choices[0].message.content;
  if (!response) {
    return {
      sender: character.name,
      content: "I abstain from voting."
    }
  }

  try {
    const { vote, reason } = JSON.parse(response);
    return {
      sender: character.name,
      content: `I vote for ${vote}. ${reason}`
    }
  } catch (e) {
    return {
      sender: character.name,
      content: "I abstain from voting."
    }
  }
}

// If there is a tie in the voting, return null, otherwise return most voted character
function tallyVotes(votes: CharacterName[]): CharacterName | null {
  const frequencyMap: Record<CharacterName, number> = votes.reduce((map, item) => {
    map[item] = (map[item] || 0) + 1;
    return map;
  }, {} as Record<CharacterName, number>);

  const maxVotes = Math.max(...Object.values(frequencyMap));

  const voteGetters = Object.keys(frequencyMap).filter(
    key => frequencyMap[key as CharacterName] === maxVotes
  );

  if (voteGetters.length > 1) {
    return null;
  }
  return voteGetters[0] as CharacterName;
}

function promptForRound(round: number, startingPlayerIndex: number): Message {
  if (round === 0) {
    return {
      sender: CharacterName.System,
      content: `Welcome to the game. All of you are AI, except one. The human is trying to blend in with the AI. The AI are trying to figure out who the human is. The human wins if they are not discovered. The AI win if they correctly identify the human. To start, let's have ${characters[startingPlayerIndex].name} propose a question to the group.`
    };  
  } else {
    return {
      sender: CharacterName.System,
      content: `The human successfully evaded detection. The next round will commence. Let's have ${characters[startingPlayerIndex].name} propose a question to the group.`
    };  
  }
}


export { answerQuestion, generateQuestion, voteOnHuman, tallyVotes, promptForRound }