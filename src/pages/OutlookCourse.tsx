import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseOverview from '@/components/CourseOverview';

const OutlookCourse = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <CourseOverview 
          courseName="Outlook Essentials"
          trackFilter="Outlook"
        />
      </main>
      <Footer />
    </div>
  );
};

export default OutlookCourse;