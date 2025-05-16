
import { ArrowRight, Eye, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// Mock data for templates
const templates = [
  {
    id: 1,
    title: "Dashboard Pro",
    description: "Modern admin dashboard template with dark mode and responsive design.",
    imageUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1480",
    category: "Admin",
    framework: "React",
    slug: "/templates/dashboard-pro"
  },
  {
    id: 2,
    title: "E-Commerce Starter",
    description: "Complete e-commerce template with product listings, cart, and checkout.",
    imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "E-commerce",
    framework: "React",
    slug: "/templates/ecommerce-starter"
  },
  {
    id: 3,
    title: "Portfolio Plus",
    description: "Showcase your work with this elegant and minimal portfolio template.",
    imageUrl: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    category: "Portfolio",
    framework: "React",
    slug: "/templates/portfolio-plus"
  }
];

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

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all group">
        <div className="h-48 overflow-hidden relative">
          <img 
            src={template.imageUrl} 
            alt={template.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => setShowPreview(true)}
              className="p-2 bg-white text-gray-900 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <Eye size={18} /> Preview
            </button>
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
          <h3 className="text-lg font-medium mb-2">{template.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {template.description}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Eye size={16} className="mr-1" /> Preview
            </button>
            <Link
              to={template.slug}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors ml-auto"
            >
              Details <ArrowRight size={14} className="ml-1" />
            </Link>
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

export default function TemplatePreviewSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Premium Templates</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Ready-to-use templates for your next project
            </p>
          </div>
          <Link 
            to="/templates"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-md transition-colors"
          >
            Browse all templates <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
}
