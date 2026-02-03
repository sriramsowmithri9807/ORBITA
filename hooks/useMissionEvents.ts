'use client';

import { useState, useEffect } from 'react';
import { MissionEvent, MissionPhase, MissionStatus } from '@/types/mission';

const eventDescriptions = {
    normal: [
        'Telemetry data transmission successful',
        'Solar panel deployment confirmed',
        'Orbit insertion burn completed',
        'Communication link established',
        'Sensor calibration completed',
    ],
    anomaly: [
        'Battery temperature spike detected',
        'Unexpected attitude drift observed',
        'Signal interference detected',
        'Micrometeorite impact registered',
        'Power system fluctuation',
    ],
    recovery: [
        'Battery levels stabilized',
        'Attitude control restored',
        'Communication link re-established',
        'Thermal systems normalized',
        'All systems nominal',
    ],
};

export function useMissionEvents(missionId: string | null) {
    const [events, setEvents] = useState<MissionEvent[]>([]);

    useEffect(() => {
        if (!missionId) return;

        // Initialize with mission start events
        const initialEvents: MissionEvent[] = [
            {
                id: '1',
                timestamp: new Date(Date.now() - 7200000),
                phase: 'normal',
                description: 'Mission initiated - All systems nominal',
                severity: 'nominal',
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 5400000),
                phase: 'normal',
                description: 'Orbit insertion burn completed',
                severity: 'nominal',
            },
            {
                id: '3',
                timestamp: new Date(Date.now() - 3600000),
                phase: 'anomaly',
                description: 'Battery temperature spike detected',
                severity: 'warning',
            },
            {
                id: '4',
                timestamp: new Date(Date.now() - 1800000),
                phase: 'recovery',
                description: 'Battery levels stabilized',
                severity: 'nominal',
            },
        ];

        setEvents(initialEvents);

        // Simulate new events
        const interval = setInterval(() => {
            if (Math.random() > 0.6) { // 40% chance of new event
                const phases: MissionPhase[] = ['normal', 'anomaly', 'recovery'];
                const randomPhase = phases[Math.floor(Math.random() * phases.length)];
                const descriptions = eventDescriptions[randomPhase];
                const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];

                let severity: MissionStatus = 'nominal';
                if (randomPhase === 'anomaly') {
                    severity = Math.random() > 0.5 ? 'warning' : 'critical';
                }

                const newEvent: MissionEvent = {
                    id: Date.now().toString(),
                    timestamp: new Date(),
                    phase: randomPhase,
                    description: randomDesc,
                    severity,
                };

                setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events
            }
        }, 8000); // Check every 8 seconds

        return () => clearInterval(interval);
    }, [missionId]);

    return events;
}
