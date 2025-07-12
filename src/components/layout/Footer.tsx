// components/layout/Footer.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileSpreadsheet, Coffee, Send, Heart } from "lucide-react";
import Image from "next/image";

const footerSections = [
  {
    title: "Product",
    links: [
      { name: "Dashboard", path: "/dashboard" }
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Demo", path: "/demo" },
    ]
  },
  {
    title: "Company",
    links: [
      { name: "Legal", path: "/legal" },
    ]
  },
  {
    title: "Connect",
    links: [
      { name: "linkedin", path: "https://www.linkedin.com/in/aymen-samoudi/" },
    ]
  }
];

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center mb-14">
          <div className="flex items-center mb-4 bg-gray-800 p-3 rounded-2xl shadow-lg">
            <div className="h-10 w-10 rounded-md mr-3">
              <Image
                src="/tryformix-logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-cover rounded-md"
              />
            </div>
            <span className="text-2xl font-bold text-white">Formix</span>
          </div>
          <p className="text-gray-400 text-center max-w-md">
            Create beautiful forms that automatically sync with Google Sheets
          </p>
        </div>
        
        {/* Links Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 md:gap-16">
          {footerSections.map((section, i) => (
            <motion.div 
              key={section.title} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
              className="min-h-[100px] flex flex-col"
            >
              <h3 className="text-sm font-semibold text-green-400 tracking-wider uppercase mb-5 pb-2 border-b border-gray-800">
                {section.title}
              </h3>
              <ul className="space-y-3 flex-grow">
                {section.links.map(link => (
                    <li key={link.name}>
                    <Link 
                      href={link.path} 
                      className="text-gray-400 hover:text-green-400 transition-colors flex items-center group"
                    >
                      <span className="h-1 w-1 rounded-full bg-green-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.name}
                    </Link>
                    </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
        <p className="flex items-center">
          &copy; {new Date().getFullYear()} Formix. Made with 
          <Heart className="h-3 w-3 mx-1 text-red-500" fill="currentColor" /> 
          in Morocco
        </p>
      </div>
    </footer>
  );
}