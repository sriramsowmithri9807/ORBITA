'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { SatelliteType, MissionObjective } from '@/types/mission';

export default function MissionSetup() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [satelliteType, setSatelliteType] = useState<SatelliteType>('LEO');
    const [missionName, setMissionName] = useState('');
    const [objectives, setObjectives] = useState<string[]>(['']);
    const [altitude, setAltitude] = useState(400);
    const [inclination, setInclination] = useState(51.6);
    const [validated, setValidated] = useState(false);

    const satelliteTypes: { type: SatelliteType; name: string; description: string; altitudeRange: string }[] = [
        {
            type: 'LEO',
            name: 'Low Earth Orbit',
            description: 'Fast orbital period, ideal for Earth observation and communications',
            altitudeRange: '160 - 2,000 km',
        },
        {
            type: 'MEO',
            name: 'Medium Earth Orbit',
            description: 'Used for navigation systems like GPS and GLONASS',
            altitudeRange: '2,000 - 35,786 km',
        },
        {
            type: 'GEO',
            name: 'Geostationary Orbit',
            description: 'Remains fixed over one position, perfect for weather and communications',
            altitudeRange: '~35,786 km',
        },
    ];

    const addObjective = () => {
        setObjectives([...objectives, '']);
    };

    const updateObjective = (index: number, value: string) => {
        const newObjectives = [...objectives];
        newObjectives[index] = value;
        setObjectives(newObjectives);
    };

    const removeObjective = (index: number) => {
        setObjectives(objectives.filter((_, i) => i !== index));
    };

    const validateAndNext = () => {
        setValidated(true);
        setTimeout(() => {
            if (step < 3) {
                setStep(step + 1);
                setValidated(false);
            } else {
                // Store mission data and navigate to dashboard
                const missionData = {
                    satelliteType,
                    missionName,
                    objectives: objectives.filter(o => o.trim() !== ''),
                    altitude,
                    inclination,
                };
                localStorage.setItem('currentMission', JSON.stringify(missionData));
                router.push('/dashboard');
            }
        }, 1000);
    };

    const canProceed = () => {
        if (step === 1) return satelliteType !== null;
        if (step === 2) return missionName.trim() !== '' && objectives.some(o => o.trim() !== '');
        if (step === 3) return true;
        return false;
    };

    return (
        <main className="min-h-screen relative overflow-hidden">


            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl font-bold text-neon-cyan mb-2">Mission Setup</h1>
                    <p className="text-gray-400">Configure your satellite mission parameters</p>
                </motion.div>

                {/* Progress indicator */}
                <div className="mb-12 flex items-center justify-center gap-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <motion.div
                                animate={{
                                    scale: step === s ? 1.2 : 1,
                                    backgroundColor: step >= s ? '#00f0ff' : 'rgba(255, 255, 255, 0.2)',
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                            >
                                {s}
                            </motion.div>
                            {s < 3 && (
                                <div className={`w-20 h-1 mx-2 ${step > s ? 'bg-neon-cyan' : 'bg-white/20'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step content */}
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="max-w-4xl mx-auto"
                        >
                            <h2 className="text-2xl font-semibold mb-6 text-center">Select Satellite Type</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {satelliteTypes.map((sat) => (
                                    <motion.div
                                        key={sat.type}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSatelliteType(sat.type)}
                                        className={`glass-panel p-6 cursor-pointer transition-all duration-300 ${satelliteType === sat.type ? 'glow-border' : 'hover:border-neon-cyan/30'
                                            }`}
                                    >
                                        <h3 className="text-xl font-bold text-neon-cyan mb-2">{sat.name}</h3>
                                        <p className="text-sm text-gray-400 mb-4">{sat.description}</p>
                                        <div className="text-xs text-orbital-orange">
                                            Altitude: {sat.altitudeRange}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="max-w-2xl mx-auto"
                        >
                            <h2 className="text-2xl font-semibold mb-6 text-center">Mission Objectives</h2>

                            <div className="glass-panel p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Mission Name
                                    </label>
                                    <input
                                        type="text"
                                        value={missionName}
                                        onChange={(e) => setMissionName(e.target.value)}
                                        placeholder="e.g., ORBITA-1 Earth Observation"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                             focus:border-neon-cyan focus:outline-none text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Mission Objectives
                                    </label>
                                    {objectives.map((obj, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={obj}
                                                onChange={(e) => updateObjective(index, e.target.value)}
                                                placeholder={`Objective ${index + 1}`}
                                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                                 focus:border-neon-cyan focus:outline-none text-white"
                                            />
                                            {objectives.length > 1 && (
                                                <button
                                                    onClick={() => removeObjective(index)}
                                                    className="px-4 py-2 bg-status-critical/20 text-status-critical rounded-lg 
                                   hover:bg-status-critical/30 transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={addObjective}
                                        className="mt-2 px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg 
                             hover:bg-neon-cyan/30 transition-colors text-sm"
                                    >
                                        + Add Objective
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="max-w-2xl mx-auto"
                        >
                            <h2 className="text-2xl font-semibold mb-6 text-center">Orbit Parameters</h2>

                            <div className="glass-panel p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Altitude (km)
                                    </label>
                                    <input
                                        type="range"
                                        min="160"
                                        max="2000"
                                        value={altitude}
                                        onChange={(e) => setAltitude(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                                        <span>160 km</span>
                                        <span className="text-neon-cyan font-bold">{altitude} km</span>
                                        <span>2,000 km</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Inclination (degrees)
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="90"
                                        step="0.1"
                                        value={inclination}
                                        onChange={(e) => setInclination(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                                        <span>0°</span>
                                        <span className="text-neon-cyan font-bold">{inclination.toFixed(1)}°</span>
                                        <span>90°</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <h3 className="text-lg font-semibold text-neon-cyan mb-4">Calculated Parameters</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="glass-panel p-4">
                                            <div className="text-sm text-gray-400">Orbital Period</div>
                                            <div className="text-2xl font-bold text-white">
                                                {(90 + (altitude - 160) * 0.05).toFixed(1)} min
                                            </div>
                                        </div>
                                        <div className="glass-panel p-4">
                                            <div className="text-sm text-gray-400">Eccentricity</div>
                                            <div className="text-2xl font-bold text-white">0.001</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-12 flex justify-center gap-4"
                >
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 
                       transition-colors border border-white/20"
                        >
                            Back
                        </button>
                    )}
                    <motion.button
                        onClick={validateAndNext}
                        disabled={!canProceed()}
                        animate={validated ? { scale: [1, 1.1, 1] } : {}}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all ${canProceed()
                            ? 'mission-button'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {validated ? '✓ Validated' : step === 3 ? 'Launch Mission' : 'Next'}
                    </motion.button>
                </motion.div>
            </div>
        </main>
    );
}
