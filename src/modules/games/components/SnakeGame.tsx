import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { useToast } from "@hooks/use-toast";

type Cell = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const CELL_SIZE = 25; // Slightly larger for better visibility
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];
const INITIAL_DIRECTION = 'RIGHT';
const GAME_SPEED = 150; // Slightly slower for better control
const SPEED_INCREASE = 5; // Speed increase per food eaten
const MIN_SPEED = 50; // Minimum speed limit

export default function SnakeGame() {
  const [snake, setSnake] = useState<Cell[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Cell>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameSpeed, setGameSpeed] = useState<number>(GAME_SPEED);
  const [foodType, setFoodType] = useState<'normal' | 'special'>('normal');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Initialize the game and set up event listeners
  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    // Set up keyboard controls
    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setNextDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setNextDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setNextDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setNextDirection('RIGHT');
          break;
        case ' ': // Space bar to pause/resume
          setPaused(prev => !prev);
          break;
        case 'r': // R key to reset
          if (gameOver || paused) resetGame();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    
    // Draw initial game state
    drawGame();

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [direction, gameOver, paused]);

  // Game loop
  useEffect(() => {
    if (gameOver || paused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      moveSnake();
    }, gameSpeed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [snake, food, direction, gameOver, paused, gameSpeed]);

  // Place food at a random position not occupied by the snake
  const placeFood = useCallback(() => {
    let newFood: Cell;
    const isSpecial = Math.random() < 0.2; // 20% chance for special food
    
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    setFood(newFood);
    setFoodType(isSpecial ? 'special' : 'normal');
  }, [snake]);

  // Move the snake in the current direction
  const moveSnake = useCallback(() => {
    setDirection(nextDirection); // Update direction from buffered input
    
    const head = { ...snake[0] };
    
    // Calculate new head position
    switch (nextDirection) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }
    
    // Check for collision with walls (wrap around instead of game over)
    if (head.x < 0) head.x = GRID_SIZE - 1;
    if (head.x >= GRID_SIZE) head.x = 0;
    if (head.y < 0) head.y = GRID_SIZE - 1;
    if (head.y >= GRID_SIZE) head.y = 0;
    
    // Check for collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      handleGameOver();
      return;
    }
    
    // Create new snake array with new head
    const newSnake = [head, ...snake];
    
    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
      // Snake grows, don't remove tail
      const points = foodType === 'special' ? 25 : 10;
      setScore(prev => prev + points);
      
      // Increase speed (but not beyond minimum)
      setGameSpeed(prev => Math.max(prev - SPEED_INCREASE, MIN_SPEED));
      
      // Special food gives extra length
      if (foodType === 'special') {
        newSnake.push({...newSnake[newSnake.length - 1]});
        toast({
          title: "Special Food!",
          description: `+25 points and extra length!`,
        });
      }
      
      placeFood();
    } else {
      // Remove tail
      newSnake.pop();
    }
    
    setSnake(newSnake);
    drawGame();
  }, [snake, food, nextDirection, placeFood, foodType, toast]);

  // Handle game over
  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setGameSpeed(GAME_SPEED); // Reset speed
    
    // Update high score if needed
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
      toast({
        title: "New high score!",
        description: `You set a new high score of ${score}!`,
        variant: "default",
      });
    }
  }, [score, highScore, toast]);

  // Reset the game
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setGameSpeed(GAME_SPEED);
    placeFood();
    setPaused(true);
    drawGame();
  }, [placeFood]);

  // Toggle pause state
  const togglePause = useCallback(() => {
    setPaused(prev => {
      if (!prev && gameOver) {
        resetGame();
        return false;
      }
      return !prev;
    });
  }, [gameOver, resetGame]);

  // Draw the game on canvas
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw grid (more subtle)
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food first (so snake can appear over it)
    if (foodType === 'special') {
      // Special food is a different color and shape
      ctx.fillStyle = '#FFD700'; // Gold color
      ctx.beginPath();
      ctx.roundRect(
        food.x * CELL_SIZE + 2,
        food.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4,
        4
      );
      ctx.fill();
      
      // Add sparkle effect
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(food.x * CELL_SIZE + CELL_SIZE * 0.3, food.y * CELL_SIZE + CELL_SIZE * 0.3);
      ctx.lineTo(food.x * CELL_SIZE + CELL_SIZE * 0.4, food.y * CELL_SIZE + CELL_SIZE * 0.3);
      ctx.lineTo(food.x * CELL_SIZE + CELL_SIZE * 0.35, food.y * CELL_SIZE + CELL_SIZE * 0.2);
      ctx.fill();
    } else {
      // Normal food
      ctx.fillStyle = '#FF5722';
      ctx.beginPath();
      ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Draw snake with gradient
    snake.forEach((segment, index) => {
      // Create gradient for snake body
      const gradient = ctx.createLinearGradient(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        segment.x * CELL_SIZE + CELL_SIZE,
        segment.y * CELL_SIZE + CELL_SIZE
      );
      
      if (index === 0) {
        // Head gradient
        gradient.addColorStop(0, '#388E3C');
        gradient.addColorStop(1, '#2E7D32');
      } else {
        // Body gradient
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#43A047');
      }
      
      ctx.fillStyle = gradient;
      
      // Draw rounded segments
      ctx.beginPath();
      ctx.roundRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2,
        4
      );
      ctx.fill();
      
      // Add eyes to the head
      if (index === 0) {
        ctx.fillStyle = 'white';
        
        const eyeSize = CELL_SIZE / 5;
        const eyeOffsetX = CELL_SIZE / 4;
        const eyeOffsetY = CELL_SIZE / 3;
        
        // Position eyes based on direction
        let eyeX1, eyeY1, eyeX2, eyeY2;
        
        if (direction === 'RIGHT') {
          eyeX1 = segment.x * CELL_SIZE + CELL_SIZE - eyeOffsetX - eyeSize;
          eyeY1 = segment.y * CELL_SIZE + eyeOffsetY;
          eyeX2 = segment.x * CELL_SIZE + CELL_SIZE - eyeOffsetX - eyeSize;
          eyeY2 = segment.y * CELL_SIZE + CELL_SIZE - eyeOffsetY - eyeSize;
        } else if (direction === 'LEFT') {
          eyeX1 = segment.x * CELL_SIZE + eyeOffsetX;
          eyeY1 = segment.y * CELL_SIZE + eyeOffsetY;
          eyeX2 = segment.x * CELL_SIZE + eyeOffsetX;
          eyeY2 = segment.y * CELL_SIZE + CELL_SIZE - eyeOffsetY - eyeSize;
        } else if (direction === 'UP') {
          eyeX1 = segment.x * CELL_SIZE + eyeOffsetX;
          eyeY1 = segment.y * CELL_SIZE + eyeOffsetY;
          eyeX2 = segment.x * CELL_SIZE + CELL_SIZE - eyeOffsetX - eyeSize;
          eyeY2 = segment.y * CELL_SIZE + eyeOffsetY;
        } else { // DOWN
          eyeX1 = segment.x * CELL_SIZE + eyeOffsetX;
          eyeY1 = segment.y * CELL_SIZE + CELL_SIZE - eyeOffsetY - eyeSize;
          eyeX2 = segment.x * CELL_SIZE + CELL_SIZE - eyeOffsetX - eyeSize;
          eyeY2 = segment.y * CELL_SIZE + CELL_SIZE - eyeOffsetY - eyeSize;
        }
        
        ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
        ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);
        
        // Add pupils
        ctx.fillStyle = 'black';
        ctx.fillRect(eyeX1 + 1, eyeY1 + 1, eyeSize - 2, eyeSize - 2);
        ctx.fillRect(eyeX2 + 1, eyeY2 + 1, eyeSize - 2, eyeSize - 2);
      }
    });

    // Draw game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#FF5252';
      ctx.textAlign = 'center';
      ctx.fillText(
        'GAME OVER',
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 - 30
      );
      
      ctx.font = '20px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(
        `Score: ${score}`,
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2
      );
      
      ctx.fillText(
        `High Score: ${Math.max(score, highScore)}`,
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 + 30
      );
      
      ctx.font = '16px Arial';
      ctx.fillText(
        'Press SPACE to play again',
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 + 70
      );
    }
    
    // Draw pause overlay
    if (paused && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(
        'PAUSED',
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 - 20
      );
      
      ctx.font = '16px Arial';
      ctx.fillText(
        'Press SPACE to continue',
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 + 20
      );
      
      ctx.fillText(
        'Arrow keys to move',
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 + 50
      );
    }
  }, [snake, food, direction, gameOver, paused, score, highScore, foodType]);

  // Mobile controls
  const handleControlClick = (newDirection: Direction) => {
    if (
      (newDirection === 'UP' && direction !== 'DOWN') ||
      (newDirection === 'DOWN' && direction !== 'UP') ||
      (newDirection === 'LEFT' && direction !== 'RIGHT') ||
      (newDirection === 'RIGHT' && direction !== 'LEFT')
    ) {
      setNextDirection(newDirection);
    }
  };

  return (
    <Card className="mt-4 w-full max-w-[600px] mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">Snake Game</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full mb-4 px-4">
            <div className="text-lg font-semibold bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
              Score: <span className="text-green-600 dark:text-green-400">{score}</span>
            </div>
            <div className="text-lg font-semibold bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
              High Score: <span className="text-yellow-600 dark:text-yellow-400">{highScore}</span>
            </div>
          </div>
          
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="bg-slate-50 dark:bg-slate-900"
            />
          </div>
          
          <div className="mt-6 w-full">
            {gameOver ? (
              <Button 
                onClick={resetGame} 
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                Play Again
              </Button>
            ) : (
              <Button 
                onClick={togglePause} 
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {paused ? "Start Game" : "Pause"}
              </Button>
            )}
          </div>
          
          {/* Mobile controls */}
          <div className="mt-6 flex w-48">
            <div className="col-start-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleControlClick('UP')}
                className="w-14 h-14 text-2xl"
              >
                ↑
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleControlClick('LEFT')}
              className="w-14 h-14 text-2xl"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleControlClick('DOWN')}
              className="w-14 h-14 text-2xl"
            >
              ↓
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleControlClick('RIGHT')}
              className="w-14 h-14 text-2xl"
            >
              →
            </Button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
            <p className="mb-1">Use arrow keys to control</p>
            <p className="mb-1">Space to pause/resume</p>
            <p>Press R to reset game</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-400 text-center justify-center">
        <p>Tip: Special gold food gives 25 points and extra length!</p>
      </CardFooter>
    </Card>
  );
}