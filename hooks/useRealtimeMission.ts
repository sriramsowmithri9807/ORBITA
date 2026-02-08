'use client';

import { useState, useEffect, useRef } from 'react';
import { TelemetryData, AIDecision, MissionStatus } from '@/types/mission';

export function useRealtimeMission(missionId: string | null) {
    const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
    const [decisions, setDecisions] = useState<AIDecision[]>([]);
    const [status, setStatus] = useState<MissionStatus>('nominal');
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!missionId) return;

        // Reset state
        setDecisions([]);
        setTelemetry(null);

        // Connect to WebSocket
        const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8001"}/ws/${missionId}`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log(`Connected to Mission Control Feed for Mission ${missionId}`);
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // 1. Process Telemetry
                if (data.telemetry) {
                    const t = data.telemetry;
                    setTelemetry({
                        battery: t.battery_level,
                        thermal: t.thermal_state,
                        orientation: {
                            roll: t.orientation_roll,
                            pitch: t.orientation_pitch,
                            yaw: t.orientation_yaw,
                        },
                        signalLatency: t.signal_latency,
                        timestamp: new Date(t.timestamp)
                    });

                    // Simple status check on frontend or use backend flag?
                    // We'll trust backend Decision if available, otherwise heuristic
                }

                // 2. Process Decision (Anomaly)
                if (data.decision) {
                    const d = data.decision;
                    console.log("AI DECISION RECEIVED:", d);

                    const newDecision: AIDecision = {
                        id: Date.now().toString(), // or d.id if backend provides
                        timestamp: new Date(),
                        anomaly: d.anomaly_type || 'System Event',
                        action: d.selected_action || 'Monitoring',
                        reasoning: d.explanation,
                        confidence: d.confidence,
                        status: d.anomaly_detected ? 'critical' : 'nominal',

                        // Omega Native Fields
                        global_space_state: d.global_space_state,
                        detected_patterns: d.detected_patterns,
                        predicted_events: d.predicted_events,
                        risk_assessment: d.risk_assessment,
                        coordination_recommendations: d.coordination_recommendations,
                        counterfactual_insights: d.counterfactual_insights,

                        // Cognitive Mission Fields (Legacy Mappings)
                        autonomyMode: d.autonomy_mode,
                        digitalTwinPrediction: d.digital_twin_prediction,
                        verificationResult: d.verification_result,
                        rootCause: d.root_cause_hypothesis
                    };

                    setDecisions(prev => [newDecision, ...prev].slice(0, 50));
                    setStatus('critical'); // Flag UI
                } else {
                    // If good telemetry and no decision, maybe set status to nominal
                    // or let previous status linger for a bit?
                    // For now, if decision is null, we assume nominal unless we have recent critical events
                    // But we don't want to flash back to nominal instantly if anomaly persists
                    // So we only set nominal if no decision received
                    // Actually, let's keep it simple: Status depends on telemetry thresholds or decisions
                }

            } catch (e) {
                console.error("Failed to parse mission data", e);
            }
        };

        socket.onclose = () => {
            console.log("Mission Feed Disconnected");
            setIsConnected(false);
        };

        return () => {
            socket.close();
        };
    }, [missionId]);

    return { telemetry, decisions, status, isConnected };
}
