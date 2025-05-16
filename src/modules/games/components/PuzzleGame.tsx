
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Slider } from "@components/ui/slider";
import { useToast } from "@hooks/use-toast";
import confetti from "canvas-confetti";
import { Loader2 } from "lucide-react";

const DEFAULT_SIZE = 3; // 3x3 puzzle by default

type PuzzleTile = {
  value: number;
  currentPos: { row: number; col: number };
  correctPos: { row: number; col: number };
};

export default function PuzzleGame() {
  const [gridSize, setGridSize] = useState<number>(DEFAULT_SIZE);
  const [tiles, setTiles] = useState<PuzzleTile[]>([]);
  const [emptyPos, setEmptyPos] = useState<{ row: number; col: number }>({ row: gridSize - 1, col: gridSize - 1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [bestMoves, setBestMoves] = useState<Record<number, number>>({});
  const [imageUrl, setImageUrl] = useState<string>("https://source.unsplash.com/random/300x300?nature");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { toast } = useToast();
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  
  // Load best moves from local storage
  useEffect(() => {
    const savedBestMoves = localStorage.getItem('puzzleBestMoves');
    if (savedBestMoves) {
      setBestMoves(JSON.parse(savedBestMoves));
    }
  }, []);
  
  // Initialize the game
  useEffect(() => {
    loadImage();
  }, [gridSize]);
  
  // Check win condition whenever tiles change
  useEffect(() => {
    if (tiles.length > 0 && gameStarted && !gameComplete) {
      checkWinCondition();
    }
  }, [tiles]);
  
  // Load a random image
  const loadImage = () => {
    setIsLoading(true);
    
    // Create new image element
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    // Set a random image URL
    const randomSeed = Math.random();
    img.src = `https://source.unsplash.com/random/300x300?nature&${randomSeed}`;
    
    img.onload = () => {
      imageRef.current = img;
      initializeGame();
      setIsLoading(false);
    };
    
    img.onerror = () => {
      toast({
        title: "Error loading image",
        description: "Using default image setup instead",
        variant: "destructive"
      });
      setIsLoading(false);
      initializeGame();
    };
  };
  
  // Initialize the game tiles
  const initializeGame = () => {
    const newTiles: PuzzleTile[] = [];
    
    // Create tiles in the solved state first
    for (let i = 0; i < gridSize * gridSize - 1; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      newTiles.push({
        value: i + 1,
        currentPos: { row, col },
        correctPos: { row, col }
      });
    }
    
    setTiles(newTiles);
    setEmptyPos({ row: gridSize - 1, col: gridSize - 1 });
    setMoves(0);
    setGameComplete(false);
    setGameStarted(false);
    
    drawPuzzle(newTiles, { row: gridSize - 1, col: gridSize - 1 });
  };
  
  // Shuffle the puzzle tiles
  const shufflePuzzle = () => {
    // Make a deep copy of the current tiles
    let newTiles = JSON.parse(JSON.stringify(tiles));
    let newEmptyPos = { ...emptyPos };
    
    // Perform a series of random valid moves to shuffle
    const moves = gridSize * gridSize * 100; // Number of random moves
    
    for (let i = 0; i < moves; i++) {
      // Get valid moves from current empty position
      const validMoves = getValidMoves(newEmptyPos, gridSize);
      
      // Select a random move
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      
      // Find the tile at the position we want to move
      const tileToMove = newTiles.find(
        tile => 
          tile.currentPos.row === randomMove.row && 
          tile.currentPos.col === randomMove.col
      );
      
      if (tileToMove) {
        // Move the tile to the empty position
        tileToMove.currentPos = { ...newEmptyPos };
        
        // Update empty position
        newEmptyPos = { ...randomMove };
      }
    }
    
    setTiles(newTiles);
    setEmptyPos(newEmptyPos);
    setMoves(0);
    setGameStarted(true);
    
    drawPuzzle(newTiles, newEmptyPos);
  };
  
  // Get valid moves from a position
  const getValidMoves = (pos: { row: number; col: number }, size: number) => {
    const { row, col } = pos;
    const validMoves = [];
    
    // Check up
    if (row > 0) {
      validMoves.push({ row: row - 1, col });
    }
    
    // Check down
    if (row < size - 1) {
      validMoves.push({ row: row + 1, col });
    }
    
    // Check left
    if (col > 0) {
      validMoves.push({ row, col: col - 1 });
    }
    
    // Check right
    if (col < size - 1) {
      validMoves.push({ row, col: col + 1 });
    }
    
    return validMoves;
  };
  
  // Handle a tile click
  const handleTileClick = (clickedPos: { row: number; col: number }) => {
    if (gameComplete) return;
    
    // Check if the clicked tile is adjacent to the empty space
    if (isAdjacent(clickedPos, emptyPos)) {
      setGameStarted(true);
      
      // Find the clicked tile
      const clickedTileIndex = tiles.findIndex(
        tile => 
          tile.currentPos.row === clickedPos.row && 
          tile.currentPos.col === clickedPos.col
      );
      
      if (clickedTileIndex !== -1) {
        // Move the tile to the empty position
        const newTiles = [...tiles];
        newTiles[clickedTileIndex] = {
          ...newTiles[clickedTileIndex],
          currentPos: { ...emptyPos }
        };
        
        // Update the empty position
        const newEmptyPos = { ...clickedPos };
        
        setTiles(newTiles);
        setEmptyPos(newEmptyPos);
        setMoves(prev => prev + 1);
        
        drawPuzzle(newTiles, newEmptyPos);
      }
    }
  };
  
  // Check if two positions are adjacent
  const isAdjacent = (pos1: { row: number; col: number }, pos2: { row: number; col: number }) => {
    // Adjacent if they differ by 1 in either row or column (but not both)
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };
  
  // Check if the puzzle is solved
  const checkWinCondition = () => {
    const solved = tiles.every(
      tile => 
        tile.currentPos.row === tile.correctPos.row && 
        tile.currentPos.col === tile.correctPos.col
    );
    
    if (solved) {
      setGameComplete(true);
      triggerWinAnimation();
      
      // Update best moves if this is better
      const currentBest = bestMoves[gridSize] || Infinity;
      if (moves < currentBest) {
        const newBestMoves = { ...bestMoves, [gridSize]: moves };
        setBestMoves(newBestMoves);
        localStorage.setItem('puzzleBestMoves', JSON.stringify(newBestMoves));
        
        toast({
          title: "New record!",
          description: `New best for ${gridSize}x${gridSize}: ${moves} moves`
        });
      } else {
        toast({
          title: "Puzzle Complete!",
          description: `You solved it in ${moves} moves`
        });
      }
    }
  };
  
  // Draw the puzzle on the canvas
  const drawPuzzle = (currentTiles: PuzzleTile[], currentEmpty: { row: number; col: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasSize = canvas.width; // Assuming square canvas
    const tileSize = canvasSize / gridSize;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Draw background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Draw each tile
    currentTiles.forEach(tile => {
      const { row, col } = tile.currentPos;
      const x = col * tileSize;
      const y = row * tileSize;
      
      // Draw tile background
      ctx.fillStyle = "#fff";
      ctx.fillRect(x, y, tileSize, tileSize);
      
      // Draw tile image if we have one
      if (imageRef.current) {
        const imgSize = imageRef.current.width / gridSize;
        const sourceX = tile.correctPos.col * imgSize;
        const sourceY = tile.correctPos.row * imgSize;
        
        ctx.drawImage(
          imageRef.current,
          sourceX, sourceY, imgSize, imgSize,
          x, y, tileSize, tileSize
        );
      } else {
        // Fallback to colored tiles
        ctx.fillStyle = `hsl(${(tile.value * 25) % 360}, 70%, 70%)`;
        ctx.fillRect(x, y, tileSize, tileSize);
      }
      
      // Draw tile borders
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, tileSize, tileSize);
      
      // Draw tile numbers if enabled
      if (showNumbers) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.font = `bold ${tileSize / 3}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          tile.value.toString(),
          x + tileSize / 2,
          y + tileSize / 2
        );
      }
    });
    
    // Draw empty space
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(
      currentEmpty.col * tileSize,
      currentEmpty.row * tileSize,
      tileSize,
      tileSize
    );
    
    // Draw grid lines
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= gridSize; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * tileSize, 0);
      ctx.lineTo(i * tileSize, canvasSize);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * tileSize);
      ctx.lineTo(canvasSize, i * tileSize);
      ctx.stroke();
    }
    
    // Draw win overlay
    if (gameComplete) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "Puzzle Complete!",
        canvasSize / 2,
        canvasSize / 2 - 15
      );
      
      ctx.font = "16px Arial";
      ctx.fillText(
        `Solved in ${moves} moves`,
        canvasSize / 2,
        canvasSize / 2 + 15
      );
    }
  };
  
  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const tileSize = canvas.width / gridSize;
    
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    
    handleTileClick({ row, col });
  };
  
  // Trigger win animation
  const triggerWinAnimation = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };
  
  // Change the grid size
  const changeGridSize = (newSize: number) => {
    setGridSize(newSize);
    setIsLoading(true);
  };

  return (
    <Card className="mt-4 w-full max-w-[500px] mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Sliding Puzzle</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full mb-4">
            <div className="text-lg">Moves: {moves}</div>
            <div className="text-lg">
              Best: {bestMoves[gridSize] ? bestMoves[gridSize] : "-"}
            </div>
            <div className="text-lg">Size: {gridSize}×{gridSize}</div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center w-[300px] h-[300px] bg-gray-100 rounded border">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="border border-gray-300 rounded bg-white">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                onClick={handleCanvasClick}
                className="cursor-pointer"
              />
            </div>
          )}
          
          <div className="w-full mt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">Puzzle Size: {gridSize}×{gridSize}</div>
                <div className="text-sm">{gridSize === 2 ? 'Easy' : gridSize === 3 ? 'Medium' : gridSize === 4 ? 'Hard' : 'Expert'}</div>
              </div>
              <Slider
                defaultValue={[gridSize]}
                min={2}
                max={5}
                step={1}
                onValueChange={(value) => changeGridSize(value[0])}
                disabled={gameStarted && !gameComplete}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={shufflePuzzle} 
                disabled={isLoading} 
                variant="default"
                className="flex-1"
              >
                {gameStarted && !gameComplete ? "Restart" : "Start Game"}
              </Button>
              
              <Button
                onClick={() => setShowNumbers(!showNumbers)}
                variant="outline"
              >
                {showNumbers ? "Hide Numbers" : "Show Numbers"}
              </Button>
            </div>
            
            <Button
              onClick={loadImage}
              variant="outline"
              className="w-full"
              disabled={isLoading || (gameStarted && !gameComplete)}
            >
              New Image
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-center text-gray-500 block">
        <p>
          Click on tiles adjacent to the empty space to move them. Arrange all tiles in order to win.
        </p>
      </CardFooter>
    </Card>
  );
}
