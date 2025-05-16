
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { X, Image, Check, Loader2 } from 'lucide-react';
import { nanoid } from 'nanoid';

export default function BlogEditor({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a blog post",
        variant: "destructive"
      });
      return;
    }
    
    if (!title || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Generate a slug from the title
      const slug = title.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-') + '-' + nanoid(6);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title,
          content,
          excerpt: excerpt || title.substring(0, 150) + "...",
          featured_image: featuredImage || "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=1470&auto=format&fit=crop",
          author_id: user.id,
          slug,
          status: 'published',
          publish_date: new Date().toISOString(),
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Your blog post has been created successfully",
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating blog post:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your blog post",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setImageUploading(true);
      
      // In a real app, you'd upload this to Supabase storage or similar
      // For simplicity, we'll just use a mock URL
      setTimeout(() => {
        setFeaturedImage(`https://source.unsplash.com/random/1200x800/?blog,${Math.random()}`);
        setImageUploading(false);
      }, 1500);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "There was a problem uploading your image",
        variant: "destructive"
      });
      setImageUploading(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
          <h3 className="text-xl font-medium">Create a New Blog Post</h3>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={submitting}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt (optional)</Label>
            <Input
              id="excerpt"
              placeholder="Brief description of your blog post"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="featured-image">Featured Image</Label>
            <div className="flex items-center space-x-4">
              {featuredImage ? (
                <div className="relative h-20 w-32 rounded-md overflow-hidden">
                  <img src={featuredImage} alt="Preview" className="h-full w-full object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => setFeaturedImage('')}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    id="featured-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                    disabled={imageUploading}
                  />
                  <Label
                    htmlFor="featured-image"
                    className="cursor-pointer flex items-center justify-center h-20 w-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                  >
                    {imageUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Image className="h-6 w-6 text-gray-500" />
                    )}
                  </Label>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your blog post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px]"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supports markdown formatting. Use # for headers, * for lists, etc.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
