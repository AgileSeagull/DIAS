import { FiTwitter } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              About DIAS
            </h3>
            <p className="text-gray-600 text-sm">
              Disaster Information & Alert System - Providing real-time disaster alerts and information to keep you safe.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/map" className="text-gray-600 hover:text-blue-600">Live Map</a></li>
              <li><a href="/subscribe" className="text-gray-600 hover:text-blue-600">Subscribe</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact
            </h3>
            <p className="text-sm text-gray-600">
              Email: alerts@dias.com
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Emergency Hotline: +91 9876543210
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>
              {currentYear} DIAS - Disaster Information & Alert System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

