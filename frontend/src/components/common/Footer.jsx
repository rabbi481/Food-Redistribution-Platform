import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Heart, Mail, Phone, MapPin, Globe, Shield, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-600/30">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Food<span className="text-primary-400">Bridge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Connecting commercial donors, food banks, charitable shelters, and grassroots volunteers in real-time to eliminate food waste and fight hunger.
            </p>
            <div className="flex items-center space-x-2 text-xs text-primary-400 bg-primary-950/60 border border-primary-800/40 px-3 py-2 rounded-lg w-fit">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span>Certified Sustainable Community Redistribution</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/donations" className="hover:text-primary-400 transition">Browse Available Food</Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-primary-400 transition">How It Works</a>
              </li>
              <li>
                <a href="/#impact-stats" className="hover:text-primary-400 transition">Live Impact Metrics</a>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary-400 transition">Register as a Donor</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary-400 transition">Join as a Volunteer</Link>
              </li>
            </ul>
          </div>

          {/* User Roles */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Community</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400">Restaurants & Caterers</span>
              </li>
              <li>
                <span className="text-slate-400">Supermarkets & Bakeries</span>
              </li>
              <li>
                <span className="text-slate-400">NGOs & Shelters</span>
              </li>
              <li>
                <span className="text-slate-400">Volunteer Couriers</span>
              </li>
              <li>
                <span className="text-slate-400">Food Safety Guidelines</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact & Support</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>100 Montgomery St, San Francisco, CA</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>support@foodbridge.org</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>+1 (800) 555-FOOD</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} FoodBridge Platform. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-slate-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition">Food Safety Protocol</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
