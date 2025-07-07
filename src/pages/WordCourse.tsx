import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseOverview from '@/components/CourseOverview';

const WordCourse = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <CourseOverview 
          courseName="Microsoft Word Training"
          trackFilter="Microsoft Word"
        />
      </main>
      <Footer />
    </div>
  );
};

export default WordCourse;