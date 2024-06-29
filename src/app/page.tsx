"use client"
import { useEffect, useRef, useState } from "react";
import { Character, CharacterName, Message, characters } from "../utils/constants";
import { answerQuestion, generateQuestion, voteOnHuman, tallyVotes } from "../utils/bot";

enum Stage {
  Start = "Start",
  Question = "Question",
  Vote = "Vote",
}

export default function Home() {
  const ref = useRef(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [stage, setStage] = useState<Stage>(Stage.Start);
  const [message, setMessage] = useState<string>("");
  const [humanPlayer, setHumanPlayer] = useState<CharacterName | undefined>(undefined);

  function wait(ms: number = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    async function startGame() {
      if (!ref.current) {
        ref.current = true;
        return;
      }

      let localHistory: Message[] = [];

      function updateChat(message: Message) {
        localHistory.push(message);
        setChatHistory(prev => [...prev, message]);
      }

      if (stage === Stage.Start) {
        const humanPlayer = characters[Math.floor(Math.random() * characters.length)].name;
        setHumanPlayer(humanPlayer);

        const startingPlayer = Math.floor(Math.random() * characters.length);
        const startingMessage: Message = {
          sender: CharacterName.System,
          content: `Welcome to the game. All of you are AI, except one. The human is trying to blend in with the AI. The AI are trying to figure out who the human is. The human wins if they are not discovered. The AI win if they correctly identify the human. To start, let's have ${characters[startingPlayer].name} propose a question to the group.`
        };
        localHistory = [startingMessage];
        setChatHistory([startingMessage]);
        wait();

        // generate a question
        const question = await generateQuestion(characters[startingPlayer], localHistory);
        updateChat(question);
        wait();

        // rotate through the characters until everyone has answered
        for (let i = 0; i < characters.length; i++) {
          if (characters[i].name === humanPlayer) {
            continue;
          }
          const message = await answerQuestion(characters[i], localHistory, question.content);
          updateChat(message);
          wait();
        }

        setStage(Stage.Question);
        return;
      }

      if (stage === Stage.Vote) {
        // ask the players to vote on who they think is the human
        // remove the player with the most votes
        const votes: CharacterName[] = []
        for (let i = 0; i < characters.length; i++) {
          if (characters[i].name === humanPlayer) {
            continue;
          }
          console.log(chatHistory)
          const vote = await voteOnHuman(characters[i], chatHistory);
          if (vote.content !== "I abstain from voting.") {
            votes.push(vote.sender);
          }
          updateChat(vote);
          wait();
        }

        const maxVoteGetter = tallyVotes(votes);
        console.log("maxVoteGetter", maxVoteGetter);
        return;
      }
    }

    startGame();

    return () => {
      ref.current = true;
    };
  }, [stage]);

  const handleHumanResponse = () => {
    const newMessage: Message = {
      sender: humanPlayer as CharacterName,
      content: message
    };
    setChatHistory(prev => [...prev, newMessage]);
    setMessage("");

    // unblock voting stage
    setStage(Stage.Vote);
    setChatHistory(prev => [...prev, {
      sender: CharacterName.System,
      content: "All players have answered the question. Please vote on who you think is the human."
    }]);
  }
  
  return (
    <div className="flex flex-col items-center min-h-screen py-2 max-w-2xl mx-auto justify-center">
      <p>Human player: {humanPlayer}</p>
      <div className="h-[60vh] overflow-y-auto">
        {chatHistory.map((message, index) => (
          <div key={index}>
            <strong>{message.sender}</strong>: {message.content}
          </div>
        ))}
      </div>
      <textarea
        className="w-full h-24 mt-8"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="I am an AI because..."
      />
      <button
        className="mt-4 w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={stage !== Stage.Question || message.length === 0}
        onClick={handleHumanResponse}
        type="button">
        Respond to the question
      </button>
    </div>
  );
}
