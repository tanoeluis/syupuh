
import { FileText, Layout, User, Code } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className=" flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover-scale group">
      <div className="p-3 mb-4 rounded-full bg-primary/10 text-primary dark:bg-primary/20 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Premium Features</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to build beautiful, responsive websites with top-notch resources.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<FileText size={24} />}
            title="In-Depth Articles"
            description="Articles with copy-ready code snippets and practical examples for immediate implementation."
          />
          <FeatureCard
            icon={<Layout size={24} />}
            title="Premium Templates"
            description="Professionally designed templates to kickstart your projects and save development time."
          />
          <FeatureCard
            icon={<Code size={24} />}
            title="Code Snippets"
            description="Reusable code snippets for common patterns and solutions to everyday challenges."
          />
          <FeatureCard
            icon={<User size={24} />}
            title="Community Support"
            description="Join our community of developers for collaboration and support on your projects."
          />
        </div>
      </div>
    </section>
  );
}
