
import { useState } from "react";
import { useParams, Link, Outlet} from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Gamepad, Blocks, Puzzle, Layout, ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import MainLayout from "@components/layouts/MainLayout";

// Game components
import SnakeGame from "./components/SnakeGame";
import SlotMachine from "./components/SlotMachine";
import BlockBlast from "./components/BlockBlast";
import PuzzleGame from "./components/PuzzleGame";
import MemoryMatch from "./components/MemoryMatch";
import MathGame from "./components/MathGame";

const GAMES = [
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
];

export default function Games() {
  const { gameId } = useParams();
  
  // Find the selected game
  const selectedGame = gameId ? GAMES.find(game => game.id === gameId) : null;
  
  return (
    <>
      <div className="mt-4 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            {selectedGame && (
              <Button variant="ghost" asChild>
                <Link to="/games">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Games
                </Link>
              </Button>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {selectedGame ? selectedGame.title : "Games"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedGame ? selectedGame.description : "Enjoy our collection of fun games!"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        {selectedGame ? (
          <div className="flex justify-center">
            <selectedGame.component />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES.map(game => (
              <Link to={`/games/${game.id}`} key={game.id}>
                <Card className="h-full transition-all hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <game.icon className="h-5 w-5" />
                      {game.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      <Outlet />
                      {game.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Play Game</Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
