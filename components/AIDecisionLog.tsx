'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIDecision } from '@/types/mission';

interface AIDecisionLogProps {
    decisions: AIDecision[];
}

export default function AIDecisionLog({ decisions }: AIDecisionLogProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatTime = (date: Date) => {
        if (!mounted) return "--:--:--";
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(new Date(date));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'nominal': return 'text-status-nominal';
            case 'warning': return 'text-status-warning';
            case 'critical': return 'text-status-critical';
            default: return 'text-gray-400';
        }
    };

    const getAutonomyBadge = (mode?: string) => {
        if (!mode) return null;
        let color = 'bg-gray-500/20 text-gray-400';
        if (mode === 'autonomous') color = 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30';
        if (mode === 'supervisory') color = 'bg-orbital-orange/20 text-orbital-orange border-orbital-orange/30';
        if (mode === 'human_required') color = 'bg-red-500/20 text-red-500 border-red-500/30';

        return (
            <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold tracking-wider ${color}`}>
                {mode.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="space-y-3">
            <AnimatePresence>
                {decisions.map((decision, index) => (
                    <motion.div
                        key={decision.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`glass-panel border bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors`}
                        onClick={() => setExpandedId(expandedId === decision.id ? null : decision.id)}
                    >
                        <div className="p-4">
                            {/* Summary Line */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(decision.status)} animate-pulse`} />
                                    <span className="text-xs text-gray-400 font-mono">
                                        {formatTime(decision.timestamp)}
                                    </span>
                                    {getAutonomyBadge(decision.autonomyMode)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-neon-cyan font-mono font-bold">
                                        {(decision.confidence * 100).toFixed(0)}% CONFIDENCE
                                    </span>
                                    <motion.span
                                        animate={{ rotate: expandedId === decision.id ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-neon-cyan text-[10px]"
                                    >
                                        ▼
                                    </motion.span>
                                </div>
                            </div>

                            {/* Global Space State (Omega Primary) */}
                            {decision.global_space_state && (
                                <div className="mb-4">
                                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-neon-cyan/50 mb-1">Global Space State</h4>
                                    <p className="text-xs text-neon-cyan font-bold leading-tight uppercase">
                                        {decision.global_space_state}
                                    </p>
                                </div>
                            )}

                            {/* Core Anomaly/Action (Legacy Mappings) */}
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Anomaly Target</h4>
                                    <p className="text-sm text-white font-medium">{decision.anomaly}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Coordination</h4>
                                    <p className="text-sm text-orbital-orange font-mono truncate uppercase">{decision.action}</p>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {expandedId === decision.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">

                                            {/* Predicted Events */}
                                            {decision.predicted_events && decision.predicted_events.length > 0 && (
                                                <div>
                                                    <h4 className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Predicted Space Events Engine</h4>
                                                    <div className="space-y-1">
                                                        {decision.predicted_events.map((ev, i) => (
                                                            <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded text-[11px] border-l-2 border-neon-cyan">
                                                                <span className="text-gray-200">{ev.event}</span>
                                                                <span className="text-neon-cyan font-mono">{(ev.probability * 100).toFixed(0)}% // {ev.time_horizon}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Counterfactual Insights */}
                                            {decision.counterfactual_insights && (
                                                <div className="bg-orbital-orange/5 p-3 rounded border border-orbital-orange/20">
                                                    <h4 className="text-[10px] font-bold text-orbital-orange mb-1 uppercase tracking-widest">Counterfactual Insight</h4>
                                                    <p className="text-xs text-gray-300 leading-relaxed italic">
                                                        &quot;{decision.counterfactual_insights}&quot;
                                                    </p>
                                                </div>
                                            )}

                                            {/* Behavioral Patterns */}
                                            {decision.detected_patterns && decision.detected_patterns.length > 0 && (
                                                <div>
                                                    <h4 className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Behavioral Fingerprints</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {decision.detected_patterns.map((p, i) => (
                                                            <span key={i} className="text-[9px] bg-white/10 px-2 py-1 rounded text-gray-400 border border-white/5">
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Final Explanation */}
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-widest">Causal Explanation</h4>
                                                <p className="text-xs text-gray-400 border-l border-white/20 pl-3 py-1">
                                                    {decision.reasoning}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {decisions.length === 0 && (
                <div className="glass-panel p-8 text-center text-gray-500 text-sm animate-pulse font-mono tracking-tighter">
                    {'>'} ORBITA-Ω AWAITING PLANETARY TELEMETRY...
                </div>
            )}
        </div>
    );
}
