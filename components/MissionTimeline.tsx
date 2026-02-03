'use client';

import { motion } from 'framer-motion';
import { MissionEvent } from '@/types/mission';

interface MissionTimelineProps {
    events: MissionEvent[];
}

export default function MissionTimeline({ events }: MissionTimelineProps) {
    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(date);
    };

    const getPhaseColor = (phase: string) => {
        switch (phase) {
            case 'normal':
                return 'bg-status-nominal';
            case 'anomaly':
                return 'bg-status-warning';
            case 'recovery':
                return 'bg-neon-cyan';
            default:
                return 'bg-gray-500';
        }
    };

    const getPhaseIcon = (phase: string) => {
        switch (phase) {
            case 'normal':
                return '✓';
            case 'anomaly':
                return '⚠';
            case 'recovery':
                return '↻';
            default:
                return '•';
        }
    };

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-cyan via-neon-blue to-transparent" />

            <div className="space-y-4">
                {events.map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="relative pl-16"
                    >
                        {/* Timeline node */}
                        <div className={`absolute left-6 top-2 w-5 h-5 rounded-full ${getPhaseColor(event.phase)} 
                           flex items-center justify-center text-xs font-bold text-space-black
                           shadow-[0_0_10px_rgba(0,240,255,0.5)]`}>
                            {getPhaseIcon(event.phase)}
                        </div>

                        {/* Event card */}
                        <div className={`glass-panel p-4 hover:border-neon-cyan/30 transition-all duration-300
                           ${event.severity === 'critical' ? 'alert-critical' :
                                event.severity === 'warning' ? 'alert-warning' :
                                    'alert-nominal'}`}>
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-xs text-gray-400 font-mono">
                                    {formatTime(event.timestamp)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${event.phase === 'normal' ? 'bg-status-nominal/20 text-status-nominal' :
                                        event.phase === 'anomaly' ? 'bg-status-warning/20 text-status-warning' :
                                            'bg-neon-cyan/20 text-neon-cyan'
                                    } font-semibold uppercase tracking-wider`}>
                                    {event.phase}
                                </span>
                            </div>
                            <p className="text-sm text-gray-200">{event.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {events.length === 0 && (
                <div className="glass-panel p-8 text-center">
                    <p className="text-gray-500">No mission events recorded yet</p>
                </div>
            )}
        </div>
    );
}
