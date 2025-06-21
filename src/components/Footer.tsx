
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Stay Updated with Full STEM
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Get the latest lessons, resources, and updates on ethical STEM education delivered to your inbox.
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
              <h4 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Full STEM
              </h4>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Making STEM education accessible, ethical, and engaging for all students, especially those from underrepresented communities.
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
              <h5 className="text-lg font-semibold mb-4">Learning Tracks</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Ethical AI for Students</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Excel for Interns</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">STEM in Action</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">All Courses</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h5 className="text-lg font-semibold mb-4">Resources</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Getting Started</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Teacher Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Community Forum</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Help Center</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="text-lg font-semibold mb-4">Company</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Our Mission</a></li>
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
              © 2024 Full STEM. All rights reserved. Building the future of inclusive STEM education.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Terms of Service</a>
              <a href="https://github.com/your-org/full-stem" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                <Github className="h-4 w-4 mr-1" />
                GitHub Repo
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
