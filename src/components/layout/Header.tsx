'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";
import Image from "next/image";

export function Header({ handleNavigation }: {
    handleNavigation: (buttonId: string, path: string) => void
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <motion.header
            className="sticky top-0 z-50 backdrop-blur-sm bg-white/80 border-b border-green-100"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <BrandLogo />
                    <DesktopNav handleNavigation={handleNavigation} />
                    <MobileNav
                        isMenuOpen={isMenuOpen}
                        setIsMenuOpen={setIsMenuOpen}
                        handleNavigation={handleNavigation}
                    />
                </div>
            </div>
        </motion.header>
    );
}

function BrandLogo() {
    return (
        <Link href="/" className="flex items-center gap-2">
            <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
            <Image
                src="/tryformix-logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-cover rounded-md"
            />
            </motion.div>
            <motion.h1
            className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            >
            Formix
            </motion.h1>
        </Link>
    );
}

function DesktopNav({ handleNavigation }: {
    handleNavigation: (buttonId: string, path: string) => void
}) {
    return (
        <div className="hidden md:flex items-center gap-4">
            <SignUpButton handleClick={() => handleNavigation('signUpFree', '/login')} />
        </div>
    );
}

function MobileNav({ isMenuOpen, setIsMenuOpen, handleNavigation }: {
    isMenuOpen: boolean,
    setIsMenuOpen: (value: boolean) => void,
    handleNavigation: (buttonId: string, path: string) => void
}) {
    return (
        <div className="flex md:hidden mobile-menu-button">
            <Button
                variant="ghost"
                size="sm"
                className="text-green-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
            </Button>
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-16 inset-x-0 md:hidden bg-white border-b border-green-100 z-50 w-f"
                    >
                        <div className="px-4 py-4 space-y-4">
                            <SignUpButton
                                handleClick={() => {
                                    setIsMenuOpen(false);
                                    handleNavigation('signUpFree', '/login');
                                }}
                                fullWidth
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SignUpButton({ handleClick, fullWidth = false }: {
    handleClick: () => void,
    fullWidth?: boolean
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            whileHover={{ scale: 1.05 }}
        >
            <Button
                className={`bg-green-600 hover:bg-green-700 text-white ${fullWidth ? 'w-full' : ''}`}
                onClick={handleClick}
            >
                Sign Up Free
            </Button>
        </motion.div>
    );
}
