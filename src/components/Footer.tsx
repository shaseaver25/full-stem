
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Stay Updated
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Get the latest lessons and resources delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
            />
            <Button 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <img 
                src="/lovable-uploads/3674debe-cc91-44e5-b661-71199ab7a186.png" 
                alt="Full STEM Logo" 
                className="h-16 mb-4"
              />
              <p className="text-gray-400 mb-6 leading-relaxed">
                STEM education for underrepresented communities.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <Mail className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Learning Tracks */}
            <div>
              <h5 className="text-lg font-semibold mb-4">Learning</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Ethical AI</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Excel Skills</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">STEM in Action</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">All Courses</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h5 className="text-lg font-semibold mb-4">Resources</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Getting Started</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Teachers</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Help</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="text-lg font-semibold mb-4">Company</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Mission</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Careers</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Full STEM. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                <Github className="h-4 w-4 mr-1" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
