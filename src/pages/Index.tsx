
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
      
      {/* Demo Showcase Section */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-200">
            <div className="flex justify-center mb-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 text-sm font-medium">
                🎯 Interactive Demo Available
              </Badge>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Experience the Full Platform
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Explore our comprehensive demo featuring AI-powered text-to-speech, interactive lessons, 
              teacher dashboards, and student analytics. Perfect for demonstrations and trials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/demo-showcase">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  View Full Demo
                </Button>
              </Link>
              <Link to="/components">
                <Button variant="outline" size="lg" className="px-8 py-3">
                  Try AI Features
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
