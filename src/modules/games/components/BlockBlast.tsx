import { useState, useEffect, useRef } from 'react';
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { useToast } from "@hooks/use-toast";
import confetti from 'canvas-confetti';

// Define colors for the blocks
const COLORS = ['#FF5252', '#4CAF50', '#2196F3', '#FFEB3B', '#9C27B0', '#FF9800'];

// Game configuration
const CONFIG = {
  rows: 10,
  cols: 10,
  minMatch: 3,
};

type Block = {
  color: string;
  checked: boolean;
  removed: boolean;
};

export default function BlockBlast() {
  const [grid, setGrid] = useState<Block[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Initialize the game grid
  useEffect(() => {
    initializeGame();
    setIsFirstRender(false);
  }, []);

  const initializeGame = () => {
    const newGrid: Block[][] = [];
    
    for (let i = 0; i < CONFIG.rows; i++) {
      const row: Block[] = [];
      for (let j = 0; j < CONFIG.cols; j++) {
        row.push({
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          checked: false,
          removed: false,
        });
      }
      newGrid.push(row);
    }
    
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  };

  // Check if a block has matching neighbors
  const checkBlock = (row: number, col: number, color: string, visited: boolean[][]): number => {
    // Check bounds and if already visited
    if (
      row < 0 || 
      row >= CONFIG.rows || 
      col < 0 || 
      col >= CONFIG.cols || 
      visited[row][col] || 
      !grid || 
      !grid[row] || 
      !grid[row][col] || 
      grid[row][col].color !== color || 
      grid[row][col].removed
    ) {
      return 0;
    }
    
    visited[row][col] = true;
    
    // Check neighbors (up, right, down, left)
    return 1 + 
      checkBlock(row - 1, col, color, visited) + 
      checkBlock(row, col + 1, color, visited) + 
      checkBlock(row + 1, col, color, visited) + 
      checkBlock(row, col - 1, color, visited);
  };

  // Remove connected blocks
  const removeBlocks = (row: number, col: number, color: string) => {
    // Create a 2D array to keep track of visited blocks
    const visited: boolean[][] = Array(CONFIG.rows).fill(0).map(() => Array(CONFIG.cols).fill(false));
    
    // Check if there are enough connected blocks
    const connectedBlocks = checkBlock(row, col, color, visited);
    
    if (connectedBlocks >= CONFIG.minMatch) {
      // Create a new grid with marked blocks for removal
      const newGrid = grid.map((gridRow, rowIdx) => 
        gridRow.map((block, colIdx) => ({
          ...block,
          removed: block.removed || visited[rowIdx][colIdx],
        }))
      );
      
      setGrid(newGrid);
      
      // Update score
      const points = connectedBlocks * 10;
      setScore(prevScore => prevScore + points);
      
      // Show score toast
      toast({
        title: `+${points} points!`,
        description: `${connectedBlocks} blocks cleared`,
      });
      
      // Trigger confetti effect for large matches
      if (connectedBlocks >= 5 && canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { 
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          }
        });
      }
      
      // Schedule gravity effect and refilling
      setTimeout(() => {
        applyGravity();
      }, 300);
      
      return true;
    }
    
    return false;
  };

  // Apply gravity to make blocks fall
  const applyGravity = () => {
    // Copy the grid
    const newGrid = JSON.parse(JSON.stringify(grid));
    
    // Apply gravity: move blocks down to fill empty spaces
    for (let col = 0; col < CONFIG.cols; col++) {
      let writePos = CONFIG.rows - 1;
      
      // Scan from bottom to top
      for (let row = CONFIG.rows - 1; row >= 0; row--) {
        if (!newGrid[row][col].removed) {
          // If this position has a block, move it down to the write position
          if (writePos !== row) {
            newGrid[writePos][col] = newGrid[row][col];
            newGrid[row][col] = { 
              color: '', 
              checked: false, 
              removed: true 
            };
          }
          writePos--;
        }
      }
    }
    
    // Fill removed blocks with new ones at the top
    for (let col = 0; col < CONFIG.cols; col++) {
      for (let row = 0; row < CONFIG.rows; row++) {
        if (newGrid[row][col].removed) {
          newGrid[row][col] = {
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            checked: false,
            removed: false,
          };
        }
      }
    }
    
    setGrid(newGrid);
    
    // Check if any moves are possible
    setTimeout(checkGameOver, 500);
  };

  // Check if game is over (no possible moves)
  const checkGameOver = () => {
    // Check each cell for potential matches
    for (let row = 0; row < CONFIG.rows; row++) {
      for (let col = 0; col < CONFIG.cols; col++) {
        if (!grid[row][col].removed) {
          const visited: boolean[][] = Array(CONFIG.rows).fill(0).map(() => Array(CONFIG.cols).fill(false));
          const connectedBlocks = checkBlock(row, col, grid[row][col].color, visited);
          
          if (connectedBlocks >= CONFIG.minMatch) {
            // Game can continue
            return;
          }
        }
      }
    }
    
    // No moves found, game is over
    setGameOver(true);
    toast({
      title: "Game Over!",
      description: `Final score: ${score}`,
      variant: "destructive",
    });
  };

  // Handle block click
  const handleBlockClick = (row: number, col: number) => {
    if (gameOver || !grid[row][col]) return;
    
    const color = grid[row][col].color;
    removeBlocks(row, col, color);
  };

  // No need to render if we haven't initialized the grid yet
  if (isFirstRender || !grid || grid.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Block Blast</h2>
          <div className="text-xl font-semibold">Score: {score}</div>
        </div>
        
        <div className="relative">
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
          
          <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
            {grid.map((row, rowIdx) => (
              row.map((block, colIdx) => (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  className={`w-full aspect-square rounded-md transition-all ${block.removed ? 'opacity-0' : 'hover:scale-105'}`}
                  style={{ backgroundColor: block.color }}
                  onClick={() => handleBlockClick(rowIdx, colIdx)}
                  disabled={gameOver || block.removed}
                />
              ))
            ))}
          </div>
          
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center rounded-md">
              <h3 className="text-white text-2xl font-bold mb-4">Game Over!</h3>
              <p className="text-white text-lg mb-4">Final Score: {score}</p>
              <Button onClick={initializeGame}>Play Again</Button>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button onClick={initializeGame}>New Game</Button>
        </div>
      </CardContent>
    </Card>
  );
}
