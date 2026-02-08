'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';


export default function AILogicTest() {
    const router = useRouter();
    const [telemetry, setTelemetry] = useState({
        battery_level: 100,
        thermal_state: 20,
        orientation_roll: 0,
        orientation_pitch: 0,
        orientation_yaw: 0,
        signal_latency: 50,
        is_stable: true
    });

    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/ai/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...telemetry,
                    // Additional fields required by schema but not in form
                    id: 0,
                    mission_id: 0,
                    timestamp: new Date().toISOString()
                })
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            setResult({ error: "Could not connect to AI Engine. Ensure backend is running." });
        } finally {
            setLoading(false);
        }
    };

    const scenarios = {
        lowBattery: {
            battery_level: 15,
            thermal_state: 20,
            orientation_roll: 0,
            is_stable: true
        },
        thermalCrit: {
            battery_level: 80,
            thermal_state: 85,
            orientation_roll: 0,
            is_stable: true
        },
        tumbling: {
            battery_level: 95,
            thermal_state: 25,
            orientation_roll: 15,
            is_stable: false
        }
    };

    const loadScenario = (key: keyof typeof scenarios) => {
        setTelemetry(prev => ({ ...prev, ...scenarios[key] }));
    };

    return (
        <main className="min-h-screen relative overflow-hidden bg-space-black text-white">

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-neon-cyan">AI Logic Diagnostic Terminal</h1>
                    <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white">
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* INPUT PANEL */}
                    <div className="glass-panel p-6">
                        <h2 className="text-xl font-semibold mb-4 text-neon-cyan border-b border-white/10 pb-2">Telemetry Injection</h2>

                        {/* Scenarios */}
                        <div className="mb-6 flex gap-2">
                            <button onClick={() => loadScenario('lowBattery')} className="px-3 py-1 text-xs bg-status-critical/20 text-status-critical rounded border border-status-critical/50 hover:bg-status-critical/30">
                                Scenario: Low Battery
                            </button>
                            <button onClick={() => loadScenario('thermalCrit')} className="px-3 py-1 text-xs bg-orbital-orange/20 text-orbital-orange rounded border border-orbital-orange/50 hover:bg-orbital-orange/30">
                                Scenario: Thermal Heat
                            </button>
                            <button onClick={() => loadScenario('tumbling')} className="px-3 py-1 text-xs bg-neon-purple/20 text-neon-purple rounded border border-neon-purple/50 hover:bg-neon-purple/30">
                                Scenario: Instability
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Battery Level (%)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:border-neon-cyan outline-none"
                                    value={telemetry.battery_level}
                                    onChange={e => setTelemetry({ ...telemetry, battery_level: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Thermal State (°C)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:border-neon-cyan outline-none"
                                    value={telemetry.thermal_state}
                                    onChange={e => setTelemetry({ ...telemetry, thermal_state: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Roll Orientation (°)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:border-neon-cyan outline-none"
                                    value={telemetry.orientation_roll}
                                    onChange={e => setTelemetry({ ...telemetry, orientation_roll: Number(e.target.value) })}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-gray-400 text-sm">Is Stable?</label>
                                <input
                                    type="checkbox"
                                    checked={telemetry.is_stable}
                                    onChange={e => setTelemetry({ ...telemetry, is_stable: e.target.checked })}
                                    className="w-5 h-5 accent-neon-cyan"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="w-full mt-6 py-3 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan font-bold rounded hover:bg-neon-cyan/30 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                        >
                            {loading ? 'ANALYZING...' : 'RUN AI ANALYSIS'}
                        </button>
                    </div>

                    {/* OUTPUT PANEL */}
                    <div className="glass-panel p-6 relative min-h-[400px]">
                        <h2 className="text-xl font-semibold mb-4 text-neon-cyan border-b border-white/10 pb-2">AI Diagnosis Output</h2>

                        {result ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className={`p-4 rounded border ${result.anomaly_detected ? 'bg-status-critical/10 border-status-critical' : 'bg-status-nominal/10 border-status-nominal'}`}>
                                    <h3 className={`text-lg font-bold ${result.anomaly_detected ? 'text-status-critical' : 'text-status-nominal'}`}>
                                        {result.anomaly_type || "NOMINAL"}
                                    </h3>
                                    <p className="text-sm text-gray-300 italic">{result.mission_phase}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Root Cause Hypothesis</h4>
                                    <p className="text-white mt-1 border-l-2 border-neon-purple pl-3">{result.root_cause_hypothesis}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Selected Action</h4>
                                    <p className="text-neon-cyan font-mono mt-1 text-lg">{result.selected_action}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Reasoning</h4>
                                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">{result.explanation}</p>
                                </div>

                                {result.recovery_actions_considered && result.recovery_actions_considered.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <h4 className="text-xs text-gray-500 mb-2">ALTERNATIVE OPTIONS EVALUATED</h4>
                                        <div className="space-y-2">
                                            {result.recovery_actions_considered.map((opt: any, i: number) => (
                                                <div key={i} className="flex justify-between text-xs text-gray-400">
                                                    <span>• {opt.action}</span>
                                                    <span className="text-orbital-orange">{opt.risk}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-mono text-sm">
                                [AWAITING TELEMETRY INPUT]
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
