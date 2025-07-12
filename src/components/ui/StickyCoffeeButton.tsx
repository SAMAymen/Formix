"use client";

import React, { useState } from 'react';
import { Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StickyCoffeeButtonProps {
  coffeeLink?: string;
}

export const StickyCoffeeButton: React.FC<StickyCoffeeButtonProps> = ({
  coffeeLink = 'https://buymeacoffee.com/samoudiayms'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="fixed bottom-5 right-5 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.3 }}
    >
      <a 
        href={coffeeLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className="flex items-center bg-amber-500 text-white rounded-full shadow-lg overflow-hidden"
          animate={{
            width: isHovered ? 'auto' : '3rem',
            paddingLeft: isHovered ? '0.75rem' : '0',
            paddingRight: isHovered ? '0.75rem' : '0',
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
            <Coffee className="h-5 w-5" />
          </div>
          
          <AnimatePresence>
            {isHovered && (
              <motion.span
                className="text-sm font-medium whitespace-nowrap pr-1"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                Buy me a coffee
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </a>
    </motion.div>
  );
};