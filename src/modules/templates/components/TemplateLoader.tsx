
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TemplateLoaderProps {
  message?: string;
}

export default function TemplateLoader({ message = "Preparing Download..." }: TemplateLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [showAd, setShowAd] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowAd(true), 500);
          return 100;
        }
        return newProgress;
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      {!showAd ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl w-full max-w-md text-center"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ 
                rotateY: [0, 360],
                rotateX: [0, 360]
              }}
              transition={{ 
                repeat: Infinity,
                duration: 3,
                ease: "linear"
              }}
              className="w-20 h-20 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-80 rounded-lg transform rotate-3" />
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/70 to-primary/70 opacity-80 rounded-lg transform -rotate-3" />
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">3D</div>
            </motion.div>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">{message}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Please wait while we prepare your template</p>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <motion.div 
              className="bg-primary h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50 }}
            />
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}% complete</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl w-full max-w-md"
        >
          <h3 className="text-xl font-semibold mb-4 text-center">Your download is ready!</h3>
          
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Sponsored</span>
              <motion.button 
                className="text-xs text-gray-400"
                whileHover={{ scale: 1.05 }}
              >
                Close Ad
              </motion.button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                PRO
              </div>
              <div>
                <h4 className="font-medium">Upgrade to Premium</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Get unlimited access to all premium templates</p>
                <motion.button 
                  className="mt-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md"
              onClick={() => window.close()}
            >
              No Thanks
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-primary text-white rounded-md"
              onClick={() => window.close()}
            >
              Continue Download
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
