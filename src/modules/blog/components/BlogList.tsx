
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter } from "lucide-react";

// Mock data for blog posts
const blogPosts = [
  {
    id: 1,
    title: "Building Modern UIs with React and Tailwind CSS",
    excerpt: "Learn how to combine React and Tailwind CSS to create beautiful, responsive user interfaces for your web applications.",
    imageUrl: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "Frontend",
    tags: ["React", "TailwindCSS", "UI/UX"],
    readTime: "7 min read",
    date: "2023-05-15",
    slug: "/blog/building-modern-uis"
  },
  {
    id: 2,
    title: "Optimizing Performance in React Applications",
    excerpt: "Discover best practices for improving the performance of your React applications through code splitting and memoization.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "React",
    tags: ["React", "Performance", "JavaScript"],
    readTime: "5 min read",
    date: "2023-06-22",
    slug: "/blog/optimizing-react-performance"
  },
  {
    id: 3,
    title: "Introduction to TypeScript for React Developers",
    excerpt: "A comprehensive guide to using TypeScript with React to build type-safe applications with enhanced developer experience.",
    imageUrl: "https://images.unsplash.com/photo-1562813733-b31f71025d54?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1469",
    category: "TypeScript",
    tags: ["TypeScript", "React", "JavaScript"],
    readTime: "8 min read",
    date: "2023-07-10",
    slug: "/blog/typescript-for-react-devs"
  },
  {
    id: 4,
    title: "Building a Full-Stack Application with React and Node.js",
    excerpt: "Learn how to create a complete full-stack application using React for the frontend and Node.js for the backend API.",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "Full-Stack",
    tags: ["React", "Node.js", "Express", "MongoDB"],
    readTime: "12 min read",
    date: "2023-08-05",
    slug: "/blog/fullstack-react-nodejs"
  },
  {
    id: 5,
    title: "Responsive Design Patterns for Modern Web Applications",
    excerpt: "Explore effective responsive design patterns that ensure your web applications look great on all devices and screen sizes.",
    imageUrl: "https://images.unsplash.com/photo-1508921340878-ba53e1f016ec?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "UI/UX",
    tags: ["CSS", "Responsive", "UI/UX"],
    readTime: "6 min read",
    date: "2023-09-18",
    slug: "/blog/responsive-design-patterns"
  },
  {
    id: 6,
    title: "State Management in React with Zustand",
    excerpt: "An introduction to Zustand, a minimalist state management library for React applications that offers simplicity and performance.",
    imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1474",
    category: "React",
    tags: ["React", "Zustand", "State Management"],
    readTime: "9 min read",
    date: "2023-10-02",
    slug: "/blog/zustand-state-management"
  }
];

// Get unique categories and tags for filtering
const categories = Array.from(new Set(blogPosts.map(post => post.category)));
const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

interface BlogCardProps {
  post: typeof blogPosts[0];
}

function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all h-full">
      <Link to={post.slug} className="block h-48 overflow-hidden">
        <img 
          src={post.imageUrl} 
          alt={post.title}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Link 
            to={`/blog/category/${post.category.toLowerCase()}`}
            className="text-xs font-medium px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full"
          >
            {post.category}
          </Link>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="mr-4">{post.date}</span>
            <span>{post.readTime}</span>
          </div>
        </div>
        <Link to={post.slug}>
          <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <Link 
              key={tag} 
              to={`/blog/tag/${tag.toLowerCase()}`}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function BlogList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const filteredPosts = blogPosts.filter(post => {
    // Apply search filter
    if (searchTerm && !post.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply category filter
    if (selectedCategory && post.category !== selectedCategory) {
      return false;
    }
    
    // Apply tag filters
    if (selectedTags.length > 0 && !selectedTags.some(tag => post.tags.includes(tag))) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-800"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 animate-fade-in">
            <h3 className="font-medium mb-3">Filter by:</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedCategory === ""
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => setSelectedCategory("")}
                  >
                    All
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`px-3 py-1 text-sm rounded-full ${
                        selectedCategory === category
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      className={`px-3 py-1 text-sm rounded-full ${
                        selectedTags.includes(tag)
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedTags([]);
                  setSearchTerm("");
                }}
                className="text-sm text-primary hover:underline"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No articles found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
