
import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markdown";
import "prismjs/themes/prism-tomorrow.css";

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(language || "javascript");
  const [isVisible, setIsVisible] = useState(false);

  // Example multi-language code blocks
  const codeExamples = {
    html: `<div class="container">
  <h1>Hello World</h1>
  <p>This is a simple HTML example</p>
</div>`,
    css: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  font-size: 2rem;
}`,
    javascript: code || `function greeting(name) {
  return \`Hello, \${name}!\`;
}

console.log(greeting('World'));`,
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      Prism.highlightAll();
    }
    
    // Animation when component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const copyToClipboard = () => {
    const textToCopy = activeTab === language ? code : codeExamples[activeTab as keyof typeof codeExamples];
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
  };

  return (
    <motion.div 
      className="code-block group my-6 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Tabs defaultValue={language || "javascript"} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2 dark:border-gray-800 dark:bg-gray-800/80">
          <TabsList className="h-9 bg-transparent">
            <TabsTrigger 
              value="html" 
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-all duration-200",
                activeTab === "html" ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-gray-100" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
            >
              HTML
            </TabsTrigger>
            <TabsTrigger 
              value="css" 
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-all duration-200",
                activeTab === "css" ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-gray-100" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
            >
              CSS
            </TabsTrigger>
            <TabsTrigger 
              value="javascript" 
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-all duration-200", 
                activeTab === "javascript" ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-gray-100" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
            >
              JavaScript
            </TabsTrigger>
          </TabsList>
          
          <motion.button
            onClick={copyToClipboard}
            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Copy code"
            title="Copy code"
          >
            <AnimatePresence mode="wait">
              {isCopied ? (
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="copied"
                >
                  <Check size={14} className="mr-1.5 text-green-500" /> Copied!
                </motion.div>
              ) : (
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="copy"
                >
                  <Copy size={14} className="mr-1.5" /> Copy
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <div className="code-content overflow-x-auto p-4">
          <TabsContent value="html" className="mt-0">
            <pre className="language-html"><code>{codeExamples.html}</code></pre>
          </TabsContent>
          <TabsContent value="css" className="mt-0">
            <pre className="language-css"><code>{codeExamples.css}</code></pre>
          </TabsContent>
          <TabsContent value="javascript" className="mt-0 whitespace-pre-wrap break-words">
            <pre className="language-javascript"><code>{activeTab === language ? code : codeExamples.javascript}</code></pre>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
