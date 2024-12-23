import React from 'react';
import { MessageSquare, ClipboardCheck, LineChart, Timer, Brain, Globe } from 'lucide-react';

const BenefitCard = ({ 
  title, 
  description, 
  icon: Icon,
  iconBgColor 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType;
  iconBgColor: string;
}) => (
  <div className="bg-[#112240] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-800">
    <h3 className="text-white text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-300 mb-6 text-sm leading-relaxed">{description}</p>
    <div className="flex items-center justify-between">
      <div className={`${iconBgColor} p-2 rounded-full`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <button className="text-gray-300 text-sm font-medium hover:text-white transition-colors">
        EXPLORE MORE
      </button>
    </div>
  </div>
);

const Benefits = () => {
  const benefits = [
    {
      title: "Early Detection",
      description: "Early Detection Utilizes advanced ML algorithms to identify early signs of diabetic retinopathy, enabling timely intervention and treatment.",
      icon: MessageSquare,
      iconBgColor: "bg-purple-500"
    },
    {
      title: "Accurate Analysis",
      description: "Accurate Analysis Provides highly accurate analysis of retinal images, helping to detect even subtle changes indicative of diabetic retinopathy.",
      icon: ClipboardCheck,
      iconBgColor: "bg-orange-400"
    },
    {
      title: "User-Friendly Screening",
      description: "User-Friendly Screening Offers a simple, non-invasive screening process that can be easily integrated into routine eye exams or diabetes check-ups.",
      icon: LineChart,
      iconBgColor: "bg-green-500"
    },
    {
      title: "Instant Results",
      description: "Instant Results Delivers quick results, allowing healthcare providers to make informed decisions and discuss findings immediately with patients.",
      icon: Timer,
      iconBgColor: "bg-red-400"
    },
    {
      title: "Continuous Learning",
      description: "Continuous Learning The ML model continuously improves its accuracy by learning from new data, ensuring up-to-date and reliable diagnostics.",
      icon: Brain,
      iconBgColor: "bg-purple-500"
    },
    {
      title: "Accessible Anywhere",
      description: "Accessible Anywhere Cloud-based solution allows for secure access to screening tools and results from any authorized device or location.",
      icon: Globe,
      iconBgColor: "bg-orange-400"
    }
  ];

  return (
    <section className="py-16 bg-[#0A192F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-white mb-12">
          Key Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              title={benefit.title}
              description={benefit.description}
              icon={benefit.icon}
              iconBgColor={benefit.iconBgColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;

