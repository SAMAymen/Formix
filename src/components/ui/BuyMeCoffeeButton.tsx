import { useState } from "react";
import { Coffee, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface BuyMeCoffeeButtonProps {
  size?: "default" | "sm" | "lg";
  className?: string;
  coffeeLink?: string;
  onCoffeeClick?: () => void;
}

export const BuyMeCoffeeButton = ({
  size = "lg",
  className = "",
  coffeeLink = "https://buymeacoffee.com/samoudiayms",
  onCoffeeClick,
}: BuyMeCoffeeButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    
    if (onCoffeeClick) {
      onCoffeeClick();
    } else {
      window.open(coffeeLink, "_blank");
    }
    
    // Reset loading state after a brief delay
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl blur opacity-40 -m-1 group-hover:opacity-60 transition-opacity"></div>
      <Button
        size={size}
        className={`relative bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white border-none shadow-md px-8 py-6 text-lg group font-medium ${className}`}
        disabled={isLoading}
        onClick={handleClick}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <>
            <span className="flex items-center gap-2">
              <Coffee className="h-6 w-6" />
              Buy Me a Coffee
            </span>
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </>
        )}
      </Button>
    </motion.div>
  );
};