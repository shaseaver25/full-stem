
import { ArrowRight, Target, BookOpen, Trophy } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Target className="h-16 w-16 text-blue-600" />,
      title: "Choose Your Track",
      description: "Select from Ethical AI, Excel Skills, or STEM in Action based on your interests and goals.",
      color: "blue"
    },
    {
      icon: <BookOpen className="h-16 w-16 text-green-600" />,
      title: "Complete Interactive Lessons",
      description: "Engage with hands-on projects, real-world case studies, and personalized learning paths.",
      color: "green"
    },
    {
      icon: <Trophy className="h-16 w-16 text-orange-600" />,
      title: "Earn Recognition",
      description: "Build your portfolio with certificates and showcase your STEM achievements to future employers.",
      color: "orange"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to transform your STEM learning journey
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
                  <div className="flex justify-center mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Step number */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {index + 1}
                  </div>
                </div>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
