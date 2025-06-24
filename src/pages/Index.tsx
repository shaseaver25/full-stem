
import Hero from "@/components/Hero";
import CoreTracks from "@/components/CoreTracks";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ReadAloudLesson from '../components/ReadAloudLesson';
const lesson = {
  id: 'lesson-1',
  title: 'What is an Algorithm?',
  text: 'An algorithm is a set of steps to solve a problem efficiently.'
};



const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <CoreTracks />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
  <ReadAloudLesson
  lessonText={lessonData.text}
  lessonId={lessonData.id}  // Make sure lessonId is passed
/>

};

export default Index;
