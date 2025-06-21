
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Maria Rodriguez",
      role: "High School Student",
      image: "/placeholder.svg",
      initials: "MR",
      quote: "The Ethical AI track opened my eyes to how technology can be fair and inclusive. I now understand the responsibility that comes with building AI systems.",
      rating: 5
    },
    {
      name: "James Chen",
      role: "Community College Intern",
      image: "/placeholder.svg",
      initials: "JC",
      quote: "Excel for Interns gave me real skills I use every day at my internship. The practical approach made all the difference in my professional development.",
      rating: 5
    },
    {
      name: "Aisha Johnson",
      role: "STEM Teacher",
      image: "/placeholder.svg",
      initials: "AJ",
      quote: "This platform is exactly what our students need. It combines technical skills with ethical thinking in a way that's engaging and accessible.",
      rating: 5
    },
    {
      name: "Carlos Martinez",
      role: "Recent Graduate",
      image: "/placeholder.svg",
      initials: "CM",
      quote: "The hands-on approach and focus on underrepresented communities made me feel seen and supported. These skills helped me land my first tech job.",
      rating: 5
    },
    {
      name: "Dr. Sarah Kim",
      role: "University Professor",
      image: "/placeholder.svg",
      initials: "SK",
      quote: "I recommend this platform to all my students. The combination of practical skills and ethical foundations is unmatched in STEM education.",
      rating: 5
    },
    {
      name: "Alex Thompson",
      role: "Student Researcher",
      image: "/placeholder.svg",
      initials: "AT",
      quote: "Learning about data bias and fairness algorithms changed how I approach research. This platform teaches crucial skills for the future of tech.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Hear from Our Community
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Students, educators, and professionals sharing how Full STEM has transformed their learning journey and career prospects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border-2 border-gray-100 hover:border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
