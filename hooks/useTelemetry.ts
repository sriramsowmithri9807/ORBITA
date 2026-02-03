'use client';

import { useState, useEffect } from 'react';
import { TelemetryData, MissionStatus } from '@/types/mission';

export function useTelemetry(missionId: string | null) {
    const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
    const [status, setStatus] = useState<MissionStatus>('nominal');

    useEffect(() => {
        if (!missionId) return;

        // Simulate real-time telemetry updates
        const interval = setInterval(() => {
            const battery = Math.max(20, Math.min(100, (telemetry?.battery || 85) + (Math.random() - 0.5) * 5));
            const thermal = Math.max(-20, Math.min(80, (telemetry?.thermal || 22) + (Math.random() - 0.5) * 3));
            const signalLatency = Math.max(50, Math.min(500, (telemetry?.signalLatency || 120) + (Math.random() - 0.5) * 20));

            const newTelemetry: TelemetryData = {
                battery,
                thermal,
                orientation: {
                    roll: Math.random() * 360,
                    pitch: Math.random() * 360,
                    yaw: Math.random() * 360,
                },
                signalLatency,
                timestamp: new Date(),
            };

            setTelemetry(newTelemetry);

            // Determine status based on telemetry
            if (battery < 30 || thermal > 60 || signalLatency > 400) {
                setStatus('critical');
            } else if (battery < 50 || thermal > 45 || signalLatency > 300) {
                setStatus('warning');
            } else {
                setStatus('nominal');
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [missionId, telemetry?.battery, telemetry?.thermal, telemetry?.signalLatency]);

    return { telemetry, status };
}
