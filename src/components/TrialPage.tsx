
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BarChart3, Users, CheckCircle, Sparkles, Target, BookOpen } from "lucide-react";

const TrialPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-orange-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-orange-200/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-200/25 rounded-full blur-xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        
        {/* STEM decorative elements */}
        <div className="absolute top-1/4 left-1/6 text-blue-500/20 font-mono text-sm transform rotate-12">
          if (learner.engaged) {'{'}
          <br />
          &nbsp;&nbsp;progress++;
          <br />
          {'}'}
        </div>
        <div className="absolute bottom-1/3 right-1/6 text-green-500/20 font-mono text-sm transform -rotate-12">
          &lt;inclusivity&gt;
          <br />
          &nbsp;&nbsp;for all minds
          <br />
          &lt;/inclusivity&gt;
        </div>
        
        <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-blue-500/40 rotate-45 animate-spin" style={{animationDuration: '10s'}}></div>
        <div className="absolute bottom-1/3 left-1/5 w-4 h-4 bg-orange-500/40 rotate-12 animate-bounce"></div>
        <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-green-500/30 rotate-45 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/3674debe-cc91-44e5-b661-71199ab7a186.png" 
                alt="Full STEM Logo" 
                className="h-16 md:h-20 mx-auto"
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Join the 
              <span className="bg-gradient-to-r from-blue-600 via-green-600 to-orange-600 bg-clip-text text-transparent">
                {' '}Full STEM Free Trial
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get early access to interactive STEM lessons—and help shape the future of education.
            </p>

            {/* What You'll Get Section */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl mb-12 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-blue-600 mr-2" />
                What You'll Get
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start">
                  <Brain className="h-8 w-8 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Selected Lessons</h3>
                    <p className="text-gray-600 text-sm">Access to Ethical AI and Excel for Interns tracks</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BarChart3 className="h-8 w-8 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Interactive Tools</h3>
                    <p className="text-gray-600 text-sm">Dashboards and reflection tools for deeper learning</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-8 w-8 text-orange-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Group Access</h3>
                    <p className="text-gray-600 text-sm">Invite your student group or entire class</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* BETA Program Info */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <Target className="h-6 w-6 text-orange-600 mr-2" />
                  Join Our BETA Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  This is a BETA program where you'll be among the first to experience our innovative approach to STEM education.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Experience early features and provide valuable feedback</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Receive occasional surveys (1–2 per month)</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Optional invitations to feedback calls</span>
                  </div>
                </div>

                <div className="bg-white/60 rounded-2xl p-4 border border-amber-200/50">
                  <p className="text-gray-800 font-medium text-center">
                    <BookOpen className="h-5 w-5 text-blue-600 inline mr-2" />
                    You'll help us build something better—for every kind of learner.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Airtable Form */}
            <Card className="bg-white/90 backdrop-blur-md shadow-2xl border-2 border-gray-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 text-center">
                  Start Your Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <iframe 
                  className="airtable-embed w-full" 
                  src="https://airtable.com/embed/appanbHfaMQ5ha3eE/shrxz9OpKOeSIs5bw" 
                  style={{
                    background: 'transparent',
                    border: '1px solid #ccc',
                    borderRadius: '8px'
                  }}
                  width="100%" 
                  height="533"
                />
              </CardContent>
            </Card>
          </div>

          {/* Trust indicators */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border border-amber-200/50 max-w-2xl mx-auto">
              <p className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                ✨ Created by Award-Winning Educators
              </p>
              <p className="text-gray-600">
                Trusted expertise in inclusive STEM education and curriculum development
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialPage;
