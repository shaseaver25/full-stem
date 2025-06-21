
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, BarChart3, Rocket, ArrowRight } from "lucide-react";

const CoreTracks = () => {
  const tracks = [
    {
      icon: <Brain className="h-12 w-12 text-blue-600" />,
      title: "Ethical AI for Students",
      description: "Interactive lessons on fairness, data bias, and responsible AI development. Learn to build AI systems that work for everyone.",
      features: ["Bias Detection Tools", "Fairness Algorithms", "Real-world Case Studies", "Hands-on Projects"],
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-green-600" />,
      title: "Excel for Interns",
      description: "Master real-world spreadsheet skills with task logs, advanced formulas, and data analysis techniques used in professional environments.",
      features: ["Advanced Formulas", "Data Visualization", "Task Management", "Professional Templates"],
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      icon: <Rocket className="h-12 w-12 text-purple-600" />,
      title: "STEM in Action",
      description: "Upcoming hands-on projects and simulations that bring STEM concepts to life through interactive experiences and real-world applications.",
      features: ["3D Simulations", "Virtual Labs", "Project-Based Learning", "Peer Collaboration"],
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      comingSoon: true
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Three Powerful Learning Tracks
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your path or explore all three. Each track is designed to build practical skills 
            while fostering ethical thinking and inclusive innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tracks.map((track, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden bg-gradient-to-br ${track.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group`}
            >
              {track.comingSoon && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Coming Soon
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {track.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                  {track.title}
                </CardTitle>
                <p className="text-gray-700 leading-relaxed">
                  {track.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {track.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${track.gradient} mr-3`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full bg-gradient-to-r ${track.gradient} hover:shadow-lg text-white font-semibold py-3 rounded-full transition-all duration-300 ${track.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={track.comingSoon}
                >
                  {track.comingSoon ? 'Notify Me' : 'Start Learning'}
                  {!track.comingSoon && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreTracks;
