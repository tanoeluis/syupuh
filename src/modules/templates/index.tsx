
import { useState } from "react";
import TemplateList from "./components/TemplateList";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@components/ui/input";

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <>
      <div className="bg-gradient-to-r from-primary/10 via-transparent to-accent/10 dark:from-primary/5 dark:to-accent/5 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Templates</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Browse our collection of premium templates for your next project
            </p>
            
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search templates..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      <TemplateList searchQuery={searchQuery} />
    </>
  );
}
