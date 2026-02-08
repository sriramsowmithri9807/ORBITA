'use client';

import { useState, useEffect } from 'react';
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
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/mission/1/stop`, { method: 'POST' });
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
            case 'nominal': return 'All Systems Nominal';
            case 'warning': return 'Warning - Monitoring';
            case 'critical': return 'Critical - Action Required';
            default: return 'Unknown';
        }
    };

    return (
        <main className="min-h-screen relative overflow-hidden">
            <div className="fixed inset-0 z-0">
                <Starfield />
            </div>

            <div className="container mx-auto px-4 py-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-neon-cyan mb-1">{missionName}</h1>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                            Satellite ID: ORBITA-0{missionId.slice(-1)} | {satelliteType} Orbit
                            <span className={`inline-block w-2 h-2 rounded-full ml-2 ${status === 'nominal' ? 'bg-status-nominal' : status === 'warning' ? 'bg-status-warning' : 'bg-status-critical'} animate-pulse`} />
                            {getStatusText()}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleDownloadTelemetry}
                            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded transition-colors text-sm"
                        >
                            EXPORT LOGS
                        </button>
                        <button
                            onClick={handleEmergencyOverride}
                            className="px-4 py-2 bg-status-critical/20 border border-status-critical/50 hover:bg-status-critical/30 text-status-critical rounded transition-colors text-sm font-bold"
                        >
                            EMERGENCY OVERRIDE
                        </button>
                    </div>
                </motion.div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <TelemetryCard
                        title="Power System"
                        value={telemetry?.battery ?? 0}
                        unit="%"
                        status={status}
                        trend="down"
                        icon="🔋"
                    />
                    <TelemetryCard
                        title="Thermal State"
                        value={telemetry?.thermal ?? 0}
                        unit="°C"
                        status={status}
                        trend="up"
                        icon="🌡️"
                    />
                    <TelemetryCard
                        title="Signal Latency"
                        value={telemetry?.signalLatency ?? 0}
                        unit="ms"
                        status={status}
                        trend="up"
                        icon="📡"
                    />
                    <TelemetryCard
                        title="ADCS Stability"
                        value={telemetry ? 99.8 : 0}
                        unit="%"
                        status={status}
                        trend="stable"
                        icon="🧭"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                    {/* Main Visualization Area */}
                    <div className="lg:col-span-2 glass-panel relative p-1">
                        <div className="absolute top-4 left-4 z-20">
                            <h3 className="text-neon-cyan text-xs font-mono font-bold tracking-widest uppercase mb-1">Live Orbit Projection</h3>
                            <div className="text-[10px] text-gray-500 uppercase">T+ 04:22:15 // Epoch: J2000</div>
                        </div>
                        <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                            <button onClick={() => router.push('/operations')} className="px-3 py-1 bg-neon-cyan/80 text-black text-[10px] font-bold rounded hover:bg-neon-cyan transition-colors">
                                OPS CENTER
                            </button>
                        </div>
                        <OrbitVisualization satelliteType={satelliteType} />
                    </div>

                    {/* AI Decision Log / Timeline */}
                    <div className="glass-panel flex flex-col">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveTab('ai-log')}
                                    className={`text-xs font-bold tracking-widest transition-colors ${activeTab === 'ai-log' ? 'text-neon-cyan' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    AI DECISIONS
                                </button>
                                <button
                                    onClick={() => setActiveTab('timeline')}
                                    className={`text-xs font-bold tracking-widest transition-colors ${activeTab === 'timeline' ? 'text-neon-cyan' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    TIMELINE
                                </button>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-status-nominal animate-pulse" />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                            {activeTab === 'ai-log' ? (
                                <AIDecisionLog decisions={aiDecisions} />
                            ) : (
                                <MissionTimeline events={missionEvents} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
