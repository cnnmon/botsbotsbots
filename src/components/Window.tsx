'use client';
import { useRef } from 'react';
import Draggable, { ControlPosition } from 'react-draggable';
import Image from 'next/image';
import exitSvg from '@/public/exit.svg';

const getPos = (random: boolean): ControlPosition =>
  random
    ? {
        x: Math.random() * (window.innerWidth / 3) + 250,
        y: Math.random() * (window.innerHeight / 3) - 50,
      }
    : { x: 0, y: -50 };

function Lines() {
  return (
    <div className="flex-col w-full draggable mb-[-4px] mt-[1px]">
      {[1, 2, 3].map((_, index) => (
        <div
          className="h-[7px] border-t-[1.5px] border-primary-color"
          key={index}
        />
      ))}
    </div>
  );
}

function TopBar({ exitProfile }: { exitProfile?: () => void }) {
  if (exitProfile) {
    return (
      <div className="frame border-b-[1.5px] border-primary-color flex">
        <div className="p-1 w-[800%] draggable">
          <Lines />
        </div>
        <div className="frame border-l-[1.5px] border-primary-color">
          <Image
            src={exitSvg}
            alt=""
            width={20}
            className="no-drag button"
            onClick={exitProfile}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="frame border-b-[1.5px] border-primary-color flex p-1">
      <Lines />
    </div>
  );
}

export default function Window({
  name,
  width,
  height,
  hasRandomPos = false,
  exitProfile,
  content,
  windowOrdering,
  moveToFront,
}: {
  name: string; // identifier for window ordering
  width: string;
  height: string;
  hasRandomPos?: boolean;
  exitProfile?: () => void;
  content: React.ReactNode;
  windowOrdering: string[];
  moveToFront: (name: string) => void;
}) {
  const nodeRef = useRef(null);
  return (
    <Draggable
      handle=".draggable"
      defaultPosition={getPos(hasRandomPos)}
      onStart={() => moveToFront(name)}
      nodeRef={nodeRef}
    >
      <div
        className="window top-[20%] left-[20%]"
        ref={nodeRef}
        style={{
          width: `${width}`,
          height: `${height}`,
          minHeight: '400px',
          zIndex: windowOrdering.indexOf(name),
        }}
      >
        <TopBar exitProfile={exitProfile} />
        {content}
      </div>
    </Draggable>
  );
}
