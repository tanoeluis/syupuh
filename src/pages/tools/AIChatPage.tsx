import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Trash, Plus, Loader, Menu, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import { ScrollArea } from '@components/ui/scroll-area';
import { useAuth } from '@/common/context/AuthContext';
import { useToast } from '@hooks/use-toast';
import { Badge } from '@components/ui/badge';
import { cn } from '@lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const AIChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Auto-scroll ketika pesan baru masuk
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);
  
  // Demo messages untuk UI
  useEffect(() => {
    if (!conversations.length) {
      const demoConversation: Conversation = {
        id: '1',
        title: 'Chat baru',
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: 'Halo! Saya adalah AI Assistant berbasis DeepSeek. Ada yang bisa saya bantu?',
            timestamp: new Date()
          }
        ],
        createdAt: new Date()
      };
      
      setConversations([demoConversation]);
      setCurrentConversation(demoConversation);
    }
  }, []);
  
  // Membuat conversation baru
  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'Chat baru',
      messages: [
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Halo! Saya adalah AI Assistant berbasis DeepSeek. Ada yang bisa saya bantu?',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    };
    
    setConversations([newConversation, ...conversations]);
    setCurrentConversation(newConversation);
    setInput('');
    setIsSidebarOpen(false);
  };
  
  // Mengirim pesan ke DeepSeek API
  const handleSendMessage = async () => {
    if (!input.trim() || !currentConversation) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    // Update conversation dengan pesan user
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      title: input.slice(0, 30) + (input.length > 30 ? '...' : '') // Update title with first part of message
    };
    
    setCurrentConversation(updatedConversation);
    setConversations(conversations.map(conv => 
      conv.id === updatedConversation.id ? updatedConversation : conv
    ));
    setInput('');
    setIsLoading(true);
    
    try {
      // Call DeepSeek API
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer VITE_DEEPSEEK_API_KEY` // Replace with your actual API key
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Anda adalah AI Assistant yang membantu dengan berbagai topik. Berikan jawaban yang jelas dan informatif.'
            },
            ...updatedConversation.messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: new Date()
        };
        
        const conversationWithResponse = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, aiResponse]
        };
        
        setCurrentConversation(conversationWithResponse);
        setConversations(conversations.map(conv => 
          conv.id === conversationWithResponse.id ? conversationWithResponse : conv
        ));
      } else {
        throw new Error('Tidak menerima respons yang valid dari API');
      }
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.',
        timestamp: new Date()
      };
      
      const conversationWithError = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, errorMessage]
      };
      
      setCurrentConversation(conversationWithError);
      setConversations(conversations.map(conv => 
        conv.id === conversationWithError.id ? conversationWithError : conv
      ));
      
      toast({
        title: "Error",
        description: "Gagal mendapatkan respons dari AI",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle hapus conversation
  const handleDeleteConversation = (id: string) => {
    setConversations(conversations.filter(conv => conv.id !== id));
    
    if (currentConversation?.id === id) {
      const firstConversation = conversations.find(conv => conv.id !== id);
      setCurrentConversation(firstConversation || null);
    }
    
    toast({
      title: "Percakapan dihapus",
      description: "Percakapan telah berhasil dihapus."
    });
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-0 md:px-4 py-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-0 mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="text-primary" size={24} />
              <span>DeepSeek Chat</span>
            </h1>
          </div>
          <Badge variant="secondary" className="hidden md:flex">
            Powered by DeepSeek API
          </Badge>
        </div>
        
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar overlay for mobile */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-background border-r shadow-lg md:hidden"
              >
                <div className="p-4 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Percakapan</h2>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNewConversation}
                      title="Percakapan baru"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-2">
                      {conversations.map(conversation => (
                        <div
                          key={conversation.id}
                          className={cn(
                            "flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors",
                            currentConversation?.id === conversation.id ? 'bg-accent' : ''
                          )}
                          onClick={() => {
                            setCurrentConversation(conversation);
                            setIsSidebarOpen(false);
                          }}
                        >
                          <div className="truncate flex-1">
                            <p className="font-medium truncate">{conversation.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {conversation.messages.length} pesan • {new Date(conversation.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-50 hover:opacity-100 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conversation.id);
                            }}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Sidebar for desktop */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex flex-col w-72 border-r pr-4 mr-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Percakapan</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNewConversation}
                title="Percakapan baru"
              >
                <Plus size={16} />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-2">
                {conversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors",
                      currentConversation?.id === conversation.id ? 'bg-accent' : ''
                    )}
                    onClick={() => setCurrentConversation(conversation)}
                  >
                    <div className="truncate flex-1">
                      <p className="font-medium truncate">{conversation.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {conversation.messages.length} pesan • {new Date(conversation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-50 hover:opacity-100 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
          
          {/* Main chat area */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 flex flex-col h-full bg-background rounded-lg border shadow-sm"
          >
            {currentConversation ? (
              <>
                <CardHeader className="pb-2 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="truncate">{currentConversation.title}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {currentConversation.messages.length} pesan
                    </div>
                  </div>
                  <CardDescription className="truncate">
                    {currentConversation.messages[0]?.content.slice(0, 60)}...
                  </CardDescription>
                </CardHeader>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-6 px-1">
                    <AnimatePresence>
                      {currentConversation.messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex items-start gap-3",
                            message.role === 'assistant' ? '' : 'flex-row-reverse'
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                            message.role === 'assistant' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-secondary'
                          )}>
                            {message.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                          </div>
                          
                          <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className={cn(
                              "px-4 py-3 rounded-xl max-w-[85%] md:max-w-[75%] shadow-sm",
                              message.role === 'assistant' 
                                ? 'bg-card border border-border' 
                                : 'bg-primary text-primary-foreground'
                            )}
                          >
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              {message.content.split('\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                              ))}
                            </div>
                            <div className="mt-1 text-xs opacity-70 text-right">
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary text-primary-foreground">
                          <Bot size={16} />
                        </div>
                        <div className="bg-card border border-border px-4 py-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Loader size={16} className="animate-spin" />
                            <p className="text-sm">DeepSeek sedang mengetik...</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <CardFooter className="border-t p-4 bg-background/50 backdrop-blur-sm">
                  <form 
                    className="flex items-end w-full gap-2" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                  >
                    <Textarea
                      placeholder="Tulis pesan Anda di sini..."
                      className="flex-1 min-h-[60px] max-h-[200px] resize-none"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={isLoading || !input.trim()}
                      className="h-[60px] w-[60px] shrink-0"
                    >
                      {isLoading ? (
                        <Loader className="animate-spin" />
                      ) : (
                        <Send />
                      )}
                    </Button>
                  </form>
                </CardFooter>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Bot size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Tidak ada percakapan</h3>
                <p className="text-muted-foreground mb-4">
                  Mulai percakapan baru dengan AI Assistant berbasis DeepSeek
                </p>
                <Button onClick={handleNewConversation}>
                  <Plus className="mr-2" size={16} />
                  Percakapan Baru
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;