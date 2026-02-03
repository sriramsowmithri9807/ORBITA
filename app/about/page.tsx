'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
    const router = useRouter();

    const sections = [
        {
            title: "About ORBITA-Ω",
            content: "ORBITA-Ω (Omega) is a planetary-scale Space Intelligence and Monitoring System. It operates as a global space nervous system, transforming raw orbital data into foresight, coordination, and trust. As a persistent, autonomous, and self-evolving cognitive system, it is designed to manage the complexity of modern near-Earth space governance.",
            color: "text-neon-cyan"
        },
        {
            title: "Planetary Infrastructure",
            content: "ORBITA-Ω acts as a neutral coordination intelligence for the future of space. It is designed to scale across thousands of satellites simultaneously, providing:",
            bullets: [
                "Planetary Perception: Correlating events across unrelated spacecraft.",
                "Behavioral Fingerprinting: Identifying Anomalous Intent and degradation.",
                "Autonomous Governance: Deconflicting maneuver windows for mega-constellations.",
                "Global Risk Assessment: Anticipating collision chains and maneuver cascades."
            ],
            color: "text-orbital-orange"
        }
    ];

    return (
        <main className="min-h-screen relative overflow-hidden text-white">

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-purple-500 tracking-tighter">
                            ORBITA-Ω ARCHITECTURE
                        </h1>
                        <p className="text-sm text-gray-400 font-mono mt-2">CLASSIFICATION: PLANETARY INFRASTRUCTURE // LEVEL 7</p>
                    </motion.div>

                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 border border-white/20 hover:bg-white/10 rounded transition-all text-sm font-mono text-neon-cyan"
                    >
                        RETURN TO LAUNCH
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* LEFT COLUMN: Narrative */}
                    <div className="space-y-8">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                className="glass-panel p-8 border-l-4 border-l-neon-cyan"
                            >
                                <h2 className={`text-2xl font-bold ${section.color} mb-4`}>{section.title}</h2>
                                <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-4">
                                    {section.content}
                                </p>
                                {section.bullets && (
                                    <ul className="list-disc pl-5 space-y-2 text-gray-400 text-sm">
                                        {section.bullets.map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* RIGHT COLUMN: Visual Architecture */}
                    <div className="relative">
                        <div className="glass-panel p-8 h-full min-h-[500px] flex flex-col items-center justify-center space-y-8 border border-white/10">

                            {/* Diagram Nodes */}
                            <ArchNode title="MULTIMODAL SPACE PERCEPTION" desc="Continuous integration of Telemetry, State Vectors, and Environmental Signals" color="border-neon-cyan text-neon-cyan" />

                            <div className="h-8 w-0.5 bg-gradient-to-b from-neon-cyan to-purple-500"></div>

                            <ArchNode title="BEHAVIORAL FINGERPRINTING" desc="Pattern recognition for Autonomous Intent and System Degradation" color="border-white/40 text-white" />

                            <div className="h-8 w-0.5 bg-white/20"></div>

                            <div className="grid grid-cols-2 gap-8 w-full">
                                <ArchNode title="PREDICTIVE EVENTS" desc="Collision Chain & Maneuver Cascade Forecasting" color="border-orbital-orange text-orbital-orange" />
                                <ArchNode title="COUNTERFACTUAL SIM" desc="Digital Twin Outcomes & 'What If' Reasoning" color="border-neon-purple text-neon-purple" />
                            </div>

                            <div className="h-8 w-0.5 bg-gradient-to-b from-white/20 to-neon-cyan"></div>

                            <ArchNode title="PLANETARY GOVERNANCE INTERFACE" desc="Autonomous Multi-Agent Coordination & Neutral Traffic Control" color="border-neon-cyan text-neon-cyan bg-neon-cyan/5" />

                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

function ArchNode({ title, desc, color }: { title: string, desc: string, color: string }) {
    return (
        <div className={`w-full p-4 border rounded text-center backdrop-blur-md ${color} transition-all hover:scale-105`}>
            <h3 className="font-bold text-sm tracking-widest mb-1">{title}</h3>
            <p className="text-[10px] opacity-70 uppercase font-mono">{desc}</p>
        </div>
    );
}
