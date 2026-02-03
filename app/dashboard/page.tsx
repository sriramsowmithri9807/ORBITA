'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import Starfield from '@/components/Starfield';
import TelemetryCard from '@/components/TelemetryCard';
import AIDecisionLog from '@/components/AIDecisionLog';
import MissionTimeline from '@/components/MissionTimeline';
import { useRealtimeMission } from '@/hooks/useRealtimeMission';
import { useMissionEvents } from '@/hooks/useMissionEvents';
import { SatelliteType } from '@/types/mission';

// Dynamically import OrbitVisualization to avoid SSR issues with Three.js
const OrbitVisualization = dynamic(() => import('@/components/OrbitVisualization'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="text-neon-cyan">Loading orbit visualization...</div>
        </div>
    ),
});

export default function Dashboard() {
    const router = useRouter();
    const [missionId] = useState('mission-1');
    const [satelliteType, setSatelliteType] = useState<SatelliteType>('LEO');
    const [missionName, setMissionName] = useState('ORBITA-1');
    const [activeTab, setActiveTab] = useState<'ai-log' | 'timeline'>('ai-log');

    const { telemetry, status, decisions: aiDecisions } = useRealtimeMission(missionId);
    const missionEvents = useMissionEvents(missionId);

    useEffect(() => {
        // Load mission data from localStorage
        const missionData = localStorage.getItem('currentMission');
        if (missionData) {
            const data = JSON.parse(missionData);
            setSatelliteType(data.satelliteType || 'LEO');
            setMissionName(data.missionName || 'ORBITA-1');
        }
    }, []);

    const handleEmergencyOverride = async () => {
        const confirmed = window.confirm("⚠️ WARNING: This will disengage AI autonomy and switch to manual control. Are you sure?");
        if (!confirmed) return;

        try {
            await fetch('http://localhost:8001/mission/1/stop', { method: 'POST' });
            alert("✅ OVERRIDE SUCCESSFUL: AI Autonomy Disengaged.\nManual Control Interface Active.");
        } catch (e) {
            console.warn("Backend unavailable", e);
            alert("✅ OVERRIDE SUCCESSFUL (Simulation): AI Disengaged.");
        }
    };

    const handleDownloadTelemetry = () => {
        const rows = [
            ["Timestamp", "Battery (%)", "Thermal (C)", "Latency (ms)", "Roll", "Pitch", "Yaw"]
        ];

        // Generate mock history for the last hour
        const now = new Date();
        for (let i = 0; i < 60; i++) {
            const time = new Date(now.getTime() - (60 - i) * 60000).toISOString();
            rows.push([
                time,
                (90 - Math.random() * 10).toFixed(2),
                (20 + Math.random() * 5).toFixed(2),
                (120 + Math.random() * 20).toFixed(0),
                (Math.random() * 360).toFixed(2),
                (Math.random() * 360).toFixed(2),
                (Math.random() * 360).toFixed(2)
            ]);
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `telemetry_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusText = () => {
        switch (status) {
            case 'nominal':
                return 'All Systems Nominal';
            case 'warning':
                return 'Warning - Monitoring';
            case 'critical':
                return 'Critical - Action Required';
            default:
                return 'Unknown';
        }
    };

    return (
        <main className="min-h-screen relative overflow-hidden">


            <div className="container mx-auto px-4 py-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-neon-cyan mb-1">{missionName}</h1>
                        <p className="text-gray-400">Mission Control Dashboard</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-lg font-semibold ${status === 'nominal' ? 'bg-status-nominal/20 text-status-nominal' :
                            status === 'warning' ? 'bg-status-warning/20 text-status-warning' :
                                'bg-status-critical/20 text-status-critical'
                            }`}>
                            {getStatusText()}
                        </div>
                        <div className={`w-4 h-4 rounded-full animate-pulse ${status === 'nominal' ? 'bg-status-nominal' :
                            status === 'warning' ? 'bg-status-warning' :
                                'bg-status-critical'
                            }`} />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - Orbit Visualization */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <div className="glass-panel p-6 h-[500px]">
                            <h2 className="text-xl font-semibold text-neon-cyan mb-4">Orbit Visualization</h2>
                            <Suspense fallback={<div>Loading...</div>}>
                                <OrbitVisualization satelliteType={satelliteType} />
                            </Suspense>
                        </div>
                    </motion.div>

                    {/* Right column - Mission Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="glass-panel p-6">
                            <h3 className="text-lg font-semibold text-neon-cyan mb-4">Mission Parameters</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Satellite Type:</span>
                                    <span className="text-white font-semibold">{satelliteType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Mission Duration:</span>
                                    <span className="text-white font-semibold">
                                        {new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Orbit Period:</span>
                                    <span className="text-white font-semibold">92.5 min</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Altitude:</span>
                                    <span className="text-white font-semibold">408 km</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6">
                            <h3 className="text-lg font-semibold text-neon-cyan mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => router.push('/operations')}
                                    className="w-full px-4 py-2 bg-red-600/20 text-red-500 border border-red-600/50 rounded-lg 
                                 hover:bg-red-600/30 transition-all text-sm font-bold tracking-wider animate-pulse">
                                    ⚠️ ENTER OPS CENTER
                                </button>
                                <button
                                    onClick={handleEmergencyOverride}
                                    className="w-full px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg 
                                 hover:bg-neon-cyan/30 transition-colors text-sm">
                                    Emergency Override
                                </button>
                                <button
                                    onClick={() => router.push('/report')}
                                    className="w-full px-4 py-2 bg-orbital-orange/20 text-orbital-orange rounded-lg 
                                 hover:bg-orbital-orange/30 transition-colors text-sm">
                                    Generate Report
                                </button>
                                <button
                                    onClick={() => router.push('/ai-test')}
                                    className="w-full px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg 
                                 hover:bg-neon-purple/30 transition-colors text-sm">
                                    Test AI Logic
                                </button>
                                <button
                                    onClick={handleDownloadTelemetry}
                                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg 
                                 hover:bg-white/20 transition-colors text-sm">
                                    Download Telemetry
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Telemetry Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
                >
                    {telemetry && (
                        <>
                            <TelemetryCard
                                title="Battery Level"
                                value={telemetry.battery}
                                unit="%"
                                status={telemetry.battery < 30 ? 'critical' : telemetry.battery < 50 ? 'warning' : 'nominal'}
                                trend={telemetry.battery > 50 ? 'stable' : 'down'}
                            />
                            <TelemetryCard
                                title="Thermal"
                                value={telemetry.thermal}
                                unit="°C"
                                status={telemetry.thermal > 60 ? 'critical' : telemetry.thermal > 45 ? 'warning' : 'nominal'}
                                trend={telemetry.thermal < 30 ? 'stable' : 'up'}
                            />
                            <TelemetryCard
                                title="Orientation"
                                value={`${telemetry.orientation.roll.toFixed(0)}°`}
                                unit="Roll"
                                status="nominal"
                                trend="stable"
                            />
                            <TelemetryCard
                                title="Signal Latency"
                                value={telemetry.signalLatency}
                                unit="ms"
                                status={telemetry.signalLatency > 400 ? 'critical' : telemetry.signalLatency > 300 ? 'warning' : 'nominal'}
                                trend={telemetry.signalLatency < 200 ? 'stable' : 'up'}
                            />
                        </>
                    )}
                </motion.div>

                {/* AI Decision Log & Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6"
                >
                    <div className="glass-panel p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-neon-cyan">Mission Data</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('ai-log')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'ai-log'
                                        ? 'bg-neon-cyan text-space-black font-semibold'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                        }`}
                                >
                                    AI Decision Log
                                </button>
                                <button
                                    onClick={() => setActiveTab('timeline')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'timeline'
                                        ? 'bg-neon-cyan text-space-black font-semibold'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                        }`}
                                >
                                    Mission Timeline
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[600px] overflow-y-auto pr-2">
                            {activeTab === 'ai-log' ? (
                                <AIDecisionLog decisions={aiDecisions} />
                            ) : (
                                <MissionTimeline events={missionEvents} />
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
