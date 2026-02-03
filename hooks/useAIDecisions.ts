'use client';

import { useState, useEffect } from 'react';
import { AIDecision, MissionStatus } from '@/types/mission';

const anomalyTypes = [
    'Battery voltage fluctuation detected',
    'Thermal anomaly in solar panel array',
    'Unexpected attitude deviation',
    'Communication signal degradation',
    'Orbital drift detected',
    'Sensor calibration error',
];

const actions = [
    'Initiated battery charge optimization',
    'Adjusted thermal radiator configuration',
    'Executed attitude correction maneuver',
    'Switched to backup communication antenna',
    'Performed orbital correction burn',
    'Recalibrated sensor suite',
];

const reasonings = [
    'Historical data indicates this pattern precedes system failure. Proactive intervention recommended.',
    'Thermal models predict component stress beyond operational limits. Immediate action required.',
    'Deviation exceeds acceptable tolerance for mission objectives. Corrective measures initiated.',
    'Signal quality below threshold for reliable data transmission. Redundant systems activated.',
    'Orbital parameters drifting from planned trajectory. Course correction necessary to maintain mission profile.',
    'Sensor readings inconsistent with expected values. Recalibration will restore measurement accuracy.',
];

export function useAIDecisions(missionId: string | null) {
    const [decisions, setDecisions] = useState<AIDecision[]>([]);

    useEffect(() => {
        if (!missionId) return;

        // Initialize with some historical decisions
        const initialDecisions: AIDecision[] = [
            {
                id: '1',
                timestamp: new Date(Date.now() - 3600000),
                anomaly: 'Battery voltage fluctuation detected',
                action: 'Initiated battery charge optimization',
                reasoning: 'Historical data indicates this pattern precedes system failure. Proactive intervention recommended.',
                confidence: 0.92,
                status: 'warning',
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 1800000),
                anomaly: 'Thermal anomaly in solar panel array',
                action: 'Adjusted thermal radiator configuration',
                reasoning: 'Thermal models predict component stress beyond operational limits. Immediate action required.',
                confidence: 0.88,
                status: 'critical',
            },
        ];

        setDecisions(initialDecisions);

        // Simulate new AI decisions periodically
        const interval = setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance of new decision every interval
                const randomIndex = Math.floor(Math.random() * anomalyTypes.length);
                const statuses: MissionStatus[] = ['nominal', 'warning', 'critical'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

                const newDecision: AIDecision = {
                    id: Date.now().toString(),
                    timestamp: new Date(),
                    anomaly: anomalyTypes[randomIndex],
                    action: actions[randomIndex],
                    reasoning: reasonings[randomIndex],
                    confidence: 0.75 + Math.random() * 0.24, // 0.75 - 0.99
                    status: randomStatus,
                };

                setDecisions(prev => [newDecision, ...prev].slice(0, 20)); // Keep last 20 decisions
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [missionId]);

    return decisions;
}
