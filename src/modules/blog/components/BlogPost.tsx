
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Eye, Clock, User, Share2, Facebook, Twitter, Linkedin, Copy, Check, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import CodeBlock from './CodeBlock';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';

// Define blog post interface
interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  featured_image: string;
  publish_date: string;
  slug: string;
  view_count: number;
  created_at: string;
  author?: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
  categories?: {
    name: string;
    slug: string;
  }[];
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionId] = useState(() => localStorage.getItem('blog_session_id') || nanoid());
  
  useEffect(() => {
    // Store session ID in localStorage for view tracking
    if (!localStorage.getItem('blog_session_id')) {
      localStorage.setItem('blog_session_id', sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchBlogPost();
  }, [slug]);

  const fetchBlogPost = async () => {
    setLoading(true);
    
    if (!slug) {
      setError("Blog post not found");
      setLoading(false);
      return;
    }
    
    try {
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:profiles(full_name, username, avatar_url)
        `)
        .eq('slug', slug)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setPost(data);
        
        // Track view using our database function
        try {
          await supabase.rpc('increment_blog_view', { 
            post_id: data.id,
            session: sessionId
          });
        } catch (viewError) {
          console.error("Error tracking view:", viewError);
        }
            
        // Fetch related posts based on categories
        fetchRelatedPosts(data);
        return;
      } else {
        setError("Blog post not found");
      }
    } catch (err) {
      console.error("Error fetching blog post:", err);
      setError("Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRelatedPosts = async (currentPost: BlogPost) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:profiles(full_name, username, avatar_url)
        `)
        .neq('id', currentPost.id)
        .order('view_count', { ascending: false })
        .limit(3);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setRelatedPosts(data);
      }
    } catch (err) {
      console.error("Error fetching related posts:", err);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "The post link has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    toast({
      title: bookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: bookmarked 
        ? "This post has been removed from your bookmarks" 
        : "This post has been added to your bookmarks",
    });
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4">Error Loading Blog Post</h2>
          <p className="mb-6">{error}</p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </motion.div>
      </div>
    );
  }
  
  if (!post) return null;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };
  
  // Process the markdown content to render properly
  const processContent = (content: string) => {
    // Split by code blocks
    const parts = content.split(/```(\w+)?\n([\s\S]*?)```/g);
    return parts.map((part, index) => {
      // Every 3rd index is a language, and every 4th is code content
      if (index % 3 === 1) {
        return null; // Skip language identifier
      } else if (index % 3 === 2) {
        const language = parts[index - 1] || 'javascript';
        return <CodeBlock key={index} code={part} language={language} />;
      } else {
        // Process regular markdown (very basic implementation)
        return part.split('\n').map((line, lineIndex) => {
          if (line.startsWith('# ')) {
            return <motion.h1 
              key={lineIndex}
              className="text-3xl font-bold my-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: lineIndex * 0.03 }}
            >{line.substring(2)}</motion.h1>;
          } else if (line.startsWith('## ')) {
            return <motion.h2 
              key={lineIndex} 
              className="text-2xl font-bold my-5"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: lineIndex * 0.03 }}
            >{line.substring(3)}</motion.h2>;
          } else if (line.startsWith('### ')) {
            return <motion.h3 
              key={lineIndex} 
              className="text-xl font-bold my-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: lineIndex * 0.03 }}
            >{line.substring(4)}</motion.h3>;
          } else if (line.trim() === '') {
            return <br key={lineIndex} />;
          } else {
            return <motion.p 
              key={lineIndex} 
              className="my-4 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: lineIndex * 0.02 }}
            >{line}</motion.p>;
          }
        });
      }
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 min-h-screen pb-16">
      {/* Hero section with featured image */}
      <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="h-full w-full"
        >
          <img 
            src={post.featured_image} 
            alt={post.title} 
            className="w-full h-full object-cover" 
          />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="container px-4 text-center">
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {post.title}
            </motion.h1>
            <motion.div 
              className="flex flex-wrap justify-center gap-2 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {post.categories?.map(category => (
                <Badge key={category.slug} variant="secondary" className="bg-white/20 hover:bg-white/30">
                  {category.name}
                </Badge>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="container mx-auto px-4 py-8 max-w-4xl relative z-10 -mt-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-10">
          {/* Post metadata */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={post.author?.avatar_url} alt={post.author?.full_name} />
                <AvatarFallback>{post.author?.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{post.author?.full_name || 'Unknown Author'}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {post.author?.username && `@${post.author.username}`}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(post.publish_date || post.created_at)}
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.view_count || 0} views
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {calculateReadingTime(post.content)} min read
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="p-0 h-auto hover:bg-transparent hover:text-primary"
                onClick={toggleBookmark}
              >
                <AnimatePresence mode="wait">
                  {bookmarked ? (
                    <motion.div
                      key="bookmarked"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="not-bookmarked"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <Bookmark className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Post content */}
          <div className="prose dark:prose-invert prose-lg max-w-none">
            {processContent(post.content)}
          </div>
          
          <Separator className="my-8" />
          
          {/* Post footer with share buttons */}
          <div className="pt-4">
            <h4 className="text-lg font-semibold mb-4">Share this post</h4>
            <div className="flex flex-wrap gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}>
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/20 dark:hover:text-sky-400" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, '_blank')}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}>
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700" onClick={copyLink}>
                  {copied ? (
                    <><Check className="h-4 w-4 mr-2" /> Copied</>
                  ) : (
                    <><Copy className="h-4 w-4 mr-2" /> Copy Link</>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.id}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={relatedPost.featured_image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{relatedPost.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={relatedPost.author?.avatar_url} />
                          <AvatarFallback>{relatedPost.author?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{relatedPost.author?.full_name}</span>
                      </div>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-primary"
                        onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                      >
                        Read more
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate('/blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
