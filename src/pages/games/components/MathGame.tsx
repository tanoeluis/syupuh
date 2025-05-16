
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { useToast } from "@hooks/use-toast";
import { Progress } from "@components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import confetti from "canvas-confetti";

type Difficulty = "easy" | "medium" | "hard" | "expert";
type Operation = "addition" | "subtraction" | "multiplication" | "division" | "mixed";

export default function MathGame() {
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<Record<string, number>>({});
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentAnswer, setCurrentAnswer] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [operation, setOperation] = useState<Operation>("mixed");
  const [streak, setStreak] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Load high scores from local storage
  useEffect(() => {
    const savedHighScores = localStorage.getItem('mathGameHighScores');
    if (savedHighScores) {
      setHighScore(JSON.parse(savedHighScores));
    }
  }, []);
  
  // Game timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // Time's up
            endGame();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      // Focus on the input
      inputRef.current?.focus();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying]);
  
  // Start the game
  const startGame = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setTimeLeft(60);
    setIsPlaying(true);
    setStreak(0);
    setUserAnswer("");
    generateQuestion();
  };
  
  // End the game
  const endGame = () => {
    setIsPlaying(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Check for high score
    const gameType = `${difficulty}-${operation}`;
    const currentBest = highScore[gameType] || 0;
    
    if (score > currentBest) {
      const newHighScores = { ...highScore, [gameType]: score };
      setHighScore(newHighScores);
      localStorage.setItem('mathGameHighScores', JSON.stringify(newHighScores));
      
      toast({
        title: "New high score!",
        description: `New best for ${difficulty} ${operation}: ${score} points`
      });
      
      triggerWinAnimation();
    } else {
      toast({
        title: "Game Over",
        description: `Final score: ${score} points`
      });
    }
  };
  
  // Generate a new math question based on difficulty and operation
  const generateQuestion = () => {
    let num1: number, num2: number, answer: number, questionText: string;
    let op: Operation = operation;
    
    // If mixed, randomly pick an operation
    if (operation === "mixed") {
      const operations: Operation[] = ["addition", "subtraction", "multiplication", "division"];
      op = operations[Math.floor(Math.random() * operations.length)];
    }
    
    // Generate numbers based on difficulty
    switch (difficulty) {
      case "easy":
        num1 = Math.floor(Math.random() * 10) + 1; // 1-10
        num2 = Math.floor(Math.random() * 10) + 1;
        break;
      case "medium":
        num1 = Math.floor(Math.random() * 20) + 1; // 1-20
        num2 = Math.floor(Math.random() * 20) + 1;
        break;
      case "hard":
        num1 = Math.floor(Math.random() * 50) + 1; // 1-50
        num2 = Math.floor(Math.random() * 30) + 1;
        break;
      case "expert":
        num1 = Math.floor(Math.random() * 100) + 1; // 1-100
        num2 = Math.floor(Math.random() * 50) + 1;
        break;
      default:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
    }
    
    // For division, ensure the answer is a whole number
    if (op === "division") {
      answer = Math.floor(Math.random() * 10) + 1;
      num1 = num2 * answer;
    }
    
    // Create the question and calculate answer
    switch (op) {
      case "addition":
        questionText = `${num1} + ${num2} = ?`;
        answer = num1 + num2;
        break;
      case "subtraction":
        // Ensure larger number is first to avoid negative results
        if (num2 > num1) {
          [num1, num2] = [num2, num1];
        }
        questionText = `${num1} - ${num2} = ?`;
        answer = num1 - num2;
        break;
      case "multiplication":
        questionText = `${num1} × ${num2} = ?`;
        answer = num1 * num2;
        break;
      case "division":
        questionText = `${num1} ÷ ${num2} = ?`;
        answer = num1 / num2;
        break;
      default:
        questionText = `${num1} + ${num2} = ?`;
        answer = num1 + num2;
    }
    
    setCurrentQuestion(questionText);
    setCurrentAnswer(answer);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPlaying) return;
    
    const userNum = parseFloat(userAnswer);
    
    if (isNaN(userNum)) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number",
        variant: "destructive"
      });
      return;
    }
    
    // Check if answer is correct
    const isCorrect = userNum === currentAnswer;
    
    if (isCorrect) {
      // Calculate points based on difficulty and streak
      let points = 0;
      
      switch (difficulty) {
        case "easy": points = 1; break;
        case "medium": points = 2; break;
        case "hard": points = 3; break;
        case "expert": points = 5; break;
      }
      
      // Add streak bonus
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      if (newStreak >= 5) {
        points *= 2;
        
        if (newStreak % 5 === 0) {
          toast({
            title: `${newStreak} in a row!`,
            description: "Double points activated!",
          });
        }
      }
      
      // Update score
      setScore(prevScore => prevScore + points);
      
      // Add time bonus for correct answers
      setTimeLeft(prevTime => Math.min(prevTime + 2, 60));
    } else {
      // Reset streak on wrong answer
      setStreak(0);
      
      toast({
        title: "Incorrect",
        description: `The answer was ${currentAnswer}`,
        variant: "destructive"
      });
    }
    
    // Generate next question
    setQuestionsAnswered(prev => prev + 1);
    setUserAnswer("");
    generateQuestion();
    
    // Focus on input field
    inputRef.current?.focus();
  };
  
  // Trigger win animation for high scores
  const triggerWinAnimation = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };
  
  // Format the operations for display
  const formatOperation = (op: Operation): string => {
    switch (op) {
      case "addition": return "Addition";
      case "subtraction": return "Subtraction";
      case "multiplication": return "Multiplication";
      case "division": return "Division";
      case "mixed": return "Mixed";
      default: return op;
    }
  };

  return (
    <Card className="w-full max-w-[500px] mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Math Challenge</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {isPlaying ? (
            <>
              <div className="w-full mb-6">
                <div className="flex justify-between mb-1">
                  <span>Time Left: {timeLeft}s</span>
                  <span>Score: {score}</span>
                </div>
                <Progress value={(timeLeft / 60) * 100} />
              </div>
              
              <div className="text-4xl font-bold mb-6">
                {currentQuestion}
              </div>
              
              <form onSubmit={handleSubmit} className="w-full">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter answer..."
                    className="text-lg text-center"
                    autoFocus
                  />
                  <Button type="submit">
                    Submit
                  </Button>
                </div>
              </form>
              
              {streak >= 3 && (
                <div className="mt-4 text-center">
                  <span className={`
                    font-bold
                    ${streak >= 10 ? 'text-purple-500 text-xl' :
                      streak >= 7 ? 'text-blue-500' :
                      streak >= 5 ? 'text-green-500' :
                      'text-yellow-500'}
                  `}>
                    {streak} in a row! {streak >= 5 ? '(2× points)' : ''}
                  </span>
                </div>
              )}
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  onClick={endGame}
                  className="w-full"
                >
                  End Game
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full space-y-6">
              <div className="text-center mb-6">
                <div className="text-lg font-bold">High Score</div>
                <div>
                  {highScore[`${difficulty}-${operation}`] ? 
                    `${highScore[`${difficulty}-${operation}`]} points` : 
                    "No high score yet"}
                </div>
                
                {questionsAnswered > 0 && (
                  <div className="mt-2">
                    <div>Last Game</div>
                    <div>Score: {score}</div>
                    <div>Questions: {questionsAnswered}</div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty:</label>
                  <Select
                    value={difficulty}
                    onValueChange={(value: Difficulty) => setDifficulty(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Operation:</label>
                  <Select
                    value={operation}
                    onValueChange={(value: Operation) => setOperation(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="addition">Addition</SelectItem>
                      <SelectItem value="subtraction">Subtraction</SelectItem>
                      <SelectItem value="multiplication">Multiplication</SelectItem>
                      <SelectItem value="division">Division</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={startGame} className="w-full">
                  Start Game
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-center text-gray-500 block">
        <p>
          Solve as many math problems as you can in 60 seconds!
        </p>
        <p className="mt-1">
          Correct answers add time. Consecutive correct answers build a streak for bonus points.
        </p>
      </CardFooter>
    </Card>
  );
}
