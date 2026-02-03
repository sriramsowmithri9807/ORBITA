'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';


interface RecoveryOption {
    action: string;
    risk: string;
}

interface DecisionLog {
    timestamp: string;
    anomaly_detected: string;
    action_taken: string;
    reasoning: string;
    confidence_score: number;
    root_cause?: string;
    recovery_options?: RecoveryOption[];
}

export default function Report() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [narrativeReport, setNarrativeReport] = useState<string>("");

    useEffect(() => {
        const fetchReport = async () => {
            try {
                // Try to fetch from backend
                const res = await fetch('http://localhost:8001/mission/1/report');
                if (res.ok) {
                    const data = await res.json();

                    // Process backend data
                    setReportData({
                        missionId: data.mission_name || 'ORBITA-1',
                        duration: 8.5, // Mock duration
                        totalAnomalies: data.total_anomalies || 0,
                        anomaliesResolved: data.total_anomalies || 0, // Assume resolved for now
                        averageAIConfidence: 0.92, // Mock average
                        successRate: 100,
                        criticalEvents: data.decisions.filter((d: any) => d.confidence_score > 0.9).length,
                        warningEvents: data.decisions.filter((d: any) => d.confidence_score <= 0.9).length,
                        normalEvents: 156,
                        decisions: data.decisions
                    });
                    generateNarrative(data.decisions);
                } else {
                    throw new Error('Backend not reachable');
                }
            } catch (e) {
                console.warn("Backend not found, using simulation", e);
                // Fallback simulation data
                const mockDecisions: DecisionLog[] = [
                    {
                        timestamp: new Date().toISOString(),
                        anomaly_detected: "Thermal Runaway",
                        action_taken: "Deploy Backup Radiators",
                        reasoning: "Internal temperature critical. Component failure imminent.",
                        confidence_score: 0.92,
                        root_cause: "Coolant pump failure or radiator blockage",
                        recovery_options: [
                            { action: "Deploy Backup Radiators", risk: "Medium - Mechanical complexity" },
                            { action: "Enter Spin Stabilization", risk: "High - Disruption to payload" }
                        ]
                    },
                    {
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        anomaly_detected: "Batter Level Critical",
                        action_taken: "Initiate Load Shedding",
                        reasoning: "Battery levels dropped below 20%, risking deep discharge.",
                        confidence_score: 0.95,
                        root_cause: "Solar Panel Misalignment",
                        recovery_options: [
                            { action: "Initiate Load Shedding", risk: "Low" },
                            { action: "Reorient Solar Panels", risk: "Medium" }
                        ]
                    }
                ];

                setReportData({
                    missionId: 'ORBITA-SIM-01',
                    duration: 8.5,
                    totalAnomalies: 2,
                    anomaliesResolved: 2,
                    averageAIConfidence: 0.93,
                    successRate: 100,
                    criticalEvents: 1,
                    warningEvents: 1,
                    normalEvents: 156,
                    decisions: mockDecisions
                });
                generateNarrative(mockDecisions);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, []);

    const generateNarrative = (decisions: any[]) => {
        let text = `MISSION REPORT: ORBITA AUTONOMOUS CONTROL\n`;
        text += `DATE: ${new Date().toLocaleDateString()}\n`;
        text += `------------------------------------------------\n\n`;

        if (!decisions || decisions.length === 0) {
            text += "Mission concluded with nominal parameters. No significant anomalies detected.\n";
        } else {
            text += `Mission encountered ${decisions.length} anomalies during operation.\n\n`;

            decisions.forEach((d, i) => {
                text += `EVENT #${i + 1}: ${d.anomaly_detected || d.anomaly}\n`;
                text += `ROOT CAUSE HYPOTHESIS: ${d.root_cause || "Analysis pending..."}\n`;
                text += `ACTION TAKEN: ${d.action_taken || d.action}\n`;
                text += `AI REASONING: ${d.reasoning}\n`;

                if (d.recovery_options && d.recovery_options.length > 0) {
                    text += `ALTERNATIVE OPTIONS CONSIDERED:\n`;
                    d.recovery_options.forEach((opt: any) => {
                        text += `  - ${opt.action} (Risk: ${opt.risk})\n`;
                    });
                }
                text += `CONFIDENCE: ${(d.confidence_score * 100).toFixed(1)}%\n\n`;
            });
        }
        text += `\nSTATUS: MISSION COMPLETE\n`;
        setNarrativeReport(text);
    };

    const handleExport = () => {
        const element = document.createElement("a");
        const file = new Blob([narrativeReport], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `MissionReport_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    };

    const telemetryHistory = [
        { time: '00:00', battery: 100, thermal: 20 },
        { time: '02:00', battery: 95, thermal: 25 },
        { time: '04:00', battery: 85, thermal: 35 },
        { time: '06:00', battery: 75, thermal: 45 },
        { time: '08:00', battery: 70, thermal: 40 },
    ];

    if (loading) return <div className="min-h-screen bg-space-black flex items-center justify-center text-neon-cyan">Generating Report...</div>;

    return (
        <main className="min-h-screen relative overflow-hidden text-white">


            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-neon-cyan mb-2">Post-Mission Report</h1>
                        <p className="text-gray-400">Mission: {reportData.missionId}</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 
                     transition-colors border border-white/20"
                    >
                        Back to Dashboard
                    </button>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Mission Duration', value: `${reportData.duration}h`, color: 'neon-cyan' },
                        { label: 'Success Rate', value: `${reportData.successRate}%`, color: 'status-nominal' },
                        { label: 'Anomalies Resolved', value: `${reportData.anomaliesResolved}/${reportData.totalAnomalies}`, color: 'orbital-orange' },
                        { label: 'AI Confidence', value: `${(reportData.averageAIConfidence * 100).toFixed(0)}%`, color: 'neon-purple' },
                    ].map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel p-6"
                        >
                            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">{card.label}</h3>
                            <p className={`text-3xl font-bold text-${card.color}`}>{card.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* AI NARRATIVE REPORT */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel p-8 mb-8 border border-neon-cyan/30"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-neon-cyan">AI Mission Narrative</h2>
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan rounded hover:bg-neon-cyan/30 transition-all font-mono text-sm"
                        >
                            DOWNLOAD LOG
                        </button>
                    </div>

                    <div className="font-mono text-sm bg-black/50 p-6 rounded-lg text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto border border-white/10">
                        {narrativeReport}
                    </div>
                </motion.div>

                {/* Event Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-panel p-8 mb-8"
                >
                    <h2 className="text-2xl font-semibold text-neon-cyan mb-6">Event Distribution</h2>
                    <div className="space-y-4">
                        {[
                            { label: 'Normal Operations', count: reportData.normalEvents, color: 'bg-status-nominal', text: 'text-status-nominal' },
                            { label: 'Warning Events', count: reportData.warningEvents, color: 'bg-status-warning', text: 'text-status-warning' },
                            { label: 'Critical Events', count: reportData.criticalEvents, color: 'bg-status-critical', text: 'text-status-critical' }
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-300">{item.label}</span>
                                    <span className={`${item.text} font-semibold`}>{item.count} events</span>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.count / (reportData.normalEvents + reportData.warningEvents + reportData.criticalEvents || 1)) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                                        className={`h-full ${item.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </main>
    );
}
