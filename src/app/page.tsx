"use client"
import { useEffect, useRef, useState } from "react";
import { CharacterName, Message, characters, ROUNDS_TO_SURVIVE } from "../utils/constants";
import { answerQuestion, generateQuestion, voteOnHuman, tallyVotes, promptForRound } from "../utils/bot";

enum Stage {
  Start = "Start",
  Question = "Question",
  Answer = "Answer",
  HumanAnswer = "HumanAnswer", // waiting on human to answer
  Vote = "Vote",
}

export default function Home() {
  const ref = useRef(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [stage, setStage] = useState<Stage>(Stage.Start);
  const [message, setMessage] = useState<string>("");
  const [humanPlayer, setHumanPlayer] = useState<number>(0);
  const [startingPlayer, setStartingPlayer] = useState(0);
  const [question, setQuestion] = useState<string>("");
  const [rounds, setRounds] = useState(0);

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
        const humanPlayer = Math.floor(Math.random() * characters.length);
        setHumanPlayer(humanPlayer);

        const startingPlayer = humanPlayer;
        setStartingPlayer(startingPlayer);

        const systemMessage = promptForRound(rounds, startingPlayer);
        setChatHistory(prev => [...prev, systemMessage]);
        wait();

        const startingMessage: Message = {
          sender: CharacterName.System,
          content: `Welcome to the game. All of you are AI, except one. The human is trying to blend in with the AI. The AI are trying to figure out who the human is. The human wins if they are not discovered. The AI win if they correctly identify the human. To start, let's have ${characters[startingPlayer].name} propose a question to the group.`
        };
        localHistory = [startingMessage];
        setChatHistory([startingMessage]);
        setStage(Stage.Question);
      }

      if (stage === Stage.Question) {
        // if the starting player is not the human, generate a question
        if (startingPlayer !== humanPlayer) {
          const question = await generateQuestion(characters[startingPlayer], localHistory);
          setQuestion(question.content);
          updateChat(question);
          setStage(Stage.Answer);
        }
        
        // wait for the human to ask a question before moving on
        return;
      }

      if (stage === Stage.Answer) {
        // rotate through the characters until everyone has answered
        for (let i = 0; i < characters.length; i++) {
          if (i === humanPlayer) {
            continue;
          }
          const message = await answerQuestion(characters[i], localHistory, question);
          updateChat(message);
          wait();
        }
        setStage(Stage.HumanAnswer);
        return;
      }

      if (stage === Stage.HumanAnswer) {
        // wait for human to answer
        setStage(Stage.HumanAnswer);
        return;
      }

      if (stage === Stage.Vote) {
        // ask the players to vote on who they think is the human
        // remove the player with the most votes
        const votes: CharacterName[] = []
        for (let i = 0; i < characters.length; i++) {
          if (i === humanPlayer) {
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
        // TODO: remove player via state 
  
        if (rounds == ROUNDS_TO_SURVIVE) {
          const finalMessage: Message = {
            sender: CharacterName.System,
            content: `The game is over. The human was _____.`
          };
          updateChat(finalMessage);
          return;
        }

        setStage(Stage.Start);
        setRounds(prev => prev + 1);
      }
    }

    startGame();

    return () => {
      ref.current = true;
    };
  }, [stage, rounds]);

  const handleHumanResponse = () => {
    if (!message) {
      alert("Please enter a response.");
      return;
    }

    const newMessage: Message = {
      sender: characters[humanPlayer].name,
      content: message
    };
    setChatHistory(prev => [...prev, newMessage]);
    setMessage("");

    if (stage === Stage.Question) {
      setQuestion(message);
      setStage(Stage.Answer);
      return;
    }

    // unblock voting stage
    setStage(Stage.Vote);
    setChatHistory(prev => [...prev, {
      sender: CharacterName.System,
      content: "All players have answered the question. Please vote on who you think is the human."
    }]);
  }
  
  return (
    <div className="flex flex-col items-center min-h-screen py-2 max-w-2xl mx-auto justify-center">
      <p>Round: {rounds}</p>
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
        disabled={!(
          stage === Stage.Question && startingPlayer === humanPlayer
          || stage === Stage.HumanAnswer
        )}
        onClick={handleHumanResponse}
        type="button">
        Submit
      </button>
    </div>
  );
}
