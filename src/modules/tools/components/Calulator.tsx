
import React, { useState } from 'react';
import { Button } from "@components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperation(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operation) {
      const result = calculate(firstOperand, inputValue, operation);
      setDisplay(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (first: number, second: number, op: string) => {
    switch (op) {
      case '+':
        return first + second;
      case '-':
        return first - second;
      case '×':
        return first * second;
      case '÷':
        return first / second;
      default:
        return second;
    }
  };

  const calculateResult = () => {
    if (operation === null || firstOperand === null || waitingForSecondOperand) {
      return;
    }

    const inputValue = parseFloat(display);
    const result = calculate(firstOperand, inputValue, operation);
    
    setDisplay(String(result));
    setFirstOperand(result);
    setOperation(null);
    setWaitingForSecondOperand(true);
  };

  const deleteLastDigit = () => {
    if (display.length === 1 || display === '0') {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const buttons = [
    { text: 'C', action: clearDisplay, className: 'bg-destructive text-white' },
    { text: '±', action: () => setDisplay(String(-parseFloat(display))), className: 'bg-gray-200 dark:bg-gray-700' },
    { text: '%', action: () => setDisplay(String(parseFloat(display) / 100)), className: 'bg-gray-200 dark:bg-gray-700' },
    { text: '÷', action: () => performOperation('÷'), className: 'bg-amber-500 text-white' },
    { text: '7', action: () => inputDigit('7') },
    { text: '8', action: () => inputDigit('8') },
    { text: '9', action: () => inputDigit('9') },
    { text: '×', action: () => performOperation('×'), className: 'bg-amber-500 text-white' },
    { text: '4', action: () => inputDigit('4') },
    { text: '5', action: () => inputDigit('5') },
    { text: '6', action: () => inputDigit('6') },
    { text: '-', action: () => performOperation('-'), className: 'bg-amber-500 text-white' },
    { text: '1', action: () => inputDigit('1') },
    { text: '2', action: () => inputDigit('2') },
    { text: '3', action: () => inputDigit('3') },
    { text: '+', action: () => performOperation('+'), className: 'bg-amber-500 text-white' },
    { text: '0', action: () => inputDigit('0'), className: 'col-span-1' },
    { text: '.', action: inputDecimal },
    { text: '⌫', action: deleteLastDigit },
    { text: '=', action: calculateResult, className: 'bg-amber-500 text-white' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <Card className="shadow-xl border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Calculator</span>
            <Button variant="ghost" size="sm" asChild>
              <a href="/tools">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tools
              </a>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 text-right text-3xl font-mono h-16 flex items-center justify-end overflow-hidden"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.2 }}
          >
            {display}
          </motion.div>
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((button, index) => (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-lg font-medium text-lg ${button.className || 'bg-gray-100 dark:bg-gray-800'} hover:opacity-90 transition-all`}
                onClick={button.action}
              >
                {button.text}
              </motion.button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-center text-gray-500 pt-0">
          Perform your calculations with this interactive calculator
        </CardFooter>
      </Card>
    </motion.div>
  );
}
