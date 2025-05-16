
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  Download, 
  Eye, 
  ExternalLink, 
  Github, 
  Share2, 
  ChevronLeft,
  Heart,
  HeartCrack,
  BadgeCheck
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { Badge } from "@components/ui/badge";
import { useToast } from "@hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Template } from "@/types/supabase-custom";
import TemplateLoader from "./TemplateLoader";
import { nanoid } from "nanoid";

export default function TemplateDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [template, setTemplate] = useState<Template | null>(null);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [tags, setTags] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showDownloadLoader, setShowDownloadLoader] = useState(false);
  const { toast } = useToast();
  const [sessionId] = useState(() => localStorage.getItem('template_session_id') || nanoid());
  
  useEffect(() => {
    // Store session ID in localStorage for download tracking
    if (!localStorage.getItem('template_session_id')) {
      localStorage.setItem('template_session_id', sessionId);
    }
    
    fetchTemplate();
  }, [slug]);

  const fetchTemplate = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (templateError) throw templateError;
      
      if (templateData) {
        setTemplate(templateData);
        
        // Fetch categories
        const { data: categoryData } = await supabase
          .from('template_category_relation')
          .select(`
            category_id,
            template_categories (id, name)
          `)
          .eq('template_id', templateData.id);
        
        if (categoryData) {
          const categories = categoryData.map(item => ({
            id: item.category_id,
            name: (item.template_categories as any).name
          }));
          setCategories(categories);
        }
        
        // Check if liked (using local storage for demo)
        const likedTemplates = JSON.parse(localStorage.getItem('liked_templates') || '[]');
        setIsLiked(likedTemplates.includes(templateData.id));
      }
    } catch (error) {
      console.error("Error fetching template details:", error);
      toast({
        title: "Error",
        description: "Could not load the template details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!template) return;
    
    setShowDownloadLoader(true);
    
    try {
      // Track download using our function
      await supabase.rpc('increment_template_download', { temp_id: template.id });
      
      // Simulate download delay for demo purposes
      setTimeout(() => {
        // In a real app, you would redirect to the actual download URL
        if (template.download_url) {
          window.open(template.download_url, '_blank');
        }
        
        setTimeout(() => {
          setShowDownloadLoader(false);
        }, 5000); // Keep showing the loader/ad for 5 more seconds
      }, 3000);
    } catch (error) {
      console.error("Error tracking download:", error);
      setShowDownloadLoader(false);
    }
  };

  const toggleLike = () => {
    if (!template) return;
    
    const likedTemplates = JSON.parse(localStorage.getItem('liked_templates') || '[]');
    
    if (isLiked) {
      const updatedLikes = likedTemplates.filter((id: string) => id !== template.id);
      localStorage.setItem('liked_templates', JSON.stringify(updatedLikes));
      setIsLiked(false);
      toast({
        title: "Template unliked",
        description: "This template has been removed from your favorites",
      });
    } else {
      likedTemplates.push(template.id);
      localStorage.setItem('liked_templates', JSON.stringify(likedTemplates));
      setIsLiked(true);
      toast({
        title: "Template liked",
        description: "This template has been added to your favorites",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
          <div className="h-10 w-2/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Template Not Found</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">The template you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/templates">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Browse Templates
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            to="/templates" 
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Templates
          </Link>
        </div>
        
        {/* Template Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{template.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <Badge key={category.id}>{category.name}</Badge>
                ))}
                
                {template.is_premium && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-700 dark:text-amber-100 flex items-center gap-1">
                    <BadgeCheck className="h-3.5 w-3.5" /> Premium
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1.5" />
                  {Math.floor(Math.random() * 1000) + 100} views
                </span>
                <span className="flex items-center">
                  <Download className="h-4 w-4 mr-1.5" />
                  {template.download_count || 0} downloads
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {new Date(template.created_at || '').toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={toggleLike}
                >
                  <AnimatePresence mode="wait">
                    {isLiked ? (
                      <motion.div
                        key="liked"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="unliked"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      >
                        <Heart className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Template Preview */}
        <motion.div
          className="mb-8 rounded-lg overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <img 
            src={template.thumbnail || 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1480'}
            alt={template.title} 
            className="w-full h-auto object-cover aspect-[16/9]"
          />
        </motion.div>
        
        {/* Template Content */}
        <div className="grid md:grid-cols-[1fr_300px] gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {template.description || 'No description provided for this template.'}
              </p>
            </div>
            
            {template.tech_stack && template.tech_stack.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {template.tech_stack.map((tech, index) => (
                    <Badge key={index} variant="outline">{tech}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2 list-disc pl-5 text-gray-700 dark:text-gray-300">
                <li>Fully responsive design for all devices</li>
                <li>Modern and clean user interface</li>
                <li>Built with popular frameworks for easy customization</li>
                <li>Well-documented code for easy maintenance</li>
                <li>SEO optimized structure</li>
              </ul>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Template Details</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="font-medium">{template.is_premium ? 'Premium' : 'Free'}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Released:</span>
                  <span className="font-medium">{new Date(template.created_at || '').toLocaleDateString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                  <span className="font-medium">{new Date(template.updated_at || template.created_at || '').toLocaleDateString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Downloads:</span>
                  <span className="font-medium">{template.download_count || 0}</span>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                  </motion.div>
                  
                  {template.github_url && (
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(template.github_url as string, '_blank')}
                      >
                        <Github className="mr-2 h-4 w-4" />
                        View on GitHub
                      </Button>
                    </motion.div>
                  )}
                  
                  {template.preview_url && (
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(template.preview_url as string, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Live Preview
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/10 dark:to-accent/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Need Support?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                Having trouble with this template? Our support team is ready to help!
              </p>
              <Button variant="secondary" className="w-full">
                Contact Support
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      
      <AnimatePresence>
        {showDownloadLoader && <TemplateLoader />}
      </AnimatePresence>
    </div>
  );
}
