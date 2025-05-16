// src/pages/Games/data.ts
import { Gamepad, Blocks, Puzzle, Layout } from "lucide-react";
import SnakeGame from "../components/SnakeGame";
import SlotMachine from "../components/SlotMachine";
import BlockBlast from "../components/BlockBlast";
import PuzzleGame from "../components/PuzzleGame";
import MemoryMatch from "../components/MemoryMatch";
import MathGame from "../components/MathGame";

export const GAMES = [
  {
    id: "snake",
    title: "Snake Game",
    icon: Gamepad,
    description: "Control the snake, eat food, and avoid hitting the walls or yourself.",
    component: SnakeGame,
  },
  {
    id: "slots",
    title: "Slot Machine",
    icon: Layout,
    description: "Spin the reels and match symbols to win credits.",
    component: SlotMachine,
  },
  {
    id: "blocks",
    title: "Block Blast",
    icon: Blocks,
    description: "Match groups of colored blocks to clear them from the board.",
    component: BlockBlast,
  },
  {
    id: "puzzle",
    title: "Sliding Puzzle",
    icon: Puzzle,
    description: "Slide tiles into the correct position to solve the puzzle.",
    component: PuzzleGame,
  },
  {
    id: "memory",
    title: "Memory Match",
    icon: Layout,
    description: "Find matching pairs of cards to clear the board.",
    component: MemoryMatch,
  },
  {
    id: "math",
    title: "Math Challenge",
    icon: Gamepad,
    description: "Solve math problems as quickly as you can.",
    component: MathGame,
  },
] as const;

export type GameId = typeof GAMES[number]['id'];