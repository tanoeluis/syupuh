
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Slider } from "@components/ui/slider";
import { useToast } from "@hooks/use-toast";
import confetti from "canvas-confetti";

// Emoji symbols for cards
const SYMBOLS = [
  "🐱", "🐶", "🐰", "🦊", "🦁", "🐼", "🐨", "🐯",
  "🦄", "🐸", "🐢", "🦋", "🐬", "🐙", "🦜", "🦢",
  "🦩", "🐝", "🍎", "🍌", "🍓", "🍉", "🥑", "🥦",
  "🌮", "🍕", "🍦", "🧁", "🚀", "⚽", "🏀", "🎸"
];

type CardData = {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
};

export default function MemoryMatch() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [bestScore, setBestScore] = useState<Record<number, number>>({});
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [boardSize, setBoardSize] = useState<number>(4); // Default 4x4 = 16 cards (8 pairs)
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [time, setTime] = useState<number>(0);
  const { toast } = useToast();
  
  // Load best scores from local storage
  useEffect(() => {
    const savedBestScores = localStorage.getItem('memoryMatchBestScores');
    if (savedBestScores) {
      setBestScore(JSON.parse(savedBestScores));
    }
  }, []);
  
  // Initialize the game
  useEffect(() => {
    initializeGame();
  }, [boardSize]);
  
  // Game timer
  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameCompleted]);
  
  // Check for win condition
  useEffect(() => {
    const totalPairs = boardSize * boardSize / 2;
    
    if (matchedPairs === totalPairs && matchedPairs > 0) {
      setGameCompleted(true);
      
      // Check if this is a new best score
      const currentBest = bestScore[boardSize] || Infinity;
      
      if (moves < currentBest) {
        const newBestScores = { ...bestScore, [boardSize]: moves };
        setBestScore(newBestScores);
        localStorage.setItem('memoryMatchBestScores', JSON.stringify(newBestScores));
        
        toast({
          title: "New record!",
          description: `New best for ${boardSize}x${boardSize}: ${moves} moves`
        });
      } else {
        toast({
          title: "Game Complete!",
          description: `You finished in ${moves} moves and ${formatTime(time)}`
        });
      }
      
      triggerWinAnimation();
    }
  }, [matchedPairs]);
  
  // Initialize the game
  const initializeGame = () => {
    const numPairs = (boardSize * boardSize) / 2;
    const shuffledSymbols = [...SYMBOLS].sort(() => Math.random() - 0.5).slice(0, numPairs);
    
    // Create pairs of cards
    const cardPairs = [...shuffledSymbols, ...shuffledSymbols];
    
    // Shuffle the cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5).map((symbol, index) => ({
      id: index,
      symbol,
      flipped: false,
      matched: false
    }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setTime(0);
    setMatchedPairs(0);
    setGameStarted(false);
    setGameCompleted(false);
  };
  
  // Handle card click
  const handleCardClick = (id: number) => {
    // Ignore clicks if the game is completed or the card is already flipped or matched
    const card = cards.find(c => c.id === id);
    if (gameCompleted || !card || card.flipped || card.matched) return;
    
    // Start the game on first card click
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Can't flip more than 2 cards at a time
    if (flippedCards.length === 2) return;
    
    // Flip the card
    const newCards = cards.map(c => 
      c.id === id ? { ...c, flipped: true } : c
    );
    
    setCards(newCards);
    setFlippedCards([...flippedCards, id]);
    
    // If this is the second card flipped, check for a match
    if (flippedCards.length === 1) {
      setMoves(prevMoves => prevMoves + 1);
      
      const firstCard = cards.find(c => c.id === flippedCards[0]);
      const secondCard = newCards.find(c => c.id === id);
      
      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          const matchedCards = cards.map(c => 
            (c.id === firstCard.id || c.id === secondCard.id) 
              ? { ...c, matched: true, flipped: true } 
              : c
          );
          
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedPairs(prev => prev + 1);
        }, 500);
      } else {
        // No match, flip back after a short delay
        setTimeout(() => {
          const resetCards = newCards.map(c => 
            (c.id === flippedCards[0] || c.id === id) && !c.matched
              ? { ...c, flipped: false }
              : c
          );
          
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Trigger win animation
  const triggerWinAnimation = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };
  
  // Calculate grid columns based on board size
  const gridColumns = `grid-cols-${boardSize}`;

  return (
    <Card className="mt-4 w-full max-w-[600px] mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Memory Match</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full mb-4">
            <div className="text-lg">Moves: {moves}</div>
            <div className="text-lg">Time: {formatTime(time)}</div>
            <div className="text-lg">
              Best: {bestScore[boardSize] ? bestScore[boardSize] + " moves" : "-"}
            </div>
          </div>
          
          <div className={`grid gap-2 mb-6 ${boardSize === 2 ? 'grid-cols-2' : boardSize === 3 ? 'grid-cols-3' : boardSize === 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
            {cards.map(card => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  aspect-square flex items-center justify-center
                  cursor-pointer text-3xl font-bold
                  border-2 rounded-md shadow-sm transition-all duration-300
                  ${card.flipped ? 'bg-white rotate-y-0' : 'bg-primary rotate-y-180'}
                  ${card.matched ? 'border-green-500 bg-green-100' : 'border-gray-300'}
                  ${boardSize === 5 ? 'w-16 h-16' : boardSize === 4 ? 'w-[70px] h-[70px]' : boardSize === 3 ? 'w-24 h-24' : 'w-32 h-32'}
                `}
                style={{
                  transform: card.flipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
                }}
              >
                {card.flipped && card.symbol}
              </div>
            ))}
          </div>
          
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">Board Size: {boardSize}×{boardSize}</div>
                <div className="text-sm">
                  {boardSize === 2 ? 'Easy (2 pairs)' : 
                   boardSize === 3 ? 'Medium (4-5 pairs)' : 
                   boardSize === 4 ? 'Hard (8 pairs)' : 
                   'Expert (12-13 pairs)'}
                </div>
              </div>
              <Slider
                defaultValue={[boardSize]}
                min={2}
                max={5}
                step={1}
                onValueChange={(value) => {
                  if (!gameStarted || gameCompleted) {
                    setBoardSize(value[0]);
                  }
                }}
                disabled={gameStarted && !gameCompleted}
              />
            </div>
            
            <Button
              onClick={initializeGame}
              className="w-full"
            >
              {gameStarted ? "Restart Game" : "New Game"}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-center text-gray-500 block">
        <p>
          Find matching pairs of cards. Try to complete the puzzle in as few moves as possible!
        </p>
      </CardFooter>
    </Card>
  );
}
