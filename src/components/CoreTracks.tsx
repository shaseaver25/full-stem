
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, BarChart3, Rocket, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CoreTracks = () => {
  const navigate = useNavigate();

  const tracks = [
    {
      icon: <Brain className="h-12 w-12 text-blue-600" />,
      title: "Ethical AI for Students",
      description: "Interactive lessons on fairness, bias, and responsible AI development.",
      features: ["Bias Detection", "Fairness Algorithms", "Case Studies", "Projects"],
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100"
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-green-600" />,
      title: "Excel for Interns",
      description: "Real-world spreadsheet skills with formulas and data analysis.",
      features: ["Advanced Formulas", "Data Visualization", "Task Management", "Templates"],
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      route: "/course/excel"
    },
    {
      icon: <Rocket className="h-12 w-12 text-orange-600" />,
      title: "STEM in Action",
      description: "Hands-on projects bringing STEM concepts to life.",
      features: ["3D Simulations", "Virtual Labs", "Project Learning", "Collaboration"],
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      comingSoon: true
    }
  ];

  const handleTrackClick = (track: any) => {
    if (track.comingSoon) {
      return;
    }
    if (track.route) {
      navigate(track.route);
    }
  };

  return (
    <section id="core-tracks" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Three Learning Tracks
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Build practical skills while fostering ethical thinking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tracks.map((track, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden bg-gradient-to-br ${track.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group`}
            >
              {track.comingSoon && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
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
                  onClick={() => handleTrackClick(track)}
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
