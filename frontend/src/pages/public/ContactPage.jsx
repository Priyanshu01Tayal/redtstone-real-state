import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-black uppercase tracking-wider text-[#C62828]">Get in Touch</span>
        <h1 className="text-4xl font-black text-[#222222] mt-1">Contact Our Advisory Desk</h1>
        <p className="text-sm text-gray-500 mt-2">
          Connect directly with our headquarters or visit our client experience centers in Gurgaon, Mumbai, and Bangalore.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-50 text-[#C62828] rounded-2xl flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#222222]">Headquarters</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Level 7, Cyber Hub Horizon, DLF Phase 2, Gurgaon, National Capital Region - 122002
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-50 text-[#C62828] rounded-2xl flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#222222]">Phone / Concierge</h4>
              <p className="text-xs text-gray-500 mt-1">+91 (0124) 480-9900</p>
              <p className="text-xs text-gray-500">+91 98110 00001 (Priority Desk)</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EEEEEE] shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-50 text-[#C62828] rounded-2xl flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#222222]">Email Support</h4>
              <p className="text-xs text-gray-500 mt-1">advisory@redstonebrokerage.com</p>
              <p className="text-xs text-gray-500">owners@redstonebrokerage.com</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#EEEEEE] shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold text-[#222222]">Message Received</h3>
              <p className="text-xs text-gray-500">
                Thank you for contacting RedStone. Our senior advisory desk will respond within 2 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-black text-[#222222] mb-2">Send a Message</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Gupta"
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#C62828]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98000 00000"
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#C62828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">How can we assist you?</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Tell us about the property you want to buy, sell, or rent..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Advisory Request</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
