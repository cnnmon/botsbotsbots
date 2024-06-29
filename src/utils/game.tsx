import { characters, Message, CharacterName } from "./constants";
import { answerQuestion, generateQuestion, voteOnHuman } from "./bot";

// one round
export async function startGame() {
  // randomly choose one player to propose a question
  const chatHistory: Message[] = [
    {
      sender: CharacterName.System,
      content: "Welcome to the game. All of you are AI, except one. The human is trying to blend in with the AI. The AI are trying to figure out who the human is. The human wins if they are not discovered. The AI win if they correctly identify the human."
    },
    {
      sender: CharacterName.System,
      content: "To start, let's have one of you propose a question to the group."
    }
  ];
  const startingPlayer = Math.floor(Math.random() * characters.length);
  
  const question = await generateQuestion(characters[startingPlayer], chatHistory);
  chatHistory.push(question);

  // rotate through the characters until everyone has answered
  for (let i = 0; i < characters.length; i++) {
    const message = await answerQuestion(characters[i], chatHistory, question.content);
    chatHistory.push(message);
  }

  // ask the players to vote on who they think is the human
  // remove the player with the most votes
  for (let i = 0; i < characters.length; i++) {
    const vote = await voteOnHuman(characters[i], chatHistory);
    chatHistory.push(vote);
  }

  return chatHistory;
}