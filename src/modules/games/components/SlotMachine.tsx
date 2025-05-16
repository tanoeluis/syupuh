import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { useToast } from "@hooks/use-toast";
import { Gamepad2, Volume, VolumeX, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

// Mahjong tile symbols with their probabilities
const SYMBOLS = [
  { id: 0, symbol: '🀇', label: 'Bamboo 1', probability: 20, value: 1 },
  { id: 1, symbol: '🀈', label: 'Bamboo 2', probability: 17, value: 2 },
  { id: 2, symbol: '🀉', label: 'Bamboo 3', probability: 15, value: 3 },
  { id: 3, symbol: '🀊', label: 'Bamboo 4', probability: 12, value: 5 },
  { id: 4, symbol: '🀋', label: 'Bamboo 5', probability: 10, value: 8 },
  { id: 5, symbol: '🀌', label: 'Bamboo 6', probability: 8, value: 10 },
  { id: 6, symbol: '🀍', label: 'Bamboo 7', probability: 5, value: 20 },
  { id: 7, symbol: '🀎', label: 'Bamboo 8', probability: 3, value: 50 },
  { id: 8, symbol: '🀏', label: 'Bamboo 9', probability: 3, value: 50 },
  { id: 9, symbol: '🀀', label: 'East Wind', probability: 2, value: 100 },
  { id: 10, symbol: '🀁', label: 'South Wind', probability: 2, value: 100 },
  { id: 11, symbol: '🀂', label: 'West Wind', probability: 2, value: 100 },
  { id: 12, symbol: '🀃', label: 'North Wind', probability: 2, value: 100 },
  { id: 13, symbol: '🀄', label: 'Red Dragon', probability: 1, value: 200 },
];

// Create a weighted array based on probabilities
const createWeightedArray = () => {
  const weightedArray: number[] = [];
  
  SYMBOLS.forEach(symbol => {
    for (let i = 0; i < symbol.probability; i++) {
      weightedArray.push(symbol.id);
    }
  });
  
  return weightedArray;
};

const WEIGHTED_SYMBOLS = createWeightedArray();

export default function SlotGame() {
  const [credits, setCredits] = useState(100);
  const [bet, setBet] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState([
    [SYMBOLS[0], SYMBOLS[2], SYMBOLS[4]],
    [SYMBOLS[1], SYMBOLS[3], SYMBOLS[5]],
    [SYMBOLS[2], SYMBOLS[4], SYMBOLS[6]],
  ]);
  const [winAmount, setWinAmount] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [muted, setMuted] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const buttonSound = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();
  
  // Initialize audio elements
  useEffect(() => {
    spinSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3');
    winSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3');
    buttonSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    
    return () => {
      if (spinSound.current) spinSound.current.pause();
      if (winSound.current) winSound.current.pause();
      if (buttonSound.current) buttonSound.current.pause();
    };
  }, []);

  // Start with random reels
  useEffect(() => {
    // Randomize initial reels
    const initialReels = reels.map(() => 
      Array(3).fill(null).map(() => {
        const randomId = WEIGHTED_SYMBOLS[Math.floor(Math.random() * WEIGHTED_SYMBOLS.length)];
        return SYMBOLS[randomId];
      })
    );
    setReels(initialReels);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const playSound = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (muted || !audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(error => console.error("Audio play failed:", error));
  };

  const getRandomSymbol = () => {
    const randomId = WEIGHTED_SYMBOLS[Math.floor(Math.random() * WEIGHTED_SYMBOLS.length)];
    return SYMBOLS[randomId];
  };

  const spin = () => {
    if (credits < bet) {
      toast({
        title: "Not enough credits",
        description: "Please add more credits or lower your bet",
        variant: "destructive"
      });
      return;
    }
    
    // Reset previous win state
    setShowWin(false);
    setWinAmount(0);
    
    // Play spin sound
    playSound(spinSound);
    
    // Deduct bet
    setCredits(prev => prev - bet);
    
    // Start spinning
    setIsSpinning(true);
    
    // Generate new symbols
    const newReels = reels.map(() => 
      Array(3).fill(null).map(getRandomSymbol)
    );
    
    // Simulate spinning delay for each reel
    setTimeout(() => {
      setReels(prev => [
        newReels[0],
        prev[1],
        prev[2]
      ]);
      
      setTimeout(() => {
        setReels(prev => [
          prev[0],
          newReels[1],
          prev[2]
        ]);
        
        setTimeout(() => {
          setReels(prev => [
            prev[0],
            prev[1],
            newReels[2]
          ]);
          
          // Check for wins after all reels have stopped
          setTimeout(() => {
            checkWins(newReels);
            setIsSpinning(false);
            
            // Continue autoplay if enabled
            if (autoPlay && credits - bet >= 0) {
              setTimeout(() => {
                spin();
              }, 1000);
            }
          }, 300);
        }, 300);
      }, 300);
    }, 300);
  };

  const checkWins = (finalReels: typeof reels) => {
    // Get middle row (payline)
    const payline = [finalReels[0][1], finalReels[1][1], finalReels[2][1]];
    
    // Check for 3 of a kind
    if (payline[0].id === payline[1].id && payline[1].id === payline[2].id) {
      const winMultiplier = payline[0].value * 5; // 5x multiplier for three of a kind
      const win = bet * winMultiplier;
      
      setWinAmount(win);
      setCredits(prev => prev + win);
      setShowWin(true);
      
      // Trigger confetti for big wins
      if (winMultiplier >= 20) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      // Play win sound
      playSound(winSound);
      
    } 
    // Check for 2 of a kind (first two or last two)
    else if (
      payline[0].id === payline[1].id || 
      payline[1].id === payline[2].id
    ) {
      const matchingSymbol = payline[0].id === payline[1].id 
        ? payline[0] 
        : payline[1];
      
      const winMultiplier = matchingSymbol.value * 2; // 2x multiplier for two of a kind
      const win = bet * winMultiplier;
      
      setWinAmount(win);
      setCredits(prev => prev + win);
      setShowWin(true);
      
      // Play win sound
      playSound(winSound);
    }
  };
  
  const changeBet = (amount: number) => {
    playSound(buttonSound);
    
    const newBet = bet + amount;
    if (newBet >= 1 && newBet <= 10) {
      setBet(newBet);
    }
  };
  
  const resetGame = () => {
    setCredits(100);
    setBet(1);
    setAutoPlay(false);
    setShowWin(false);
    setWinAmount(0);
    
    toast({
      title: "Game Reset",
      description: "Credits have been reset to 100",
    });
  };

  return (
    <div className="mt-4 max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Gamepad2 className="text-primary" />
          Mahjong Slot
        </h1>
        <p className="text-muted-foreground">
          Match the Mahjong tiles to win big!
        </p>
      </div>

      <Card className="shadow-lg overflow-hidden relative bg-gradient-to-b from-red-900 to-red-800 text-white border-none">
        <CardHeader className="bg-gradient-to-r from-red-700 to-amber-700 pb-4 pt-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl text-white font-chinese">麻将老虎机</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMuted(!muted)}
                className="text-white hover:bg-white/20"
              >
                {muted ? <VolumeX size={18} /> : <Volume size={18} />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={resetGame}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw size={18} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Status bar */}
          <div className="flex justify-between mb-4 bg-black/30 p-3 rounded-md border border-amber-500">
            <div className="text-lg font-bold">
              Credits: <span className="text-yellow-400">{credits}</span>
            </div>
            <div className="text-lg font-bold">
              Bet: <span className="text-green-400">{bet}</span>
            </div>
          </div>
          
          {/* Slot machine */}
          <div className="bg-gradient-to-b from-red-800 to-red-900 p-4 rounded-lg shadow-inner border-4 border-amber-500 mb-5 overflow-hidden">
            {/* Reels container */}
            <div className="flex justify-between gap-2">
              {reels.map((reel, reelIndex) => (
                <div 
                  key={reelIndex}
                  className="flex-1 bg-amber-100 rounded-md overflow-hidden shadow-inner border-2 border-amber-700"
                >
                  <div className="flex flex-col items-center">
                    {reel.map((symbol, symbolIndex) => (
                      <motion.div
                        key={symbolIndex}
                        className={`flex items-center justify-center w-full py-5 text-5xl ${
                          symbolIndex === 1 ? "bg-amber-200" : "bg-amber-50"
                        }`}
                        animate={isSpinning ? {
                          y: [0, -20, 0],
                          transition: {
                            repeat: Infinity,
                            duration: 0.2,
                          }
                        } : {}}
                      >
                        {symbol.symbol}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Horizontal line for payline */}
            <div className="flex justify-between gap-2 relative -mt-[2.5rem] pointer-events-none">
              <div className="absolute left-0 right-0 h-1 bg-yellow-400 shadow-lg"></div>
            </div>
          </div>
          
          {/* Win display */}
          {showWin && (
            <motion.div 
              className="bg-green-600 text-white text-center p-3 rounded-md mb-4 font-bold text-lg border-2 border-yellow-300 shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              WIN! +{winAmount} credits
            </motion.div>
          )}
          
          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => changeBet(-1)}
                disabled={bet <= 1 || isSpinning}
                className="flex-1 border-amber-500 text-amber-500 hover:bg-amber-500/20 font-bold"
              >
                - Bet
              </Button>
              <Button
                variant="outline"
                onClick={() => changeBet(1)}
                disabled={bet >= 10 || isSpinning}
                className="flex-1 border-amber-500 text-amber-500 hover:bg-amber-500/20 font-bold"
              >
                + Bet
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={autoPlay ? "destructive" : "secondary"}
                onClick={() => setAutoPlay(!autoPlay)}
                disabled={isSpinning}
                className="flex-1 font-bold"
              >
                {autoPlay ? "Stop Auto" : "Auto Play"}
              </Button>
              <Button
                variant="default"
                onClick={spin}
                disabled={isSpinning || credits < bet}
                className="flex-1 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 font-bold text-white"
              >
                {isSpinning ? "Spinning..." : "SPIN"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4 text-sm text-center text-muted-foreground">
        <p>This is a demo Mahjong slot game. No real money is involved.</p>
        <p>Match tiles on the middle payline to win!</p>
      </div>
    </div>
  );
}