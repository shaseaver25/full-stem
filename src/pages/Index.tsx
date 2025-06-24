
import Hero from "@/components/Hero";
import CoreTracks from "@/components/CoreTracks";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ReadAloudLesson from '@/components/ReadAloudLesson';

const lesson = {
  id: 'lesson-demo',
  title: 'What is an Algorithm?',
  text: 'An algorithm is a set of steps to solve a problem efficiently. Think of it like a recipe for cooking - you follow specific instructions in order to get the desired result. In computer science, algorithms help us process data, make decisions, and automate tasks. Understanding algorithms is fundamental to programming and problem-solving in technology.'
};

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      
      {/* Demo Lesson Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
            <p className="text-lg text-gray-600">Try our read-aloud feature with this sample lesson</p>
          </div>
          <ReadAloudLesson
            lessonText={lesson.text}
            lessonId={lesson.id}
          />
        </div>
      </section>
      
      <CoreTracks />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
