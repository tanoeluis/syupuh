import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { useToast } from "@hooks/use-toast";
import { Gamepad2, Volume, VolumeX, RefreshCw, Zap, Gem } from 'lucide-react';
import confetti from 'canvas-confetti';

// Mahjong-themed symbols
const MAHJONG_SYMBOLS = [
  { id: 0, symbol: '🀄', label: 'Red Dragon', probability: 15, value: 2 },
  { id: 1, symbol: '🀇', label: 'Character 1', probability: 18, value: 1 },
  { id: 2, symbol: '🀏', label: 'Bamboo 9', probability: 16, value: 1.5 },
  { id: 3, symbol: '🀀', label: 'East Wind', probability: 12, value: 3 },
  { id: 4, symbol: '🀫', label: 'Back', probability: 10, value: 5 },
  { id: 5, symbol: '🎋', label: 'Tanabata', probability: 8, value: 8 },
  { id: 6, symbol: '🎴', label: 'Flower', probability: 5, value: 15 },
  { id: 7, symbol: '💰', label: 'Money Bag', probability: 3, value: 25 },
  { id: 8, symbol: '🀢', label: 'Circle 2', probability: 13, value: 1.2 },
];

// Greek mythology (Zeus) themed symbols
const ZEUS_SYMBOLS = [
  { id: 0, symbol: '⚡', label: 'Lightning', probability: 15, value: 2 },
  { id: 1, symbol: '🏛️', label: 'Temple', probability: 18, value: 1 },
  { id: 2, symbol: '🦅', label: 'Eagle', probability: 16, value: 1.5 },
  { id: 3, symbol: '🌩️', label: 'Storm', probability: 12, value: 3 },
  { id: 4, symbol: '🛡️', label: 'Shield', probability: 10, value: 5 },
  { id: 5, symbol: '🏺', label: 'Amphora', probability: 8, value: 8 },
  { id: 6, symbol: '👑', label: 'Crown', probability: 5, value: 15 },
  { id: 7, symbol: '🧿', label: 'Eye of Zeus', probability: 3, value: 25 },
  { id: 8, symbol: '🌊', label: 'Wave', probability: 13, value: 1.2 },
];

const THEMES = {
  mahjong: {
    name: "Mahjong Treasures",
    symbols: MAHJONG_SYMBOLS,
    background: "bg-gradient-to-b from-red-900 to-amber-900",
    headerBg: "bg-gradient-to-r from-red-700 to-amber-700",
    reelBorder: "border-amber-500",
    paylineBg: "bg-amber-100/30",
    specialColor: "text-amber-400"
  },
  zeus: {
    name: "Thunder of Zeus",
    symbols: ZEUS_SYMBOLS,
    background: "bg-gradient-to-b from-blue-900 to-purple-900",
    headerBg: "bg-gradient-to-r from-blue-700 to-purple-700",
    reelBorder: "border-blue-400",
    paylineBg: "bg-blue-100/30",
    specialColor: "text-blue-300"
  }
};

const createWeightedArray = (symbols: typeof MAHJONG_SYMBOLS) => {
  const weightedArray: number[] = [];
  
  symbols.forEach(symbol => {
    for (let i = 0; i < symbol.probability; i++) {
      weightedArray.push(symbol.id);
    }
  });
  
  return weightedArray;
};

