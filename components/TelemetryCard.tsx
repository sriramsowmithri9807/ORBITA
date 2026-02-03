'use client';

import { motion } from 'framer-motion';
import { MissionStatus } from '@/types/mission';

interface TelemetryCardProps {
    title: string;
    value: string | number;
    unit: string;
    status: MissionStatus;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
}

export default function TelemetryCard({ title, value, unit, status, icon, trend }: TelemetryCardProps) {
    const statusColors = {
        nominal: 'border-status-nominal',
        warning: 'border-status-warning',
        critical: 'border-status-critical',
    };

    const statusGlow = {
        nominal: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        warning: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
        critical: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        stable: '→',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`telemetry-card ${statusColors[status]} ${statusGlow[status]}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    {icon && <div className="text-neon-cyan">{icon}</div>}
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
                </div>
                <div className={`status-indicator bg-${status === 'nominal' ? 'status-nominal' : status === 'warning' ? 'status-warning' : 'status-critical'}`} />
            </div>

            <div className="flex items-baseline gap-2">
                <motion.span
                    key={value}
                    initial={{ scale: 1.2, color: '#00f0ff' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    transition={{ duration: 0.3 }}
                    className="text-4xl font-bold"
                >
                    {typeof value === 'number' ? value.toFixed(1) : value}
                </motion.span>
                <span className="text-lg text-gray-400">{unit}</span>
                {trend && (
                    <span className={`ml-auto text-xl ${trend === 'up' ? 'text-status-warning' :
                            trend === 'down' ? 'text-status-critical' :
                                'text-status-nominal'
                        }`}>
                        {trendIcons[trend]}
                    </span>
                )}
            </div>

            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${status === 'nominal' ? 'from-status-nominal to-neon-cyan' :
                            status === 'warning' ? 'from-status-warning to-orbital-orange' :
                                'from-status-critical to-orbital-red'
                        }`}
                />
            </div>
        </motion.div>
    );
}
