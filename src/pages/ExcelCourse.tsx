
import React from 'react';
import CourseOverview from '@/components/CourseOverview';
import Header from '@/components/Header';

const ExcelCourse = () => {
  return (
    <div>
      <Header />
      <CourseOverview 
        courseName="Excel for Interns" 
        trackFilter="Excel" 
      />
    </div>
  );
};

export default ExcelCourse;
