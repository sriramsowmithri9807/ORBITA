'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden">


            <div className="container mx-auto px-4 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="text-center"
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                        className="mb-8"
                    >
                        <h1 className="text-8xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple bg-clip-text text-transparent
                             animate-glow">
                                ORBITA
                            </span>
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-neon-cyan">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="w-12 h-12 border-2 border-neon-cyan rounded-full border-t-transparent"
                            />
                        </div>
                    </motion.div>

                    {/* Tagline */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="text-2xl md:text-3xl text-gray-300 mb-4 tracking-wide"
                    >
                        Autonomous AI Mission Control
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
                    >
                        Advanced satellite mission planning and real-time autonomous decision-making
                        for Low Earth, Medium Earth, and Geostationary orbits
                    </motion.p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/mission-setup')}
                            className="mission-button text-lg px-8 py-4 min-w-[200px]"
                        >
                            INITIATE MISSION
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.3, duration: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/about')}
                            className="text-lg px-8 py-4 min-w-[200px] border border-white/20 hover:bg-white/5 rounded font-mono text-neon-cyan tracking-widest backdrop-blur-sm"
                        >
                            SYSTEM ARCHITECTURE
                        </motion.button>
                    </div>

                    {/* Feature highlights */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
                    >
                        {[
                            {
                                title: 'Real-Time Telemetry',
                                description: 'Live monitoring of battery, thermal, orientation, and signal data',
                            },
                            {
                                title: 'AI Decision Engine',
                                description: 'Autonomous anomaly detection and intelligent corrective actions',
                            },
                            {
                                title: 'Mission Analytics',
                                description: 'Comprehensive reporting and performance metrics',
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.7 + index * 0.2, duration: 0.8 }}
                                className="glass-panel p-6 hover:glow-border transition-all duration-300"
                            >
                                <h3 className="text-lg font-semibold text-neon-cyan mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Animated grid overlay */}
            <div className="fixed inset-0 -z-5 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `
               linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
             `,
                    backgroundSize: '50px 50px',
                }}
            />
        </main>
    );
}
