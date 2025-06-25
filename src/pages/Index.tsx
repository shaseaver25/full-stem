
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import CoreTracks from "@/components/CoreTracks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { GraduationCap, Users, BookOpen, ArrowRight } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      
      {/* Teacher Portal Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Are You an Educator?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Access our comprehensive teacher dashboard with class management, 
              progress tracking, and AI-personalized curriculum tools.
            </p>
            <Link to="/teacher/auth">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg">
                Get Started as a Teacher
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Class Management</CardTitle>
                <CardDescription>
                  Organize students, track progress, and manage assignments
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>AI-Powered Curriculum</CardTitle>
                <CardDescription>
                  Access personalized STEM lessons adapted to student needs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Professional Development</CardTitle>
                <CardDescription>
                  Track PD hours and access educator training modules
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <HowItWorks />
      <CoreTracks />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
