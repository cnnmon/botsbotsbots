"use client"
import { useEffect, useRef, useState } from "react";
import { CharacterName, Message, characters, ROUNDS_TO_SURVIVE } from "../utils/constants";
import { answerQuestion, generateQuestion, voteOnHuman, tallyVotes, promptForRound } from "../utils/bot";

export default function Home() {
  const ref = useRef(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [rounds, setRounds] = useState(0);

  function wait(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    async function startGame() {
      if (!ref.current) {
        ref.current = true;
        return;
      }
      function updateChat(message: Message) {
        localHistory.push(message);
        setChatHistory(prev => [...prev, message]);
      }

      const startingPlayer = Math.floor(Math.random() * characters.length);
      const systemMessage = promptForRound(rounds, startingPlayer);
      const localHistory: Message[] = [systemMessage];
      setChatHistory(prev => [...prev, systemMessage]);
      wait();

      // generate a question
      const question = await generateQuestion(characters[startingPlayer], localHistory);
      updateChat(question);
      wait();

      // rotate through the characters until everyone has answered
      for (let i = 0; i < characters.length; i++) {
        const message = await answerQuestion(characters[i], localHistory, question.content);
        updateChat(message);
        wait();
      }

      // ask the players to vote on who they think is the human
      // remove the player with the most votes
      const votes: CharacterName[] = []
      for (let i = 0; i < characters.length; i++) {
        const vote = await voteOnHuman(characters[i], localHistory);

        if (vote.content !== "I abstain from voting.") {
          votes.push(vote.sender);
        }
        updateChat(vote);
        wait();
      }

      const maxVoteGetter = tallyVotes(votes);
      // TODO: remove player via state 

      if (rounds == ROUNDS_TO_SURVIVE) {
        const finalMessage: Message = {
          sender: CharacterName.System,
          content: `The game is over. The human was _____.`
        };
        updateChat(finalMessage);
        return;
      }

      setRounds(prev => prev + 1);
    }

    startGame();
    return () => {
      ref.current = true;
    };
  }, [rounds]);
  
  return (
    <div className="flex flex-col items-center min-h-screen py-2 max-w-2xl mx-auto justify-center">
      <div className="h-[70vh] overflow-y-auto">
        {chatHistory.map((message, index) => (
          <div key={index}>
            <strong>{message.sender}</strong>: {message.content}
          </div>
        ))}
      </div>
      <textarea className="w-full h-24 mt-8" />
    </div>
  );
}
