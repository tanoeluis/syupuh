
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for blog posts
const blogPosts = [
  {
    id: 1,
    title: "Building Modern UIs with React and Tailwind CSS",
    excerpt: "Learn how to combine React and Tailwind CSS to create beautiful, responsive user interfaces for your web applications.",
    imageUrl: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "Frontend",
    readTime: "7 min read",
    slug: "/blog/building-modern-uis"
  },
  {
    id: 2,
    title: "Optimizing Performance in React Applications",
    excerpt: "Discover best practices for improving the performance of your React applications through code splitting and memoization.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "React",
    readTime: "5 min read",
    slug: "/blog/optimizing-react-performance"
  },
  {
    id: 3,
    title: "Introduction to TypeScript for React Developers",
    excerpt: "A comprehensive guide to using TypeScript with React to build type-safe applications with enhanced developer experience.",
    imageUrl: "https://images.unsplash.com/photo-1562813733-b31f71025d54?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1469",
    category: "TypeScript",
    readTime: "8 min read",
    slug: "/blog/typescript-for-react-devs"
  }
];

interface BlogCardProps {
  post: typeof blogPosts[0];
}

function BlogCard({ post }: BlogCardProps) {
  return (
    <Link to={post.slug} className="group">
      <article className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="h-48 overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center mb-3">
            <span className="text-xs font-medium px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full">
              {post.category}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {post.readTime}
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm flex-1">
            {post.excerpt}
          </p>
          <div className="mt-4 inline-flex items-center text-primary">
            Read more <ArrowRight size={16} className="ml-1 group-hover:ml-2 transition-all" />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPreviewSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Latest Articles</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with our latest insights and tutorials
            </p>
          </div>
          <Link 
            to="/blog"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-md transition-colors"
          >
            View all articles <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
