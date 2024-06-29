"use client"
import { useEffect, useState } from "react";
import { startGame } from "../utils/game";
import { Message } from "../utils/constants";

export default function Home() {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  useEffect(() => {
    startGame().then((history: Message[]) => {
      setChatHistory(history)
    });
  }, []);
  
  return (
    <>
      {chatHistory.map((message, index) => (
        <div key={index}>
          <strong>{message.sender.name}</strong>: {message.content}
        </div>
      ))}
    </>
  );
}
