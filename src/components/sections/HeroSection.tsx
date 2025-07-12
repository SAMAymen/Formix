// components/sections/HeroSection.tsx
'use client';

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight } from "lucide-react";

export function HeroSection({
    loadingStates,
    handleNavigation
}: {
    loadingStates: { startBuilding: boolean, watchDemo: boolean },
    handleNavigation: (buttonId: string, path: string) => void
}) {
    const { scrollY } = useScroll();
    const formRotate = useTransform(scrollY, [0, 300], [0, 3]);
    const formY = useTransform(scrollY, [0, 300], [0, -30]);
    return (
        <section className="pt-16 md:pt-24 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <motion.div className="space-y-6">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm">No-Code Solution</Badge>
                    </motion.div>
                    <motion.h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        Connect <span className="text-green-600">Google Sheets</span> to your website forms.
                    </motion.h2>
                    <motion.p className="text-lg text-gray-600 max-w-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                        Create beautiful forms that automatically send submissions to Google Sheets. No coding required. Earn achievements while you build!
                    </motion.p>
                    <motion.div className="flex flex-wrap gap-4 pt-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="lg"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={loadingStates.startBuilding}
                                onClick={() => handleNavigation('startBuilding', '/dashboard')}
                            >
                                {loadingStates.startBuilding ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        Start Building <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-green-600 text-green-600 hover:bg-green-50"
                                disabled={loadingStates.watchDemo}
                                onClick={() => handleNavigation('watchDemo', '/demo')}
                            >
                                {loadingStates.watchDemo ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "Watch Demo"
                                )}
                            </Button>
                        </motion.div>
                    </motion.div>
                    <motion.div className="flex items-center gap-4 pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}>
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <motion.div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs border-2 border-white"
                                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1, type: "spring" }}>
                                    {String.fromCharCode(64 + i)}
                                </motion.div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-600"><span className="font-medium text-green-700">2,500+</span> forms created this week</p>
                    </motion.div>
                </motion.div>

                {/* Form Preview */}
                <motion.div className="relative rounded-xl bg-white p-1 shadow-xl ring-1 ring-gray-200 mt-8 lg:mt-0"
                    style={{ y: formY, rotate: formRotate }} initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}>
                    <div className="absolute top-2 left-2 flex space-x-1">
                        {["red", "yellow", "green"].map((color, i) => (
                            <motion.div key={i} className={`w-3 h-3 rounded-full bg-${color}-500`} whileHover={{ scale: 1.2 }} />
                        ))}
                    </div>
                    <div className="p-6 rounded-lg bg-white">
                        <h3 className="text-center font-medium text-lg mb-4 text-gray-800">Contact Form</h3>
                        <div className="space-y-4">
                            {["Name", "Email", "Message"].map((label, i) => (
                                <motion.div key={label} className="space-y-2" initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                                    <label className="text-sm font-medium text-gray-700">{label}</label>
                                    <motion.div className="h-10 w-full rounded-md border border-gray-300 bg-gray-50"
                                        whileHover={{ scale: 1.02 }} transition={{ type: "spring" }} />
                                </motion.div>
                            ))}
                            <motion.div className="w-full pt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white w-full">
                                    Submit <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </motion.div>
                        </div>
                        <motion.div className="absolute -bottom-3 right-8 bg-green-100 rounded-md py-1 px-3 text-xs text-green-800 shadow-sm flex items-center"
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
                            <div className="mr-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Connected to Google Sheets
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}