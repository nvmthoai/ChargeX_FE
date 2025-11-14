import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  CreditCard,
  Shield,
  Truck,
  Headphones
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto bg-gradient-to-br from-ocean-900 via-ocean-800 to-energy-900 text-white">
      {/* Decorative Top Border */}
      <div className="h-1 bg-gradient-to-r from-ocean-400 via-energy-400 to-ocean-400"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-ocean-400 to-energy-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative p-2 bg-gradient-to-r from-ocean-500 to-energy-500 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-ocean-300 to-energy-300 bg-clip-text text-transparent">
                  ChargeX
                </h2>
                <p className="text-xs text-ocean-200 font-medium">Premium Marketplace</p>
              </div>
            </Link>
            <p className="text-ocean-200 text-sm mb-6 leading-relaxed">
              Your trusted platform for buying and selling premium products. Experience seamless transactions and exceptional service.
            </p>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-ocean-700/50 hover:bg-ocean-600 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-ocean-700/50 hover:bg-ocean-600 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-ocean-700/50 hover:bg-ocean-600 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-ocean-700/50 hover:bg-ocean-600 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-ocean-200 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-ocean-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-ocean-200 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-ocean-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/auction"
                  className="text-ocean-200 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-ocean-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Auctions
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-ocean-200 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-ocean-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-ocean-200 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-ocean-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/help"
                  className="text-ocean-200 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-ocean-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-ocean-200 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-ocean-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-ocean-200 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-ocean-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-ocean-200 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-ocean-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-ocean-200 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-ocean-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-ocean-700/50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-ocean-300" />
                </div>
                <div>
                  <p className="text-sm text-ocean-200 font-medium">Email</p>
                  <a
                    href="mailto:support@chargex.com"
                    className="text-ocean-100 hover:text-white transition-colors text-sm"
                  >
                    support@chargex.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-ocean-700/50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-ocean-300" />
                </div>
                <div>
                  <p className="text-sm text-ocean-200 font-medium">Phone</p>
                  <a
                    href="tel:+84123456789"
                    className="text-ocean-100 hover:text-white transition-colors text-sm"
                  >
                    +84 123 456 789
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-ocean-700/50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-ocean-300" />
                </div>
                <div>
                  <p className="text-sm text-ocean-200 font-medium">Address</p>
                  <p className="text-ocean-100 text-sm">
                    123 Business Street<br />
                    Ho Chi Minh City, Vietnam
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 pt-8 border-t border-ocean-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-ocean-700/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-ocean-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Secure Payment</p>
                <p className="text-xs text-ocean-200">100% Protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-ocean-700/30 flex items-center justify-center">
                <Truck className="w-6 h-6 text-ocean-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Free Shipping</p>
                <p className="text-xs text-ocean-200">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-ocean-700/30 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-ocean-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">24/7 Support</p>
                <p className="text-xs text-ocean-200">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-ocean-700/30 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-ocean-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Easy Returns</p>
                <p className="text-xs text-ocean-200">30-day guarantee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-ocean-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-ocean-200">
              <p>
                © {currentYear} ChargeX. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-ocean-200">We accept:</span>
              <div className="flex items-center gap-2">
                <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-xs font-semibold text-ocean-800">
                  VISA
                </div>
                <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-xs font-semibold text-ocean-800">
                  MC
                </div>
                <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-xs font-semibold text-ocean-800">
                  AMEX
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

