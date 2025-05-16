
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@components/ui/button';

const AdminChatButton: React.FC = () => {
  return (
    <Link to="/tools/ai-chat" className="fixed bottom-6 right-6 z-50">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          size="lg" 
          className="rounded-full h-10 w-10 shadow-lg bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
          aria-label="Chat dengan Admin"
        >
          <MessageSquare size={24} />
          <span className="sr-only">Chat dengan Admin</span>
        </Button>
      </motion.div>
    </Link>
  );
};

export default AdminChatButton;
