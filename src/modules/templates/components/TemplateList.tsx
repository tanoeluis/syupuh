import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, Download, Search, Filter, Check } from "lucide-react";
import { TemplateListProps } from "../types";

// Mock data for templates
const templates = [
  {
    id: 1,
    title: "Dashboard Pro",
    description: "Modern admin dashboard template with dark mode and responsive design.",
    imageUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1480",
    category: "Admin",
    framework: "React",
    tags: ["Dashboard", "Admin", "Dark Mode"],
    downloads: 1250,
    featured: true,
    slug: "/templates/dashboard-pro"
  },
  {
    id: 2,
    title: "E-Commerce Starter",
    description: "Complete e-commerce template with product listings, cart, and checkout.",
    imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "E-commerce",
    framework: "React",
    tags: ["E-commerce", "Shop", "Checkout"],
    downloads: 980,
    featured: true,
    slug: "/templates/ecommerce-starter"
  },
  {
    id: 3,
    title: "Portfolio Plus",
    description: "Showcase your work with this elegant and minimal portfolio template.",
    imageUrl: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "Portfolio",
    framework: "React",
    tags: ["Portfolio", "Personal", "Creative"],
    downloads: 754,
    featured: false,
    slug: "/templates/portfolio-plus"
  },
  {
    id: 4,
    title: "Blog Master",
    description: "Feature-rich blog template with dark mode, comments, and code syntax highlighting.",
    imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "Blog",
    framework: "React",
    tags: ["Blog", "Content", "Dark Mode"],
    downloads: 625,
    featured: false,
    slug: "/templates/blog-master"
  },
  {
    id: 5,
    title: "SaaS Landing",
    description: "High-converting SaaS landing page template with pricing tables and testimonials.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "Landing",
    framework: "React",
    tags: ["SaaS", "Marketing", "Conversion"],
    downloads: 1120,
    featured: true,
    slug: "/templates/saas-landing"
  },
  {
    id: 6,
    title: "Social Network UI",
    description: "Modern social networking interface with feeds, profiles, and messaging components.",
    imageUrl: "https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "Social",
    framework: "React",
    tags: ["Social Media", "Network", "UI Kit"],
    downloads: 845,
    featured: false,
    slug: "/templates/social-network"
  }
];

// Get unique categories and frameworks for filtering
const categories = Array.from(new Set(templates.map(template => template.category)));
const frameworks = Array.from(new Set(templates.map(template => template.framework)));

interface TemplateCardProps {
  template: typeof templates[0];
}

interface PreviewModalProps {
  template: typeof templates[0] | null;
  onClose: () => void;
}

function PreviewModal({ template, onClose }: PreviewModalProps) {
  if (!template) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-medium">{template.title}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-900 rounded-md mb-6 overflow-hidden">
            <img 
              src={template.imageUrl} 
              alt={template.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {template.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h5 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</h5>
                  <p>{template.category}</p>
                </div>
                <div>
                  <h5 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Framework</h5>
                  <p>{template.framework}</p>
                </div>
                <div>
                  <h5 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Downloads</h5>
                  <p>{template.downloads.toLocaleString()}</p>
                </div>
                <div>
                  <h5 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tags</h5>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 md:w-48">
              <a
                href="#"
                className="w-full py-2 bg-primary text-white rounded-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Download size={16} /> Download
              </a>
              <Link
                to={template.slug}
                className="w-full py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template }: TemplateCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    
    // Simulate download
    setTimeout(() => {
      setIsDownloading(false);
    }, 1500);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all group">
        <div className="h-52 overflow-hidden relative">
          {template.featured && (
            <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-accent/90 text-white text-xs font-medium rounded">
              Featured
            </div>
          )}
          <img 
            src={template.imageUrl} 
            alt={template.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="p-2 bg-white text-gray-900 rounded-full flex items-center gap-1 hover:bg-gray-100 transition-colors"
            >
              <Eye size={16} /> Preview
            </button>
            <a
              href="#"
              onClick={handleDownload}
              className="p-2 bg-primary text-white rounded-full flex items-center gap-1 hover:bg-primary/90 transition-colors"
            >
              {isDownloading ? <Check size={16} /> : <Download size={16} />}
              {isDownloading ? "Done" : "Download"}
            </a>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full">
              {template.category}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {template.framework}
            </span>
          </div>
          <Link to={template.slug}>
            <h3 className="text-lg font-medium mb-2 hover:text-primary transition-colors">
              {template.title}
            </h3>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {template.description}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Eye size={16} className="mr-1" /> Preview
              </button>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {template.downloads.toLocaleString()} downloads
            </span>
          </div>
        </div>
      </div>

      {showPreview && (
        <PreviewModal 
          template={template} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </>
  );
}

export default function TemplateList({ searchQuery = "" }: TemplateListProps) {
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Update searchTerm when searchQuery prop changes
  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);
  
  const filteredTemplates = templates.filter(template => {
    // Apply search filter
    if (searchTerm && !template.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !template.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply category filter
    if (selectedCategory && template.category !== selectedCategory) {
      return false;
    }
    
    // Apply framework filter
    if (selectedFramework && template.framework !== selectedFramework) {
      return false;
    }
    
    // Apply featured filter
    if (showFeaturedOnly && !template.featured) {
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
              placeholder="Search templates..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-800"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Framework
                </label>
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="w-full p-2 border dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-800"
                >
                  <option value="">All Frameworks</option>
                  {frameworks.map(framework => (
                    <option key={framework} value={framework}>{framework}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Featured
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={showFeaturedOnly}
                    onChange={() => setShowFeaturedOnly(!showFeaturedOnly)}
                    className="mr-2"
                  />
                  <label htmlFor="featured">Show featured templates only</label>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedFramework("");
                  setShowFeaturedOnly(false);
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

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No templates found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
