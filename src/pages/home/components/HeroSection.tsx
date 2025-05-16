import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 z-0"></div>
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary to-transparent"></div>
      
      {/* Hero content */}
      <div className="container mx-auto px-4 md:px-6 py-20 md:py-32 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1 text-center md:text-left mb-10 md:mb-0">
            <div className="inline-block px-3 py-1 mb-6 text-sm font-medium text-primary bg-primary/10 rounded-full animate-fade-in">
              ✨ Premium Resources & Articles
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-primary to-accent dark:from-white dark:via-primary dark:to-accent bg-clip-text text-transparent animate-fade-in">
              Elevate Your<br />Web Development
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto md:mx-0 animate-fade-in">
              Premium templates, in-depth articles, and code snippets to accelerate your development workflow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-fade-in">
              <Link to="/blog" className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20">
                Explore Blog
              </Link>
              <Link to="/templates" className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center">
                Browse Templates <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          </div>
          
          <div className="flex-1 md:ml-8">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent/30 dark:bg-accent/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/30 dark:bg-primary/20 rounded-full blur-xl"></div>
              
              {/* Hero image */}
              <div className="relative z-10 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-xl rotate-2 hover:rotate-0 transition-all duration-500 hover-scale">
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2072&q=80"
                    alt="Development workspace"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
