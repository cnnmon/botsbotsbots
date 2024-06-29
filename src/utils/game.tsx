import { characters, Message } from "./constants";
import { answerQuestion, generateQuestion, voteOnHuman } from "./bot";

// one round
export async function startGame() {
  // randomly choose one player to propose a question
  const chatHistory: Message[] = [
    {
      sender: {
        name: "System",
        personality: "You are the game master."
      },
      content: "Welcome to the game. All of you are AI, except one. The human is trying to blend in with the AI. The AI are trying to figure out who the human is. The human wins if they are not discovered. The AI win if they correctly identify the human. First, one of you will ask a question to start the game."
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
    if (!vote) {
      chatHistory.push({
        sender: characters[i],
        content: "I abstain from voting."
      });
    } else {
      chatHistory.push({
        sender: characters[i],
        content: `I vote for ${vote.name}.`
      });
    }
  }

  return chatHistory;
}