
// Import required components
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@components/ui/button";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/common/context/AuthContext";
import { useToast } from "@hooks/use-toast";

// Import sections
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import BlogPreviewSection from "./components/BlogPreviewSection";
import TemplatePreviewSection from "./components/TemplatePreviewSection";
import NewsletterSection from "./components/NewsletterSection";

export default function Home() {
 /* const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const handleAdminChatClick = () => {
    if (user) {
      if (isAdmin) {
        navigate('/dashboard/chat');
      } else {
        navigate('/dashboard/ai-chat');
      }
    } else {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the chat feature.",
        variant: "default",
      });
      navigate('/login');
    }
  };*/

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TemplatePreviewSection />
      
      {/* Admin chat button 
      <div className="container mx-auto px-4 md:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-6">
            Need <span className="text-gradient-primary">Assistance</span>?
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-center mb-8">
            Connect with our support team or AI assistant for immediate help with your questions.
          </p>
          <Button 
            size="lg" 
            onClick={handleAdminChatClick} 
            className="glass hover-lift hover-glow bg-primary/90 text-primary-foreground"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Open Chat Support
          </Button>
        </motion.div>
      </div>
      */}
      
      <BlogPreviewSection />
      <NewsletterSection />
    </>
  );
}
