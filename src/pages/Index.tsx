
import Hero from "@/components/Hero";
import CoreTracks from "@/components/CoreTracks";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

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
