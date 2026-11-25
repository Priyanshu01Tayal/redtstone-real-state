import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, ShieldCheck, Heart, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#222222] text-white pt-16 pb-8 border-t-4 border-[#C62828]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#C62828] flex items-center justify-center text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                RED<span className="text-[#E53935]">STONE</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              India's premier managed real estate brokerage platform. Connecting verified property owners with serious buyers and tenants through dedicated in-house brokerage experts.
            </p>
            <div className="pt-2 flex flex-col space-y-2 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#E53935] shrink-0" />
                <span>Level 7, Cyber Hub Horizon, DLF Phase 2, Gurgaon, NCR</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#E53935] shrink-0" />
                <span>+91 (0124) 480-9900 / +91 98110 00001</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#E53935] shrink-0" />
                <span>advisory@redstonebrokerage.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#C62828] pl-2">
              Properties
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/buy" className="hover:text-white transition">Buy Property</Link></li>
              <li><Link to="/rent" className="hover:text-white transition">Rent Property</Link></li>
              <li><Link to="/commercial" className="hover:text-white transition">Commercial Offices & Shops</Link></li>
              <li><Link to="/residential" className="hover:text-white transition">Luxury Residential & Villas</Link></li>
              <li><Link to="/buy?type=residential_plot" className="hover:text-white transition">Plots & Land Parcels</Link></li>
            </ul>
          </div>

          {/* Stakeholders & Platform */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#C62828] pl-2">
              Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/register?role=owner" className="hover:text-white transition">Property Owner Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition">In-House Broker Portal</Link></li>
              <li><Link to="/register?role=client" className="hover:text-white transition">Buyer & Tenant Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Admin Management Suite</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Our Brokerage</Link></li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#C62828] pl-2">
              Our Guarantee
            </h4>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#E53935] shrink-0 mt-0.5" />
                <span><strong>Owner Privacy:</strong> Contact info is strictly protected from public scraping.</span>
              </div>
              <div className="flex items-start space-x-2">
                <Award className="w-4 h-4 text-[#E53935] shrink-0 mt-0.5" />
                <span><strong>RERA Verified:</strong> In-house brokers legally licensed and vetted.</span>
              </div>
              <div className="flex items-start space-x-2">
                <Heart className="w-4 h-4 text-[#E53935] shrink-0 mt-0.5" />
                <span><strong>Zero Hassle:</strong> End-to-end site visit and paperwork coordination.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>© {new Date().getFullYear()} RedStone Real Estate Brokerage Pvt. Ltd. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">RERA Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
