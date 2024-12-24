import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1A1F2C] text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">SocialManager</h3>
            <p className="text-[#C8C8C9] text-sm">
              Streamline your social media management with our powerful platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-[#C8C8C9]">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-[#C8C8C9]">
              <li>Post Scheduling</li>
              <li>Analytics Dashboard</li>
              <li>Media Management</li>
              <li>Multi-platform Support</li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-[#C8C8C9] hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#C8C8C9] hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#C8C8C9] hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#C8C8C9] hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            <div className="flex items-center text-[#C8C8C9]">
              <Mail className="h-5 w-5 mr-2" />
              <span>contact@socialmanager.com</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-[#8E9196]">
          <p>&copy; {new Date().getFullYear()} SocialManager. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}