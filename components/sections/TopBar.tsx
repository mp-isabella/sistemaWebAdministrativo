'use client';
import React from 'react';
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
} from 'react-icons/fa';

const colors = {
  dark: '#002D71',
  highlight: '#F46015',
  white: '#FFFFFF',
};

const socialMediaLinks = [
  { icon: <FaFacebookF />, url: 'https://facebook.com' },
  { icon: <FaTwitter />, url: 'https://twitter.com' },
  { icon: <FaLinkedinIn />, url: 'https://linkedin.com' },
  { icon: <FaInstagram />, url: 'https://instagram.com' },
  { icon: <FaYoutube />, url: 'https://youtube.com' },
];

const TopBar: React.FC = () => {
  return (
    <div className="bg-[#002D71] text-white">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-2 px-4 md:px-8 lg:px-16 text-sm">
        
        {/* Contact Info */}
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaPhoneAlt className="h-3 w-3 text-[#F46015]" />
              <span>+56942008410 (Santiago)</span>
            </div>
            <span className="hidden md:block text-gray-400">|</span>
            <div className="flex items-center space-x-2">
              <FaPhoneAlt className="h-3 w-3 text-[#F46015]" />
              <span>+56996706640 (Ñuble)</span>
            </div>
          </div>
          <span className="hidden md:block text-gray-400">|</span>
          <div className="flex items-center space-x-2">
            <FaEnvelope className="h-3 w-3 text-[#F46015]" />
            <span>amesticaltda@gmail.com</span>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="flex space-x-4 mt-2 md:mt-0">
          {socialMediaLinks.map(({ icon, url }, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 flex items-center justify-center text-white hover:text-[#F46015] transition-colors"
              aria-label={`Link to ${url}`}
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