export default function SlotGame() {
  const [theme, setTheme] = useState<keyof typeof THEMES>('zeus');
  const currentTheme = THEMES[theme];
  const [weightedSymbols, setWeightedSymbols] = useState(createWeightedArray(ZEUS_SYMBOLS));
  
  const [credits, setCredits] = useState(100);
  const [bet, setBet] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState([
    [ZEUS_SYMBOLS[0], ZEUS_SYMBOLS[2], ZEUS_SYMBOLS[4]],
    [ZEUS_SYMBOLS[1], ZEUS_SYMBOLS[3], ZEUS_SYMBOLS[5]],
    [ZEUS_SYMBOLS[2], ZEUS_SYMBOLS[4], ZEUS_SYMBOLS[6]],
  ]);
  const [winAmount, setWinAmount] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [muted, setMuted] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [bonusRound, setBonusRound] = useState(false);
  
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const buttonSound = useRef<HTMLAudioElement | null>(null);
  const bonusSound = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();
  
  useEffect(() => {
    spinSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3');
    winSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3');
    buttonSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    bonusSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2595/2595-preview.mp3');
    
    return () => {
      if (spinSound.current) spinSound.current.pause();
      if (winSound.current) winSound.current.pause();
      if (buttonSound.current) buttonSound.current.pause();
      if (bonusSound.current) bonusSound.current.pause();
    };
  }, []);

  useEffect(() => {
    const currentSymbols = theme === 'mahjong' ? MAHJONG_SYMBOLS : ZEUS_SYMBOLS;
    setWeightedSymbols(createWeightedArray(currentSymbols));
    
    // Randomize initial reels with new theme
    const initialReels = reels.map(() => 
      Array(3).fill(null).map(() => {
        const randomId = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
        return currentSymbols[randomId];
      })
    );
    setReels(initialReels);
  }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps

  const playSound = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (muted || !audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(error => console.error("Audio play failed:", error));
  };

  const getRandomSymbol = () => {
    const randomId = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
    return theme === 'mahjong' ? MAHJONG_SYMBOLS[randomId] : ZEUS_SYMBOLS[randomId];
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
    
    setShowWin(false);
    setWinAmount(0);
    setBonusRound(false);
    
    playSound(spinSound);
    setCredits(prev => prev - bet);
    setIsSpinning(true);
    
    const newReels = reels.map(() => 
      Array(3).fill(null).map(getRandomSymbol)
    );
    
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
          
          setTimeout(() => {
            checkWins(newReels);
            setIsSpinning(false);
            
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
    const payline = [finalReels[0][1], finalReels[1][1], finalReels[2][1]];
    
    // Check for bonus symbol (last symbol in array)
    if (payline.some(symbol => symbol.id === currentTheme.symbols.length - 1)) {
      if (Math.random() < 0.3) { // 30% chance to trigger bonus
        triggerBonus();
        return;
      }
    }
    
    // Check for 3 of a kind
    if (payline[0].id === payline[1].id && payline[1].id === payline[2].id) {
      const winMultiplier = payline[0].value * 5;
      const win = bet * winMultiplier;
      
      setWinAmount(win);
      setCredits(prev => prev + win);
      setShowWin(true);
      
      if (winMultiplier >= 20) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      playSound(winSound);
    } 
    // Check for 2 of a kind
    else if (payline[0].id === payline[1].id || payline[1].id === payline[2].id) {
      const matchingSymbol = payline[0].id === payline[1].id 
        ? payline[0] 
        : payline[1];
      
      const winMultiplier = matchingSymbol.value * 2;
      const win = bet * winMultiplier;
      
      setWinAmount(win);
      setCredits(prev => prev + win);
      setShowWin(true);
      playSound(winSound);
    }
  };
  
  const triggerBonus = () => {
    setBonusRound(true);
    playSound(bonusSound);
    
    // Bonus game gives random multiplier (2x to 10x)
    const multiplier = Math.floor(Math.random() * 9) + 2;
    const win = bet * multiplier * 5; // Base 5x for bonus
    
    setTimeout(() => {
      setWinAmount(win);
      setCredits(prev => prev + win);
      setShowWin(true);
      
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
      
      playSound(winSound);
    }, 2000);
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
    setBonusRound(false);
    
    toast({
      title: "Game Reset",
      description: "Credits have been reset to 100",
    });
  };

  const changeTheme = () => {
    playSound(buttonSound);
    setTheme(prev => prev === 'mahjong' ? 'zeus' : 'mahjong');
  };

  return (
    <div className="mt-4 max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          {theme === 'zeus' ? <Zap className="text-blue-400" /> : <Gem className="text-amber-400" />}
          {currentTheme.name}
        </h1>
        <p className="text-muted-foreground">
          {theme === 'zeus' ? "Feel the power of the gods!" : "Discover ancient mahjong treasures!"}
        </p>
      </div>

      <Card className={`shadow-lg overflow-hidden relative ${currentTheme.background} text-white border-none`}>
        <CardHeader className={`${currentTheme.headerBg} pb-4 pt-6`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl text-white">{currentTheme.name}</CardTitle>
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
                onClick={changeTheme}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw size={18} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Status bar */}
          <div className="flex justify-between mb-4 bg-black/30 p-3 rounded-md">
            <div className="text-lg font-bold">
              Credits: <span className="text-yellow-400">{credits}</span>
            </div>
            <div className="text-lg font-bold">
              Bet: <span className="text-green-400">{bet}</span>
            </div>
          </div>
          
          {/* Slot machine */}
          <div className={`bg-gradient-to-b from-gray-700 to-gray-900 p-4 rounded-lg shadow-inner border ${currentTheme.reelBorder} mb-5 overflow-hidden relative`}>
            {/* Bonus round overlay */}
            {bonusRound && (
              <motion.div 
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="text-4xl font-bold text-center p-8"
                  animate={{
                    scale: [1, 1.2, 1],
                    color: ['#fff', currentTheme.specialColor, '#fff'],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                >
                  {theme === 'zeus' ? 'ZEUS BONUS!' : 'MAHJONG BONUS!'}
                </motion.div>
              </motion.div>
            )}
            
            {/* Reels container */}
            <div className="flex justify-between gap-2 relative z-0">
              {reels.map((reel, reelIndex) => (
                <div 
                  key={reelIndex}
                  className="flex-1 bg-white/10 rounded-md overflow-hidden shadow-inner border-2 border-white/20"
                >
                  <div className="flex flex-col items-center">
                    {reel.map((symbol, symbolIndex) => (
                      <motion.div
                        key={symbolIndex}
                        className={`flex items-center justify-center w-full py-5 text-4xl ${
                          symbolIndex === 1 ? currentTheme.paylineBg : ""
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
            
            {/* Payline indicator */}
            <div className="flex justify-between gap-2 relative -mt-[2.5rem] pointer-events-none">
              <div className="absolute left-0 right-0 h-0.5 bg-yellow-400 shadow-lg shadow-yellow-400/50"></div>
            </div>
          </div>
          
          {/* Win display */}
          {showWin && (
            <motion.div 
              className="bg-gradient-to-r from-green-600 to-emerald-500 text-white text-center p-3 rounded-md mb-4 font-bold text-lg shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {bonusRound ? 'BONUS WIN! ' : 'WIN! '} 
              +{winAmount} credits
            </motion.div>
          )}
          
          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => changeBet(-1)}
                disabled={bet <= 1 || isSpinning}
                className="flex-1 border-white/20 text-white hover:bg-white/20"
              >
                - Bet
              </Button>
              <Button
                variant="outline"
                onClick={() => changeBet(1)}
                disabled={bet >= 10 || isSpinning}
                className="flex-1 border-white/20 text-white hover:bg-white/20"
              >
                + Bet
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={autoPlay ? "destructive" : "secondary"}
                onClick={() => setAutoPlay(!autoPlay)}
                disabled={isSpinning}
                className="flex-1"
              >
                {autoPlay ? "Stop Auto" : "Auto Play"}
              </Button>
              <Button
                variant="default"
                onClick={spin}
                disabled={isSpinning || credits < bet}
                className={`flex-1 bg-gradient-to-r ${theme === 'zeus' ? 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'from-red-500 to-amber-600 hover:from-red-600 hover:to-amber-700'} text-white font-bold`}
              >
                {isSpinning ? "Spinning..." : "SPIN"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4 text-sm text-center text-muted-foreground">
        <p>Match symbols on the payline to win. Bonus symbols trigger special rounds!</p>
        <p className="mt-1">Click the refresh icon to switch between Mahjong and Zeus themes.</p>
      </div>
    </div>
  );
}