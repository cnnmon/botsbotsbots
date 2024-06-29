"use client"
import { useEffect, useRef, useState } from "react";
import { CharacterName, Message, characters } from "../utils/constants";
import { answerQuestion, generateQuestion, voteOnHuman } from "../utils/bot";

export default function Home() {
  const ref = useRef(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

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
      const startingMessage: Message = {
        sender: CharacterName.System,
        content: `Welcome to the game. All of you are AI, except one. The human is trying to blend in with the AI. The AI are trying to figure out who the human is. The human wins if they are not discovered. The AI win if they correctly identify the human. To start, let's have ${characters[startingPlayer].name} propose a question to the group.`
      };
      const localHistory: Message[] = [startingMessage];
      setChatHistory([startingMessage]);
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
      for (let i = 0; i < characters.length; i++) {
        const vote = await voteOnHuman(characters[i], localHistory);
        updateChat(vote);
        wait();
      }
    }

    startGame();
    return () => {
      ref.current = true;
    };
  }, []);
  
  return (
    <>
      {chatHistory.map((message, index) => (
        <div key={index}>
          <strong>{message.sender}</strong>: {message.content}
        </div>
      ))}
    </>
  );
}
